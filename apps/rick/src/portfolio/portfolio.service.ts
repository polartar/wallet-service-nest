import { IBalanceData, IWallet, IWalletType } from './../wallet/wallet.types'
import { Injectable } from '@nestjs/common'
import * as Ethers from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import { Provider } from 'ethers-multicall'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
// import { AccountService } from '../account/account.service'
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
    this.walletService.getAllWalets().then((wallets) => {
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
    console.log({ balances })
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
  updateWalletBalances(wallets: IWallet[], balances: string[]) {
    const updatedBalances = []
    this.ethWallets = this.ethWallets.map((wallet) => {
      const balanceIndex = wallets.findIndex(
        (newWallet) => newWallet.id === wallet.id,
      )
      const newBalance = balances[balanceIndex].toString()
      if (balanceIndex !== -1 && wallet.balance !== newBalance) {
        updatedBalances.push({
          id: wallet.id,
          balance: newBalance,
        })
        return {
          ...wallet,
          balance: newBalance,
        }
      }
      return wallet
    })
    this.walletService.updateBalances(updatedBalances)
  }

  runService() {
    let blockCount = 0
    this.provider.on('block', async () => {
      console.log('Run the Portfolio service')
      if (blockCount % this.intervalBlocks === 0) {
        const { wallets, balances } = await this.getEthBalances(this.ethWallets)
        this.updateWalletBalances(wallets, balances)
        blockCount = 0
      }
      blockCount++
    })
  }

  async addWallet(
    account_id: number,
    newAddress: string,
    type: IWalletType,
  ): Promise<{ status: boolean; message?: string; data?: IWallet }> {
    let existingWallet: IWallet
    if (type === IWalletType.ETHEREUM) {
      existingWallet = this.ethWallets.find(
        (wallet) => wallet.address === newAddress,
      )
      if (!existingWallet) {
        this.ethWallets.push({
          address: newAddress,
          balance: '',
          type,
        })
      }
    } else {
      this.btcWallets.push({
        address: newAddress,
        balance: '',
        type,
      })
    }
    if (!existingWallet) {
      const account = await this.accountService.lookup({
        id: account_id,
      })
      const response = await this.walletService.addWallets({
        account: account,
        address: newAddress,
        type,
        balance: '',
      })
      return {
        status: true,
        data: response,
      }
    } else {
      return {
        status: false,
        message: 'already exist',
      }
    }
  }
}
