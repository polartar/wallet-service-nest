import { Injectable } from '@nestjs/common'
import * as Ethers from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import { Provider } from 'ethers-multicall'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { AccountService } from '../account/account.service'

@Injectable()
export class PortfolioService {
  walletAddresses: string[]
  provider: Ethers.providers.JsonRpcProvider
  ethcallProvider: Provider

  constructor(
    private configService: ConfigService,
    private readonly accountService: AccountService,
  ) {
    this.accountService.getAllWalets().then((wallets) => {
      this.walletAddresses = wallets
    })
    this.provider = new Ethers.providers.JsonRpcProvider(
      process.env.GOERLI_RPC_URL,
    )
    const infura_key = this.configService.get<string>(EEnvironment.infuraAPIKey)
    this.provider = new Ethers.providers.InfuraProvider('goerli', infura_key)

    this.ethcallProvider = new Provider(this.provider)
    this.ethcallProvider.init()
  }

  async getCurrentBalances() {
    const calls = this.walletAddresses.map((address) => {
      return this.ethcallProvider.getEthBalance(address)
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

  async addWalletAddress(newAddress: string) {
    this.walletAddresses.push(newAddress)
  }
}
