import { ECoinTypes, EPortfolioType } from '@rana/core'
import { Inject, Injectable, OnModuleInit, forwardRef } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { HttpService } from '@nestjs/axios'
import BlockchainSocket = require('blockchain.info/Socket')
import { ENetworks } from '@rana/core'
import { firstValueFrom } from 'rxjs'
import * as Sentry from '@sentry/node'
import { AssetEntity } from '../wallet/asset.entity'
import { AssetService } from '../asset/asset.service'
import { formatUnits } from 'ethers/lib/utils'
import { ITransaction } from '../asset/asset.types'
import { ETransactionStatuses } from '../wallet/wallet.types'

@Injectable()
export class PortfolioService implements OnModuleInit {
  activeBtcAssets: AssetEntity[]
  activeTestBtcAssets: AssetEntity[]
  princessAPIUrl: string
  btcSocket
  webhookMainnetId: string
  webhookGoerliId: string
  webhookURL = 'https://dashboard.alchemy.com/api/update-webhook-addresses'
  updateWebhookURL =
    'https://dashboard.alchemy.com/api/update-webhook-addresses'
  alchemyAuthToken: string
  btcWebhookURL = 'https://rest.cryptoapis.io/blockchain-events'
  cryptoApiKey: string
  cryptoApiSecretKey: string
  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => AssetService))
    private readonly assetService: AssetService,
    private readonly httpService: HttpService,
  ) {
    this.btcSocket = new BlockchainSocket()

    this.btcSocket.onTransaction((transaction) => {
      this.onBTCTransaction(transaction)
    })

    this.princessAPIUrl = this.configService.get<string>(
      EEnvironment.princessAPIUrl,
    )
    this.webhookGoerliId = this.configService.get<string>(
      EEnvironment.webhookGoerliId,
    )

    this.webhookMainnetId = this.configService.get<string>(
      EEnvironment.webhookMainnetId,
    )
    this.alchemyAuthToken = this.configService.get<string>(
      EEnvironment.alchemyAuthToken,
    )
    this.cryptoApiKey = this.configService.get<string>(
      EEnvironment.cryptoApiKey,
    )
    this.cryptoApiSecretKey = this.configService.get<string>(
      EEnvironment.cryptoApiSecretKey,
    )
    this.addAddressToWebhook(
      '2NE3cqM2qT92fszBR9XvDuBzddeQrzpCBWt',
      ENetworks.BITCOIN_TEST,
    )
  }

  async onModuleInit() {
    const assets = await this.assetService.getAllAssets()
    const ethereumAddresses = assets
      .filter((asset) => asset.network === ENetworks.ETHEREUM)
      .map((asset) => asset.address)
    const goerliAddresses = assets
      .filter((asset) => asset.network === ENetworks.ETHEREUM_TEST)
      .map((asset) => asset.address)

    this.updateAddressesToWebhook(ethereumAddresses, ENetworks.ETHEREUM)
    this.updateAddressesToWebhook(goerliAddresses, ENetworks.ETHEREUM_TEST)
  }

  async updateCurrentWallets() {
    const assets = await this.assetService.getAllAssets()

    this.activeBtcAssets = assets.filter(
      (address) => address.network === ENetworks.BITCOIN,
    )
    this.activeTestBtcAssets = assets.filter(
      (address) => address.network === ENetworks.BITCOIN_TEST,
    )
  }

  getCurrentTimeBySeconds() {
    return Math.floor(Date.now() / 1000)
  }

  async onBTCTransaction(transaction) {
    if (!this.activeBtcAssets) {
      return
    }
    const senderAddresses = transaction.inputs.map(
      (input) => input.prev_out.addr,
    )
    const receiverAddresses = transaction.out.map((out) => out.addr)
    const postUpdatedAddresses = []
    const updatedAddresses = []
    const price = await this.assetService.getCurrentUSDPrice(ECoinTypes.BITCOIN)
    try {
      await Promise.all(
        this.activeBtcAssets.map(async (asset) => {
          // const transactions = asset.transactions || []
          const lastTransaction =
            await this.assetService.getLastTransactionFromAssetId(asset.id)
          const newHistoryData: ITransaction[] = []

          if (senderAddresses.includes(asset.address)) {
            // handle if there are two senders with same address
            const inputs = transaction.inputs
            const index = inputs.findIndex(
              (input) => input.prev_out.addr === asset.address,
            )
            const senderInfo = inputs[index]

            inputs.splice(index, 1)

            const currBalance = lastTransaction
              ? Number(lastTransaction.balance)
              : 0
            const balance = currBalance - senderInfo.prev_out.value
            const weiBalance = formatUnits(balance, 8)
            const weiAmount = formatUnits(senderInfo.prev_out.value, 8)
            newHistoryData.push({
              asset,
              from: asset.address,
              to: senderInfo.prev_out.addr,
              hash: transaction.hash,
              cryptoAmount: senderInfo.prev_out.value.toString(),
              fiatAmount: (+weiAmount * price).toFixed(2),
              balance: balance.toString(),
              usdPrice: (+weiBalance * price).toFixed(2),
              status: ETransactionStatuses.SENT,
              timestamp: this.getCurrentTimeBySeconds(),
              fee: '0',
            })
            await this.assetService.addHistory({
              asset,
              ...newHistoryData[0],
            })
          }
          if (receiverAddresses.includes(asset.address)) {
            // handle if sender transfer btc to same address more than twice
            const index = transaction.out.findIndex(
              (out) => out.addr === asset.address,
            )
            const receiverInfo = transaction.out[index]
            transaction.out.splice(index, 1)
            const currBalance = history.length ? Number(history[0].balance) : 0

            const balance = currBalance + receiverInfo.value
            newHistoryData.push({
              asset,
              from: receiverInfo.addr,
              to: asset.address,
              cryptoAmount: receiverInfo.value,
              status: ETransactionStatuses.RECEIVED,
              fiatAmount: (receiverInfo.value * price).toFixed(2),
              hash: transaction.hash,
              fee: '0',
              balance: balance.toString(),
              usdPrice: (balance * price).toFixed(2),
              timestamp: this.getCurrentTimeBySeconds(),
            })

            const historyData =
              newHistoryData.length === 1
                ? newHistoryData[0]
                : newHistoryData[1]
            await this.assetService.addHistory(historyData)
          }

          if (
            senderAddresses.includes(asset.address) ||
            receiverAddresses.includes(asset.address)
          ) {
            updatedAddresses.push(asset)
            postUpdatedAddresses.push({
              assetId: asset.id,
              walletIds: asset.wallets?.map((wallet) => wallet.id),
              accountIds: asset.wallets?.map((wallet) => wallet.account.id),
              newHistory: newHistoryData[0],
            })
            if (newHistoryData.length === 2) {
              postUpdatedAddresses.push({
                assetId: asset.id,
                walletIds: asset.wallets?.map((wallet) => wallet.id),
                accountIds: asset.wallets?.map((wallet) => wallet.account.id),
                newHistory: newHistoryData[1],
              })
            }
          }
          return asset
        }),
      )

      if (updatedAddresses.length > 0) {
        firstValueFrom(
          this.httpService.post(`${this.princessAPIUrl}/portfolio/updated`, {
            type: EPortfolioType.TRANSACTION,
            data: postUpdatedAddresses,
          }),
        ).catch((err) => {
          Sentry.captureException(`Princess portfolio/updated: ${err.message}`)
        })

        return this.assetService.updateAssets(updatedAddresses)
      }
    } catch (err) {
      Sentry.captureException(`onBTCTransaction(): ${err.message}`)
    }
  }

  async addAddressesToWebhook(
    addresses: string[],
    network: ENetworks,
    isRemove = false,
  ) {
    let webhookId = this.webhookGoerliId

    if (network === ENetworks.ETHEREUM) {
      webhookId = this.webhookMainnetId
    }
    firstValueFrom(
      this.httpService.patch(
        this.webhookURL,
        {
          webhook_id: webhookId,
          addresses_to_add: isRemove ? [] : addresses,
          addresses_to_remove: isRemove ? addresses : [],
        },
        {
          headers: { 'X-Alchemy-Token': this.alchemyAuthToken },
        },
      ),
    ).catch((err) => {
      Sentry.captureException(
        `Princess addAddressesToWebhook(): ${err.message}`,
      )
    })
  }

  async updateAddressesToWebhook(addresses: string[], network: ENetworks) {
    let webhookId = this.webhookGoerliId

    if (network === ENetworks.ETHEREUM) {
      webhookId = this.webhookMainnetId
    }
    firstValueFrom(
      this.httpService.put(
        this.updateWebhookURL,
        {
          webhook_id: webhookId,
          addresses: addresses,
        },
        {
          headers: { 'X-Alchemy-Token': this.alchemyAuthToken },
        },
      ),
    ).catch((err) => {
      Sentry.captureException(
        `Princess updateAddressesToWebhook(): ${err.message}`,
      )
    })
  }

  async addAddressToWebhook(address: string, network: ENetworks) {
    const blockchain =
      network === ENetworks.BITCOIN || network === ENetworks.BITCOIN_TEST
        ? 'bitcoin'
        : 'ethereum'
    const net =
      network === ENetworks.BITCOIN || network === ENetworks.ETHEREUM
        ? 'mainnet'
        : 'testnet'
    firstValueFrom(
      this.httpService.post(
        `${this.btcWebhookURL}/${blockchain}/${net}/subscriptions/address-coins-transactions-confirmed`,
        {
          context: 'subscription',
          data: {
            item: {
              address,
              allowDuplicates: false,
              callbackSecretKey: this.cryptoApiSecretKey,
              callbackUrl:
                'https://mainnet.be.nscribe.xyz/portfolio/transaction-webhook',
              receiveCallbackOn: 3,
            },
          },
        },
        {
          headers: { 'X-Api-Key': this.cryptoApiKey },
        },
      ),
    ).catch((err) => {
      Sentry.captureException(`Princess addAddressToWebhook(): ${err.message}`)
    })
  }
}
