import { IWalletType } from './../wallet/wallet.types'
import { Injectable, Logger } from '@nestjs/common'
import * as Ethers from 'ethers'
import { Provider } from 'ethers-multicall'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { WalletService } from '../wallet/wallet.service'
import { HttpService } from '@nestjs/axios'
import { WalletEntity } from '../wallet/wallet.entity'
import BlockchainSocket = require('blockchain.info/Socket')

@Injectable()
export class PortfolioService {
  activeEthWallets: WalletEntity[]
  activeBtcWallets: WalletEntity[]
  provider: Ethers.providers.JsonRpcProvider
  ethcallProvider: Provider
  princessAPIUrl: string
  btcSocket

  constructor(
    private configService: ConfigService,
    private readonly walletService: WalletService,
    private readonly httpService: HttpService,
  ) {
    this.initializeWallets()
    this.btcSocket = new BlockchainSocket()
    this.btcSocket.onTransaction((transaction) => {
      this.onBTCTransaction(transaction)
    })

    const infura_key = this.configService.get<string>(EEnvironment.infuraAPIKey)
    const isProd = this.configService.get<boolean>(EEnvironment.production)
    this.princessAPIUrl = this.configService.get<string>(
      EEnvironment.princessAPIUrl,
    )
    this.provider = new Ethers.providers.InfuraProvider(
      isProd ? 'mainnet' : 'goerli',
      infura_key,
    )

    this.ethcallProvider = new Provider(this.provider)
    this.ethcallProvider.init()
  }

  async onBTCTransaction(transaction) {
    const senderAddresses = transaction.inputs.map(
      (input) => input.prev_out.addr,
    )
    const receiverAddresses = transaction.out.map((out) => out.addr)
    const updatedRecords = []
    const updatedWallets = []

    try {
      this.activeBtcWallets = await Promise.all(
        this.activeBtcWallets.map(async (wallet) => {
          const history = wallet.history || []
          if (senderAddresses.includes(wallet.address)) {
            // handle if there are two senders with same address
            const index = transaction.inputs.findIndex(
              (input) => input.prev_out.addr === wallet.address,
            )
            const senderInfo = transaction.inputs[index]

            transaction.inputs.splice(index, 1)

            const currBalance = history.length
              ? Number(history[history.length - 1].balance)
              : 0
            const record = await this.walletService.addRecord({
              wallet: wallet,
              balance: (currBalance - senderInfo.prev_out.value).toString(),
              timestamp: this.walletService.getCurrentTimeBySeconds(),
            })
            history.push(record)
            updatedRecords.push(record)

            wallet.history = history
          }
          if (receiverAddresses.includes(wallet.address)) {
            // handle if sender transfer btc to same address more than twice
            const index = transaction.out.findIndex(
              (out) => out.addr === wallet.address,
            )
            const receiverInfo = transaction.out[index]
            transaction.out.splice(index, 1)
            const currBalance = history.length
              ? Number(history[history.length - 1].balance)
              : 0

            const record = await this.walletService.addRecord({
              wallet: wallet,
              balance: (currBalance + receiverInfo.value).toString(),
              timestamp: this.walletService.getCurrentTimeBySeconds(),
            })
            history.push(record)
            updatedRecords.push(record)

            wallet.history = history
          }

          if (
            senderAddresses.includes(wallet.address) ||
            receiverAddresses.includes(wallet.address)
          ) {
            updatedWallets.push(wallet)
          }
          return wallet
        }),
      )

      if (updatedRecords.length > 0) {
        this.httpService.post(`${this.princessAPIUrl}/portfolio/updated`, {
          updatedRecords,
        })

        return this.walletService.updateWallets(updatedWallets)
      }
    } catch (err) {
      Logger.error(err.message)
    }
  }

  async initializeWallets() {
    let wallets = await this.walletService.getAllWallets()
    wallets = wallets.filter((wallet) => wallet.isActive)
    this.activeEthWallets = wallets.filter(
      (wallet) => wallet.type === IWalletType.ETHEREUM,
    )
    this.activeBtcWallets = wallets.filter(
      (wallet) => wallet.type === IWalletType.BITCOIN,
    )
  }

  async getEthWallets(): Promise<WalletEntity[]> {
    return this.activeEthWallets
  }

  async getBtcWallets(): Promise<WalletEntity[]> {
    return this.activeBtcWallets
  }

  async getEthBalances(
    wallets: WalletEntity[],
  ): Promise<{ wallets: WalletEntity[]; balances: string[] }> {
    if (wallets.length === 0) {
      return {
        wallets: [],
        balances: [],
      }
    }
    const calls = wallets.map((wallet) => {
      return this.ethcallProvider.getEthBalance(wallet.address)
    })
    try {
      const balances = await this.ethcallProvider.all(calls)

      return {
        wallets,
        balances,
      }
    } catch (err) {
      Logger.log(err.message)
      return {
        wallets: [],
        balances: [],
      }
    }
  }

  /**
   * Only update the changed balances in wallet database
   * @param wallets wallets
   * @param balances balances
   */
  async updateWalletHistory(wallets: WalletEntity[], balances: string[]) {
    const updatedRecords = []
    try {
      this.activeEthWallets = await Promise.all(
        this.activeEthWallets.map(async (wallet) => {
          const balanceIndex = wallets.findIndex(
            (newWallet) => newWallet.id === wallet.id,
          )
          const newBalance = balances[balanceIndex].toString()
          const history = wallet.history || []
          // check if the balance is changed
          if (
            balanceIndex !== -1 &&
            (history.length === 0 ||
              history[history.length - 1].balance !== newBalance)
          ) {
            const record = await this.walletService.addRecord({
              wallet: wallet,
              balance: newBalance,
              timestamp: this.walletService.getCurrentTimeBySeconds(),
            })
            history.push(record)
            updatedRecords.push(record)
          }
          wallet.history = history
          wallets[balanceIndex].history = history
          return wallet
        }),
      )
      if (updatedRecords.length > 0) {
        this.httpService.post(`${this.princessAPIUrl}/portfolio/updated`, {
          updatedRecords,
        })

        return this.walletService.updateWallets(wallets)
      }
    } catch (err) {
      Logger.error(err.message)
    }
  }

  runService() {
    this.provider.on('block', async (blockNumber) => {
      let block
      try {
        block = await this.provider.getBlock(blockNumber)
      } catch (err) {
        Logger.error(err.message)
      }
      if (block && block.transactions) {
        const promises = block.transactions.map((txHash) =>
          this.provider.getTransaction(txHash),
        )

        const updatedAddresses = []
        Promise.allSettled(promises).then(async (results) => {
          results.map((tx) => {
            if (
              tx.status === 'fulfilled' &&
              tx.value.value.toString() !== '0'
            ) {
              if (
                tx.value.from &&
                !updatedAddresses.includes(tx.value.from.toLowerCase())
              ) {
                updatedAddresses.push(tx.value.from)
              }
              if (
                tx.value.to &&
                !updatedAddresses.includes(tx.value.to.toLowerCase())
              ) {
                updatedAddresses.push(tx.value.to)
              }
            }
          })
          const { wallets, balances } = await this.getEthBalances(
            this.activeEthWallets.filter((wallet) =>
              updatedAddresses.includes(wallet.address),
            ),
          )
          if (wallets.length !== 0) {
            this.updateWalletHistory(wallets, balances)
          }
        })
      }
    })
  }
}
