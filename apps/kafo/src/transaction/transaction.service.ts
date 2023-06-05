import { ethers } from 'ethers'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import {
  ENFTTypes,
  IFeeResponse,
  INFTTransactionInput,
  INFTTransactionResponse,
  ITransaction,
  ITransactionInput,
  ITransactionPush,
  ITransactionResponse,
  IVaultTransaction,
} from './transaction.types'
import { firstValueFrom } from 'rxjs'
import { EEnvironment } from '../environments/environment.types'
import { ECoinType } from '@rana/core'
import { formatUnits, hexlify, serializeTransaction } from 'ethers/lib/utils'
import * as Sentry from '@sentry/node'
import * as crypto from 'crypto'

@Injectable()
export class TransactionService {
  blockcypherToken: string
  isProduction: boolean
  provider: ethers.providers.JsonRpcProvider
  ERC721ABI = [
    'function safeTransferFrom(address to, address from, uint256 tokenId)',
  ]
  ERC1155ABI = [
    'function safeTransferFrom(address to, address from, uint256 tokenId, uint256 amount, bytes data)',
  ]
  payloadPrivateKey: string

  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.blockcypherToken = this.configService.get<string>(
      EEnvironment.blockcypherToken,
    )
    this.isProduction = this.configService.get<boolean>(
      EEnvironment.isProduction,
    )
    this.payloadPrivateKey = this.formatPrivateKey(
      this.configService.get<string>(EEnvironment.payloadPrivateKey),
    )

    const infura_key = this.configService.get<string>(EEnvironment.infuraAPIKey)

