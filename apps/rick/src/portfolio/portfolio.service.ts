import { Injectable } from '@nestjs/common'
import * as Ethers from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import { Provider } from 'ethers-multicall'

@Injectable()
export class PortfolioService {
  walletAddresses: string[]
  provider: Ethers.providers.JsonRpcProvider
  ethcallProvider: Provider
  constructor() {
    this.walletAddresses = [
      '0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03',
      '0x4c6348bf16FeA56F3DE86553c0653b817bca799A',
      '0x7461f1e5E410d0c457E9273fE3dfDaD3BB0aD7Ed',
    ]
    this.provider = new Ethers.providers.JsonRpcProvider(
      process.env.GOERLI_RPC_URL,
    )
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
