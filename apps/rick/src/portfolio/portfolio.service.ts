import { IWalletType } from './../wallet/wallet.types'
import { Injectable } from '@nestjs/common'
import * as Ethers from 'ethers'
import { Provider } from 'ethers-multicall'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { WalletService } from '../wallet/wallet.service'
import { AccountService } from '../account/account.service'
import { HttpService } from '@nestjs/axios'
import { Logger } from '@nestjs/common'
import { WalletEntity } from '../wallet/wallet.entity'

@Injectable()
export class PortfolioService {
  activeEthWallets: WalletEntity[]
  activeBtcWallets: WalletEntity[]
  provider: Ethers.providers.JsonRpcProvider
  ethcallProvider: Provider

  constructor(
    private configService: ConfigService,
    private readonly walletService: WalletService,
    private readonly accountService: AccountService,
    private readonly httpService: HttpService,
  ) {
    this.initializeWallets()

    const infura_key = this.configService.get<string>(EEnvironment.infuraAPIKey)
    const isProd = this.configService.get<boolean>(EEnvironment.production)
    this.provider = new Ethers.providers.InfuraProvider(
      isProd ? 'mainnet' : 'goerli',
      infura_key,
    )

    this.ethcallProvider = new Provider(this.provider)
    this.ethcallProvider.init()
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
    const calls = wallets.map((wallet) => {
      return this.ethcallProvider.getEthBalance(wallet.address)
    })

    const balances = await this.ethcallProvider.all(calls)

    return {
      wallets,
      balances,
    }
  }

  /**
   * Only update the changed balances in wallet database
   * @param wallets wallets
   * @param balances balances
   */
  async updateWalletHistory(wallets: WalletEntity[], balances: string[]) {
    const updatedWallets = []
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
            timestamp: Math.floor(Date.now() / 1000),
          })
          history.push(record)
          updatedWallets.push(record)
        }
        wallet.history = history
        return wallet
      }),
    )
    if (updatedWallets.length > 0) {
      this.httpService.post(`http://localhost:3000/portfolio/updated`, {
        updatedWallets,
      })

      return this.walletService.updateWallets(this.activeEthWallets)
    }
  }

  runService() {
    this.provider.on('block', async (blockNumber) => {
      const block = await this.provider.getBlock(blockNumber)
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
