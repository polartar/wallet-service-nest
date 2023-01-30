import { Injectable } from '@nestjs/common'
import Moralis from 'moralis'
import { EvmChain } from '@moralisweb3/evm-utils'

const ERC20_transfer_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
]

@Injectable()
export class PortfolioService {
  walletAddresses: string[]
  tokenAddresses: string[]

  constructor() {
    this.walletAddresses = []
    this.tokenAddresses = []
    Moralis.start({
      apiKey: process.env.MORALIS_API_KEY,
    })
  }

  async runPortfolioStream() {
    const filter_ERC20 = {
      or: [
        // eslint-disable-next-line array-element-newline
        { eq: ['from', '0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03'] },
        // eslint-disable-next-line array-element-newline
        { eq: ['from', '0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03'] },
      ],
    }

    const options = {
      chains: [EvmChain.GOERLI], // list of blockchains to monitor
      description: 'monitor all ERC20 transfers', // your description
      tag: 'ERC20_transfers', // give it a tag
      abi: ERC20_transfer_ABI,
      includeContractLogs: true,
      topic0: ['Transfer(address,address,uint256)'], // topic of the event
      advancedOptions: [
        {
          topic0: 'Transfer(address,address,uint256)',
          filter: filter_ERC20,
          includeNativeTxs: true,
        },
      ],
      //   filter: filter_ERC20,
      webhookUrl:
        'https://floppy-brooms-argue-181-214-153-115.loca.lt/callback', // webhook url to receive events,
    }
    const stream = await Moralis.Streams.add(options)
    await Moralis.Streams.addAddress({
      id: stream.toJSON().id,
      address: '0xC6340b634362a09f1Bd729B982b33d2cB2d4306e', // Mock address
    })
  }
}
