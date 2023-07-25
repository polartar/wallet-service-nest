import { BigNumber, ethers } from 'ethers'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import {
  EAPIMethod,
  ENFTTypes,
  IFeeResponse,
  INFTTransactionInput,
  IVaultTransactionResponse,
  IVaultTransaction,
} from './transaction.types'
import { firstValueFrom } from 'rxjs'
import { EEnvironment } from '../environments/environment.types'
import { ENetworks, EXPubCurrency } from '@rana/core'
import { formatEther, hexlify } from 'ethers/lib/utils'
import * as Sentry from '@sentry/node'
import * as crypto from 'crypto'
import { Transaction } from '@ethereumjs/tx'
import { Common } from '@ethereumjs/common'
import * as BJSON from 'buffer-json'
import zlib = require('zlib')
import * as ur from '@ngraveio/bc-ur'

@Injectable()
export class TransactionService {
  mainnetProvider: ethers.providers.JsonRpcProvider
  testnetProvider: ethers.providers.JsonRpcProvider
  ERC721ABI = [
    'function safeTransferFrom(address to, address from, uint256 tokenId)',
  ]
  ERC1155ABI = [
    'function safeTransferFrom(address to, address from, uint256 tokenId, uint256 amount, bytes data)',
  ]
  payloadPrivateKey: string
  liquidAPIKey: string
  liquidTestAPIKey: string
  liquidAPIUrl: string
  liquidTestAPIUrl: string

  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.payloadPrivateKey = this.formatPrivateKey(
      this.configService.get<string>(EEnvironment.payloadPrivateKey),
    )

    const infura_key = this.configService.get<string>(EEnvironment.infuraAPIKey)
    this.liquidAPIKey = this.configService.get<string>(
      EEnvironment.liquidAPIKey,
    )
    this.liquidTestAPIKey = this.configService.get<string>(
      EEnvironment.liquidTestAPIKey,
    )
    this.liquidAPIUrl = this.configService.get<string>(
      EEnvironment.liquidAPIUrl,
    )
    this.liquidTestAPIUrl = this.configService.get<string>(
      EEnvironment.liquidTestAPIUrl,
    )