    this.provider = new ethers.providers.InfuraProvider(
      this.isProduction ? 'mainnet' : 'goerli',
      infura_key,
    )
  }

  formatPrivateKey(key: string) {
    return key?.replace(/\\n/g, '\n')
  }

  signPayload(data: string): string {
    try {
      const signature = crypto.sign(
        'RSA-SHA256',
        Buffer.from(data),
        this.payloadPrivateKey,
      )

      return signature.toString('base64')
    } catch (err) {
      console.log(err)
      throw new InternalServerErrorException('Invalid private key')
    }
  }

  generateVaultTransaction(
    coinType: ECoinType,
    outputTx: ITransaction,
    publicKey: string,
  ): IVaultTransaction {
    const decimal = coinType === ECoinType.BITCOIN ? 8 : 18
    const transaction: IVaultTransaction = {
      type: 2,
      from: outputTx.tx.addresses[0],
      to: outputTx.tx.addresses[1],
      value: {
        value: formatUnits(outputTx.tx.total, decimal),
        factor: 0,
      },
      extra: {
        publicKey: publicKey,
      },
      fee: {
        fee: {
          value: formatUnits(outputTx.tx.fees, decimal),
          factor: 0,
        },
      },
      nativeTransaction: '',
      signingPayloads: [
        {
          address: outputTx.tx.addresses[0],
          publickey: publicKey,
          tosign: outputTx.tosign[0],
        },
      ],
    }

    return transaction
  }

  async generate(data: ITransactionInput): Promise<ITransactionResponse> {
    const newTx = {
      inputs: [{ addresses: [data.from] }],
      outputs: [
        {
          addresses: [data.to],
          value: data.amount,
        },
      ],
    }
    let params = ''
    if (this.isProduction) {
      params =
        data.coinType === ECoinType.BITCOIN
          ? 'btc/main/txs/new?includeToSignTx=true'
          : `eth/main/txs/new?token=${this.blockcypherToken}&includeToSignTx=true`
    } else {
      params =
        data.coinType === ECoinType.BITCOIN
          ? 'btc/test3/txs/new?includeToSignTx=true'
          : `beth/test/txs/new?token=${this.blockcypherToken}includeToSignTx=true`
    }
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `https://api.blockcypher.com/v1/${params}`,
          JSON.stringify(newTx),
        ),
      )

      const vaultTransaction = this.generateVaultTransaction(
        data.coinType,
        response.data as ITransaction,
        data.publicKey,
      )

      const signedPayload = this.signPayload(JSON.stringify(vaultTransaction))
      return {
        success: true,
        data: { ...response.data, signedPayload },
      }
    } catch (err) {
      Sentry.captureException(`generate(): ${err.message}`)

      return {
        success: false,
        error: err.message,
        data: err.response.data,
      }
    }
  }
  async publish(data: ITransactionPush): Promise<ITransactionResponse> {
    let params
    if (this.isProduction) {
      params =
        data.coinType === ECoinType.BITCOIN
          ? 'btc/main/txs/send'
          : `eth/main/txs/send?token=${this.blockcypherToken}`
    } else {
      params =
        data.coinType === ECoinType.BITCOIN
          ? 'btc/test3/txs/send'
          : `beth/test/txs/send?token=${this.blockcypherToken}`
    }
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `https://api.blockcypher.com/v1/${params}`,
          data.transaction,
        ),
      )
      return {
        success: true,
        data: response.data,
      }
    } catch (err) {
      Sentry.captureException(`publish(): ${err.message}`)

      return {
        success: false,
        error: err.message,
        data: err.response.data,
      }
    }
  }

  async getFee(coin: ECoinType): Promise<IFeeResponse> {
    let params
    if (this.isProduction) {
      params = coin === ECoinType.BITCOIN ? 'btc/main' : `eth/main`
    } else {
      params = coin === ECoinType.BITCOIN ? 'btc/test3' : `beth/test`
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: { data: any } = await firstValueFrom(
        this.httpService.get(`https://api.blockcypher.com/v1/${params}`),
      )
      const data = response.data
      const feeObj = {
        high_fee: data.high_fee_per_kb || data.high_gas_price,
        medium_fee: data.medium_fee_per_kb || data.medium_gas_price,
        low_fee: data.low_fee_per_kb || data.low_gas_price,
      }
      const unit = coin == ECoinType.BITCOIN ? 8 : 18
      const convertedObj = {
        high_fee: ethers.utils.formatUnits(feeObj.high_fee.toString(), unit),
        medium_fee: ethers.utils.formatUnits(
          feeObj.medium_fee.toString(),
          unit,
        ),
        low_fee: ethers.utils.formatUnits(feeObj.low_fee.toString(), unit),
      }
      return {
        success: true,
        data: {
          original: feeObj,
          convert: convertedObj,
        },
      }
    } catch (err) {
      Sentry.captureException(`getFee(): ${err.message}`)
      return {
        success: false,
      }
    }
  }

  async generateNFTRawTransaction(
    tx: INFTTransactionInput,
  ): Promise<INFTTransactionResponse> {
    const iface = new ethers.utils.Interface(
      tx.type === ENFTTypes.ERC1155 ? this.ERC1155ABI : this.ERC721ABI,
    )
    const data =
      tx.type === ENFTTypes.ERC1155
        ? iface.encodeFunctionData('safeTransferFrom', [
            tx.from,
            tx.to,
            tx.tokenId,
            tx.amount,
            '0x',
          ])
        : iface.encodeFunctionData('safeTransferFrom', [
            tx.from,
            tx.to,
            tx.tokenId,
          ])
    try {
      const txCount = await this.provider.getTransactionCount(tx.from, 'latest')
      const unsignedTx = {
        nonce: txCount,
        gasPrice: hexlify(await this.provider.getGasPrice()),
        gasLimit: '0x156AB',
        chainId: this.isProduction ? 1 : 5,
        to: tx.contractAddress,
        value: 0,
        data: data, // encoded ABI for the transfer method
      }

      const serializedTx = serializeTransaction(unsignedTx)
      // const signedPayload = this.signPayload(serializedTx)
      return {
        success: true,
        data: serializedTx,
      }
    } catch (err) {
      Sentry.captureException(`generateNFTRawTransaction(): ${err.message}`)

      throw new BadRequestException(err.message)
    }
  }

  async publishNFTTransaction(signedHash: string) {
    try {
      const response = await this.provider.sendTransaction(signedHash)

      return {
        success: true,
        data: response,
      }
    } catch (err) {
      Sentry.captureException(`publishNFTTransaction(): ${err.message}`)

      throw new BadRequestException(err.message)
    }
  }
}
