import { IBalanceHistory, IWallet, IWalletType } from './../wallet/wallet.types'
import { Injectable } from '@nestjs/common'
import * as Ethers from 'ethers'
import { Provider } from 'ethers-multicall'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { WalletService } from '../wallet/wallet.service'
import { AccountService } from '../account/account.service'

@Injectable()
export class PortfolioService {
  ethWallets: IWallet[]
  btcWallets: IWallet[]
  provider: Ethers.providers.JsonRpcProvider
  ethcallProvider: Provider
  intervalBlocks = 10

  constructor(
    private configService: ConfigService,
    private readonly walletService: WalletService,
    private readonly accountService: AccountService,
  ) {
    this.initializeWallets()
    this.provider = new Ethers.providers.JsonRpcProvider(
      process.env.GOERLI_RPC_URL,
    )
    const infura_key = this.configService.get<string>(EEnvironment.infuraAPIKey)
    this.provider = new Ethers.providers.InfuraProvider('goerli', infura_key)

    this.ethcallProvider = new Provider(this.provider)
    this.ethcallProvider.init()
  }

  initializeWallets = () => {
    this.walletService.getAllWallets().then((wallets) => {
      this.ethWallets = wallets.filter(
        (wallet) => wallet.type === IWalletType.ETHEREUM,
      )
      this.btcWallets = wallets.filter(
        (wallet) => wallet.type === IWalletType.BITCOIN,
      )
    })
  }

  async getEthWallets(): Promise<IWallet[]> {
    return this.ethWallets
  }

  async getBtcWallets(): Promise<IWallet[]> {
    return this.btcWallets
  }

  async getEthBalances(
    wallets: IWallet[],
  ): Promise<{ wallets: IWallet[]; balances: string[] }> {
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
  addWallets(wallets: IWallet[], balances: string[]) {
    const updatedWallets = []
    this.ethWallets = this.ethWallets.map((wallet) => {
      const balanceIndex = wallets.findIndex(
        (newWallet) => newWallet.id === wallet.id,
      )
      const newBalance = balances[balanceIndex].toString()
      // check if the balance is changed
      let balanceHistory: IBalanceHistory[]
      try {
        balanceHistory = JSON.parse(wallet.balanceHistory)
      } catch (err) {
        console.log(err)
      }
      if (!balanceHistory) {
        balanceHistory = []
      }

      if (
        balanceIndex !== -1 &&
        (balanceHistory.length === 0 ||
          balanceHistory[balanceHistory.length - 1].balance !== newBalance)
      ) {
        balanceHistory.push({
          balance: newBalance,
          date: new Date(),
        })
        updatedWallets.push({
          ...wallet,
          balanceHistory: JSON.stringify(balanceHistory),
        })
        return {
          ...wallet,
          balanceHistory: JSON.stringify(balanceHistory),
        }
      }
      return wallet
    })
    this.walletService.updateWallets(updatedWallets)
  }

  runService() {
    let blockCount = 0
    this.provider.on('block', async () => {
      console.log('Run the Portfolio service')
      if (blockCount % this.intervalBlocks === 0) {
        const { wallets, balances } = await this.getEthBalances(this.ethWallets)
        this.addWallets(wallets, balances)
        blockCount = 0
      }
      blockCount++
    })
  }

  async addNewWallet(
    account_id: number,
    newAddress: string,
    type: IWalletType,
    initialBalance?: string,
  ): Promise<IWallet> {
    const account = await this.accountService.lookup({
      id: account_id,
    })
    return this.walletService.addNewWallet({
      account,
      address: newAddress,
      type,
      initialBalance: initialBalance
        ? JSON.stringify({
            balance: initialBalance,
            date: new Date(),
          })
        : null,
    })
  }
}