    this.mainnetProvider = new ethers.providers.InfuraProvider(
      'mainnet',
      infura_key,
    )
    this.testnetProvider = new ethers.providers.InfuraProvider(
      'goerli',
      infura_key,
    )
  }

  async transactionAPI(
    method: EAPIMethod,
    path: string,
    network: ENetworks,
    body?: unknown,
  ) {
    let apiURL, apiKey, currency
    if (network === ENetworks.ETHEREUM || network === ENetworks.BITCOIN) {
      apiURL = this.liquidAPIUrl
      apiKey = this.liquidAPIKey
    } else {
      apiURL = this.liquidTestAPIUrl
      apiKey = this.liquidAPIKey
    }

    if (network === ENetworks.ETHEREUM || network === ENetworks.ETHEREUM_TEST) {
      currency = EXPubCurrency.ETHEREUM
    } else {
      currency = EXPubCurrency.BITCOIN
    }
    const url = `${apiURL}/api/v1/currencies/${currency}/${path}`

    try {
      const res = await firstValueFrom(
        method === EAPIMethod.POST
          ? this.httpService.post(url, body, {
              headers: { 'api-secret': apiKey },
            })
          : this.httpService.get(url, {
              headers: { 'api-secret': apiKey },
            }),
      )
      return res.data
    } catch (err) {
      if (err.response.data) {
        const message = err.response.data.errors
          ? err.response.data.errors[0]?.title
          : err.response.data
        Sentry.captureException(`${message}: ${url} API call`)
        throw new BadRequestException(message)
      } else {
        Sentry.captureException(`${err.message}: ${url} API call`)
        throw new InternalServerErrorException(err.message)
      }
    }
  }

  async generateTransaction(
    from: string,
    to: string,
    amount: string,
    message: string,
    publicKey: string,
    network: ENetworks,
  ) {
    return await this.transactionAPI(EAPIMethod.POST, `transactions`, network, {
      from,
      to,
      value: {
        value: amount,
        factor: 0,
      },
      extra: {
        transferMessage: message || '',
        publicKey,
      },
    })
  }

  async publish(
    serializedTransaction: string,
    signedPayloads: [],
    network: ENetworks,
  ): Promise<IVaultTransactionResponse> {
    return await this.transactionAPI(
      EAPIMethod.POST,
      'transactions/send',
      network,
      {
        signedPayloads,
        serializedTransaction,
      },
    )
  }

  async getFee(network: ENetworks): Promise<IFeeResponse> {
    let params
    if (network === ENetworks.BITCOIN || network === ENetworks.ETHEREUM) {
      params = network === ENetworks.BITCOIN ? 'btc/main' : `eth/main`
    } else {
      params = network === ENetworks.BITCOIN_TEST ? 'btc/test3' : `beth/test`
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
      const unit =
        network === ENetworks.BITCOIN || network === ENetworks.BITCOIN_TEST
          ? 8
          : 18
      const convertedObj = {
        high_fee: ethers.utils.formatUnits(feeObj.high_fee.toString(), unit),
        medium_fee: ethers.utils.formatUnits(
          feeObj.medium_fee.toString(),
          unit,
        ),
        low_fee: ethers.utils.formatUnits(feeObj.low_fee.toString(), unit),
      }

      return {
        original: feeObj,
        convert: convertedObj,
      }
    } catch (err) {
      Sentry.captureException(`getFee(): ${err.message}`)

      throw new InternalServerErrorException(err.message)
    }
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

  async generateNFTTransaction(
    tx: INFTTransactionInput,
  ): Promise<IVaultTransactionResponse> {
    const nftTransaction = tx as INFTTransactionInput
    const iface = new ethers.utils.Interface(
      nftTransaction.type === ENFTTypes.ERC1155
        ? this.ERC1155ABI
        : this.ERC721ABI,
    )
    const data =
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
    const provider =
      tx.network === ENetworks.ETHEREUM
        ? this.mainnetProvider
        : this.testnetProvider
    try {
      const txCount = await provider.getTransactionCount(tx.from, 'latest')
      const gasPrice = await provider.getGasPrice()
      const txParams = {
        nonce: txCount,
        gasPrice: hexlify(gasPrice),
        gasLimit: '0x156AB',
        to: (tx as INFTTransactionInput).contractAddress,
        value: '0x0',
        data: data,
      }

      const common = new Common({
        chain: Number(tx.network === ENetworks.ETHEREUM ? 1 : 5),
      })
      const nativeTransaction = new Transaction(txParams, {
        common,
      })

      const fee = BigNumber.from('0x156AB').mul(gasPrice)
      const transaction: IVaultTransaction = {
        type: 2,
        from: tx.from,
        to: tx.to,
        value: {
          value: '0',
          factor: 0,
        },
        extra: {
          publicKey: tx.publicKey,
        },
        fee: {
          fee: {
            value: formatEther(fee),
            factor: 0,
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
        ...transaction,
        signedPayload,
        serializedTransaction: this.serializeTransaction(transaction),
      }
    } catch (err) {
      Sentry.captureException(`generateNFTTransaction(): ${err.message}`)

      throw new BadRequestException(err.message)
    }
  }

  async publishNFTTransaction(signedHash: string, network: ENetworks) {
    try {
      const provider =
        network === ENetworks.ETHEREUM
          ? this.mainnetProvider
          : this.testnetProvider
      const response = await provider.sendTransaction(signedHash)

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

  getNetworkInfo(network: ENetworks) {
    switch (network) {
      case ENetworks.ETHEREUM:
        return {
          symbol: 'ETH',
          coinName: 'Ethereum',
          BIP44Index: 60,
        }
      case ENetworks.ETHEREUM_TEST:
        return {
          symbol: 'GETH',
          coinName: 'Ethereum',
          BIP44Index: 60,
        }
      case ENetworks.BITCOIN:
        return {
          symbol: 'BTC',
          coinName: 'Bitcoin',
          BIP44Index: 0,
        }
      case ENetworks.BITCOIN_TEST:
        return {
          symbol: 'TBTC',
          coinName: 'Bitcoin',
          BIP44Index: 1,
        }
    }
  }

  async generateVaultTransaction(
    serializedTransaction: string,
    derivedIndex: number,
    network: ENetworks,
  ) {
    let transaction: IVaultTransaction
    try {
      transaction = JSON.parse(serializedTransaction)
    } catch (err) {
      throw new BadRequestException('The serialized transaction is invalid')
    }

    const signature = this.signPayload(serializedTransaction)

    transaction.signingPayloads = transaction.signingPayloads.map((payload) => {
      payload.derivation = {
        account: 0,
        index: derivedIndex,
      }
      return payload
    })

    transaction.extra = {
      ...transaction.extra,
      serverSignature: signature,
    }

    const networkInfo = this.getNetworkInfo(network)

    const payload = {
      coinName: networkInfo.coinName,
      symbol: networkInfo.symbol,
      ellipticCurve: 'secp256k1',
      BIP44Index: networkInfo.BIP44Index,
      transactions: [transaction],
    }

    const compressed = zlib.gzipSync(JSON.stringify(payload)).toString('base64')

    const packaged = {
      version: '1',
      type: 'tx_sign',
      md5: crypto.createHash('md5').update(compressed, 'utf8').digest('hex'),
      data: compressed,
    }

    const fragmentSize = 90
    const urObj = ur.UR.fromBuffer(Buffer.from(JSON.stringify(packaged)))
    const encoder = new ur.UREncoder(urObj, fragmentSize)

    const parts = []
    for (let i = 0; i < encoder.fragmentsLength * 3; i++)
      parts.push(encoder.nextPart().toUpperCase())

    return parts
  }

  async publishVaultTransaction(
    serializedTransaction: string,
    parts: string[],
    network: ENetworks,
  ) {
    const decoder = new ur.URDecoder()

    try {
      parts.forEach((line) => {
        decoder.receivePart(line)
      })
    } catch (err) {
      Sentry.captureException(
        `publishVaultTransaction(): ${err.message} in ${parts}`,
      )
      throw new BadRequestException(err.message)
    }

    if (!decoder.isSuccess()) {
      Sentry.captureException(
        `publishVaultTransaction(): Some parts are missing in the payload`,
      )

      throw new BadRequestException('Some parts are missing in the payload')
    }

    let transaction

    try {
      const str = JSON.parse(decoder.resultUR().decodeCBOR().toString()).data

      const buf = Buffer.from(str, 'base64')
      const data = zlib.gunzipSync(buf).toString('utf8')
      const obj = JSON.parse(data)

      transaction = JSON.parse(obj.transactions)
    } catch (err) {
      throw new BadRequestException(err.message)
    }

    return await this.publish(
      serializedTransaction,
      transaction.signingPayloads,
      network,
    )
  }
}
