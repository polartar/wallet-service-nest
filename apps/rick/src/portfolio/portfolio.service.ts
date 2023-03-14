import { AddressEntity } from './../wallet/address.entity'
import { ICoinType } from './../wallet/wallet.types'
import { Injectable, Logger } from '@nestjs/common'
import * as Ethers from 'ethers'
import { BigNumber } from 'ethers'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { WalletService } from '../wallet/wallet.service'
import { HttpService } from '@nestjs/axios'
import BlockchainSocket = require('blockchain.info/Socket')

@Injectable()
export class PortfolioService {
  activeEthAddresses: AddressEntity[]
  activeBtcAddresses: AddressEntity[]
  provider: Ethers.providers.JsonRpcProvider
  princessAPIUrl: string
  btcSocket

  constructor(
    private configService: ConfigService,
    private readonly walletService: WalletService,
    private readonly httpService: HttpService,
  ) {
    this.initializeWallets()
    // const isProduction = this.configService.get<boolean>(
    //   EEnvironment.isProduction,
    // )
    this.btcSocket = new BlockchainSocket()
    // : new BlockchainSocket({ network: 3 }) // Testnet has error now

    this.btcSocket.onTransaction((transaction) => {
      this.onBTCTransaction(transaction)
    })

    const infura_key = this.configService.get<string>(EEnvironment.infuraAPIKey)
    const isProd = this.configService.get<boolean>(EEnvironment.isProduction)
    this.princessAPIUrl = this.configService.get<string>(
      EEnvironment.princessAPIUrl,
    )
    this.provider = new Ethers.providers.InfuraProvider(
      isProd ? 'mainnet' : 'goerli',
      infura_key,
    )

    this.runEthereumService()
  }

  async onBTCTransaction(transaction) {
    const senderAddresses = transaction.inputs.map(
      (input) => input.prev_out.addr,
    )
    const receiverAddresses = transaction.out.map((out) => out.addr)
    const updatedRecords = []
    const updatedWallets = []

    try {
      this.activeBtcAddresses = await Promise.all(
        this.activeBtcAddresses.map(async (address) => {
          const history = address.history || []
          if (senderAddresses.includes(address.address)) {
            // handle if there are two senders with same address
            const inputs = transaction.inputs
            const index = inputs.findIndex(
              (input) => input.prev_out.addr === address.address,
            )
            const senderInfo = inputs[index]

            inputs.splice(index, 1)

            const currBalance = history.length ? Number(history[0].balance) : 0
            const record = await this.walletService.addHistory({
              address: address,
              from: '',
              to: senderInfo.prev_out.addr,
              hash: transaction.hash,
              amount: senderInfo.prev_out.value.toString(),
              balance: (currBalance - senderInfo.prev_out.value).toString(),
              timestamp: this.walletService.getCurrentTimeBySeconds(),
            })
            history.push(record)
            updatedRecords.push(record)

            address.history = history
          }
          if (receiverAddresses.includes(address.address)) {
            // handle if sender transfer btc to same address more than twice
            const index = transaction.out.findIndex(
              (out) => out.addr === address.address,
            )
            const receiverInfo = transaction.out[index]
            transaction.out.splice(index, 1)
            const currBalance = history.length ? Number(history[0].balance) : 0

            const record = await this.walletService.addHistory({
              address,
              from: receiverInfo.addr,
              to: '',
              amount: receiverInfo.value,
              hash: transaction.hash,
              balance: (currBalance + receiverInfo.value).toString(),
              timestamp: this.walletService.getCurrentTimeBySeconds(),
            })
            history.push(record)
            updatedRecords.push(record)

            address.history = history
          }

          if (
            senderAddresses.includes(address.address) ||
            receiverAddresses.includes(address.address)
          ) {
            updatedWallets.push(address)
          }
          return address
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
    let addresses = await this.walletService.getAllAddresses()
    addresses = addresses.filter((wallet) => wallet.isActive)

    this.activeEthAddresses = addresses.filter(
      (address) => address.wallet.coinType === ICoinType.ETHEREUM,
    )
    this.activeBtcAddresses = addresses.filter(
      (address) => address.wallet.coinType === ICoinType.BITCOIN,
    )
  }

  async getEthWallets(): Promise<AddressEntity[]> {
    return this.activeEthAddresses
  }

  async getBtcWallets(): Promise<AddressEntity[]> {
    return this.activeBtcAddresses
  }

  runEthereumService() {
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

        const currentAddresses: string[] = this.activeEthAddresses.map(
          (address) => address.address.toLowerCase(),
        )
        Promise.allSettled(promises).then(async (results) => {
          const updatedAddresses = []
          await Promise.all(
            results.map(async (tx) => {
              if (tx.status === 'fulfilled') {
                let amount = BigNumber.from(0)
                let updatedAddress: AddressEntity

                if (
                  tx.value.from &&
                  currentAddresses.includes(tx.value.from.toLowerCase())
                ) {
                  const fee = BigNumber.from(tx.value.gasPrice).mul(
                    BigNumber.from(tx.value.gasLimit),
                  )
                  amount = BigNumber.from(tx.value.value).add(fee)
                  updatedAddress = this.activeEthAddresses.find(
                    (address) =>
                      address.address.toLowerCase() ===
                      tx.value.from.toLowerCase(),
                  )
                }
                if (
                  tx.value.to &&
                  currentAddresses.includes(tx.value.to.toLowerCase())
                ) {
                  amount = amount.sub(BigNumber.from(tx.value.value))
                  updatedAddress = this.activeEthAddresses.find(
                    (address) =>
                      address.address.toLowerCase() ===
                      tx.value.to.toLowerCase(),
                  )
                }
                if (!amount.isZero()) {
                  const history = updatedAddress.history
                  const record = await this.walletService.addHistory({
                    address: updatedAddress,
                    from: tx.value.from,
                    to: tx.value.to,
                    amount: tx.value.value.toString(),
                    hash: tx.value.hash,
                    balance: history.length
                      ? BigNumber.from(history[0].balance)
                          .sub(amount)
                          .toString()
                      : BigNumber.from(tx.value.value).toString(),
                    timestamp: this.walletService.getCurrentTimeBySeconds(),
                  })
                  history.push(record)
                  updatedAddress.history = history
                  updatedAddresses.push(updatedAddress)
                }
              }
            }),
          )

          if (updatedAddresses.length > 0) {
            this.httpService.post(`${this.princessAPIUrl}/portfolio/updated`, {
              updatedAddresses,
            })

            return this.walletService.updateWallets(updatedAddresses)
          }
        })
      }
    })
  }
}
