import { IWallet, IWalletType } from './../wallet/wallet.types'
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
      this.addWallet(
        1,
        '0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03',
        IWalletType.ETHEREUM,
      )
    })
  }

  async getCurrentBalances() {
    const calls = this.ethWallets.map((wallet) => {
      return this.ethcallProvider.getEthBalance(wallet.address)
    })

    const balances = await this.ethcallProvider.all(calls)
    console.log({ balances })
  }

  runService() {
    this.provider.on('block', () => {
      console.log('Latest')
      this.getCurrentBalances()
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
