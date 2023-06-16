import { BigNumber, ethers } from 'ethers'
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
  ITransactionInput,
  ITransactionResponse,
  IVaultTransaction,
} from './transaction.types'
import { firstValueFrom } from 'rxjs'
import { EEnvironment } from '../environments/environment.types'
import { ECoinType } from '@rana/core'
import { formatEther, hexlify, parseEther } from 'ethers/lib/utils'
import * as Sentry from '@sentry/node'
import * as crypto from 'crypto'
import { Transaction } from '@ethereumjs/tx'
import { Common } from '@ethereumjs/common'
import * as BJSON from 'buffer-json'

@Injectable()
export class TransactionService {
  isProduction: boolean
  provider: ethers.providers.JsonRpcProvider
  ERC721ABI = [
    'function safeTransferFrom(address to, address from, uint256 tokenId)',
  ]
  ERC1155ABI = [
    'function safeTransferFrom(address to, address from, uint256 tokenId, uint256 amount, bytes data)',
  ]
  payloadPrivateKey: string
  liquidApiUrl: string
  liquidApiKey: string

  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.isProduction = this.configService.get<boolean>(
      EEnvironment.isProduction,
    )
    this.payloadPrivateKey = this.formatPrivateKey(
      this.configService.get<string>(EEnvironment.payloadPrivateKey),
    )

    const infura_key = this.configService.get<string>(EEnvironment.infuraAPIKey)
    this.liquidApiUrl = this.configService.get<string>(
      EEnvironment.liquidAPIUrl,
    )
    this.liquidApiKey = this.configService.get<string>(
      EEnvironment.liquidAPIKey,
    )

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
      throw new InternalServerErrorException('Invalid private key')
    }
  }

  async generateBTCTransaction(
    data: ITransactionInput,
  ): Promise<ITransactionResponse> {
    const newTx = {
      from: data.from,
      to: data.to,
      value: {
        value: data.amount,
        factor: 1,
      },
      extra: {
        transferMessage: 'merhaba',
        publicKey: data.publicKey,
      },
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.liquidApiUrl}/api/v1/currencies/segwit.bitcoin.secp256k1/transactions`,
          newTx,
          {
            headers: { 'api-secret': this.liquidApiKey },
          },
        ),
      )

      const tx = BJSON.parse(response.data.serializedTransaction)

      const transaction: IVaultTransaction = {
        type: 1,
        from: data.from,
        to: data.to,
        value: {
          value: data.amount,
          factor: 0,
        },
        extra: {
          publicKey: data.publicKey,
        },
        fee: {
          fee: {
            value: tx.fee,
            factor: 0,
          },
        },
        signingPayloads: [
          {
            address: data.from,
            publickey: data.publicKey,
            tosign: tx.nativeTransaction.getMessageToSign().toString('hex'),
          },
        ],
        nativeTransaction: tx.nativeTransaction,
      }

      const signedPayload = this.signPayload(JSON.stringify(transaction))
      return {
        success: true,
        data: {
          ...transaction,
          signedPayload,
          serializedTransaction: this.serializeTransaction(transaction),
        },
      }
    } catch (err) {
      let msg
      if (err.response && err.response.data) {
        if (err.response.data.errors) {
          msg = err.response.data.errors[0].title
        } else msg = JSON.stringify(err.response.data)
      } else {
        msg = err.message
      }
      Sentry.captureException(`generate(): ${msg}`)

      return {
        success: false,
        error: err.message,
        data: err.response.data,
      }
    }
  }
  async publish(
    serializedTransaction: string,
    signature: string,
    type: ECoinType,
  ): Promise<ITransactionResponse> {
    try {
      const currency =
        type === ECoinType.ETHEREUM
          ? 'ethereum.secp256k1'
          : 'segwit.bitcoin.secp256k1'

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.liquidApiUrl}/api/v1/currencies/${currency}/transactions/send`,
          {
            serializedTransaction,
            signature,
          },
          {
            headers: { 'api-secret': this.liquidApiKey },
          },
        ),
      )
      return {
        success: true,
        data: response.data,
      }
    } catch (err) {
      let msg
      if (err.response && err.response.data) {
        if (err.response.data.errors) {
          msg = err.response.data.errors[0].title
        } else msg = JSON.stringify(err.response.data)
      } else {
        msg = err.message
      }

      Sentry.captureException(`publish(): ${msg}`)

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

  async generateEthereumTransaction(
    tx: INFTTransactionInput | ITransactionInput,
    isNFT: boolean,
  ): Promise<ITransactionResponse> {
    let data

    if (isNFT) {
      const nftTransaction = tx as INFTTransactionInput
      const iface = new ethers.utils.Interface(
        nftTransaction.type === ENFTTypes.ERC1155
          ? this.ERC1155ABI
          : this.ERC721ABI,
      )
      data =
        nftTransaction.type === ENFTTypes.ERC1155
          ? iface.encodeFunctionData('safeTransferFrom', [
              nftTransaction.from,
              nftTransaction.to,
              nftTransaction.tokenId,
              nftTransaction.amount,
              '0x',
            ])
          : iface.encodeFunctionData('safeTransferFrom', [
              nftTransaction.from,
              nftTransaction.to,
              nftTransaction.tokenId,
            ])
    } else {
      data = '0x'
    }
    try {
      const txCount = await this.provider.getTransactionCount(tx.from, 'latest')
      const gasPrice = await this.provider.getGasPrice()
      const txParams = {
        nonce: txCount,
        gasPrice: hexlify(gasPrice),
        gasLimit: '0x156AB',
        to: isNFT ? (tx as INFTTransactionInput).contractAddress : tx.from,
        value: isNFT
          ? '0x0'
          : ethers.utils.hexlify(parseEther(tx.amount as string)),
        data: data,
      }

      const common = new Common({ chain: Number(this.isProduction ? 1 : 5) })
      const nativeTransaction = new Transaction(txParams, {
        common,
      })

      const fee = BigNumber.from('0x156AB').mul(gasPrice)
      const transaction: IVaultTransaction = {
        type: 2,
        from: tx.from,
        to: tx.to,
        value: {
          value: isNFT ? '0' : (tx.amount as string),
          factor: isNFT ? 0 : 1,
        },
        extra: {
          publicKey: tx.publicKey,
        },
        fee: {
          fee: {
            value: formatEther(fee),
            factor: isNFT ? 0 : 1,
          },
        },
        signingPayloads: [
          {
            address: tx.from,
            publickey: tx.publicKey,
            tosign: nativeTransaction.getMessageToSign().toString('hex'),
          },
        ],
        nativeTransaction,
      }

      const signedPayload = this.signPayload(JSON.stringify(transaction))
      return {
        success: true,
        data: {
          ...transaction,
          signedPayload,
          serializedTransaction: this.serializeTransaction(transaction),
        },
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

  serializeTransaction(transaction: IVaultTransaction): string {
    const tx = {
      ...transaction,
      nativeTransaction: transaction?.nativeTransaction
        ? { ...transaction.nativeTransaction }
        : '',
    }
    if (tx.nativeTransaction) {
      tx.nativeTransaction = transaction.nativeTransaction
        .serialize()
        .toString('hex')
    }
    return BJSON.stringify(tx)
  }
}
