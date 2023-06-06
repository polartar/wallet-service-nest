import { Injectable } from '@nestjs/common'
// const bitcoin = require('bitcoinjs-lib')
import * as bjs from 'bitcoinjs-lib'
import BIP32Factory from 'bip32'
import * as ecc from 'tiny-secp256k1'
import b58 = require('bs58check')
import { hdkey } from 'ethereumjs-wallet'

@Injectable()
export class XpubService {
  constructor() {
    this.discoverAddresses()
  }

  anypubToXpub(xyzpub) {
    let data = b58.decode(xyzpub)
    data = data.slice(4)
    data = Buffer.concat([Buffer.from('043587cf', 'hex'), data])
    return b58.encode(data)
  }
  async discoverAddresses() {
    const xpub =
      'vpub5YrRyVwDdS4ME6Jyy4qYSgu14JyAzh4B3s9uXfitjdCoFffGeC9iSxCf722LmJ9y5v1SvN4F25Hukw8XYj2vZC1xchB8BsRsXLmm8NNEp5e'
    const bip32 = BIP32Factory(ecc)

    const { address: address } = bjs.payments.p2pkh({
      pubkey: bip32
        .fromBase58(this.anypubToXpub(xpub), bjs.networks.testnet)
        .derive(0).publicKey,
      network: bjs.networks.testnet,
    })
    console.log({ address })
  }
  async discoverEthAddresses() {
    // const extPubKey =
    //   'xpub6BzwKCWVs4F9cpmYundX3PjbqcPqERCXKCAw8SRKQgXd1ybTxi338A2Ep6EbGhFp7up4L7PDWivUtnYNC79MWo6wN5SqzrhksQVJupArUxD'

    // const hdwallet = hdkey.fromExtendedKey(extPubKey)
    // const wallet = hdwallet.getWallet()
    // const address = wallet.getAddress()

    // console.log(`Address: 0x${address.toString('hex')}`)

    const hdWallet = hdkey.fromExtendedKey(
      'xpub6BzwKCWVs4F9cpmYundX3PjbqcPqERCXKCAw8SRKQgXd1ybTxi338A2Ep6EbGhFp7up4L7PDWivUtnYNC79MWo6wN5SqzrhksQVJupArUxD',
    )
    const hdPath = 'm/44/60/0/0/0'
    const node = hdWallet.derivePath(hdPath)
    const nodeWallet = node.getWallet()
    const address = nodeWallet.getAddressString()
    console.log(address)
  }
}
