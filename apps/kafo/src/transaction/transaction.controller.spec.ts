import { ConfigService } from '@nestjs/config'
/* eslint-disable array-element-newline */
import { Test, TestingModule } from '@nestjs/testing'
import { TransactionController } from './transaction.controller'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { Environment } from '../environments/environment.dev'
import { TransactionService } from './transaction.service'
import { ECoinType } from '@rana/core'
import { ENFTTypes, ITransaction, ITransactionInput } from './transaction.types'
import * as bitcoin from 'bitcoinjs-lib'
import * as secp from 'tiny-secp256k1'
import * as ecfacory from 'ecpair'
import { ethers } from 'ethers'
import { parseTransaction } from 'ethers/lib/utils'
import { EEnvironment } from '../environments/environment.types'

describe('TransactionController', () => {
  let controller: TransactionController
  let configService: ConfigService
  const ECPair = ecfacory.ECPairFactory(secp)
  const address = 'mvGvyL7wiueCNfkKrFPN6FfBWwbJPFQ3NL'
  const privKey = Buffer.from([
    0xf9, 0x5c, 0xc2, 0x00, 0xba, 0xd0, 0xc1, 0x06, 0xfe, 0xe1, 0x4f, 0x66,
    0x3e, 0xfe, 0xaa, 0xd8, 0x67, 0x6b, 0x74, 0xa0, 0x5a, 0x3e, 0xc9, 0x16,
    0x5b, 0x1b, 0x08, 0x23, 0x5e, 0x3f, 0x62, 0xb4,
  ])
  const invalidPrivKey = Buffer.from([
    0x3d, 0x18, 0x9f, 0x8d, 0xcf, 0x87, 0x2e, 0x08, 0xaa, 0x32, 0x82, 0xbd,
    0xcf, 0xe2, 0xf2, 0xd8, 0x1e, 0xee, 0xe1, 0xee, 0x7b, 0x7f, 0x7c, 0xdb,
    0x85, 0x98, 0xe6, 0xc1, 0xf2, 0xfa, 0x4e, 0xce,
  ])

  const nftOwnerKey =
    '5ecb74da30aa5afc085813d49d3f57b3c8df459a62e3712114bb90305f7fde97'

  const getRawTransaction = async () => {
    const transactionData: ITransactionInput = {
      from: address,
      to: 'myeuSQtJdvgTKjYL1q9WU13zH3g5aRnjGx',
      amount: 1,
      coinType: ECoinType.BITCOIN,
    }
    return await controller.generateTransaction(transactionData)
  }

  const signTransaction = (privKey: Buffer, transaction: ITransaction) => {
    const keys = ECPair.fromPrivateKey(privKey)

    const tmpTx = transaction
    tmpTx.pubkeys = []
    tmpTx.signatures = tmpTx.tosign.map(function (tosign) {
      tmpTx.pubkeys.push(keys.publicKey.toString('hex'))

      return bitcoin.script.signature
        .encode(keys.sign(Buffer.from(tosign, 'hex')), 0x01)
        .toString('hex')
        .slice(0, -2)
    })
    return tmpTx
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule, //
        ConfigModule.forRoot({ load: [Environment] }),
      ],
      providers: [TransactionService, ConfigService],
      controllers: [TransactionController],
    }).compile()

    controller = module.get<TransactionController>(TransactionController)
    configService = module.get<ConfigService>(ConfigService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should publish the transaction', async () => {
    const newTx = await getRawTransaction()

    const tmpTx = signTransaction(privKey, newTx.data)

    const finalTx = await controller.publishTransaction({
      coinType: ECoinType.BITCOIN,
      transaction: tmpTx,
    })
    expect(finalTx.success).toBeTruthy()
    expect(finalTx.data.tx.outputs[0].value).toBe(1)
  })

  // it('should not publish the transaction with invalid signature', async () => {
  //   const newTx = await getRawTransaction()

  //   // invalid private key
  //   const tmpTx = signTransaction(invalidPrivKey, newTx.data)

  //   const finalTx = await controller.publishTransaction({
  //     coinType: ECoinType.BITCOIN,
  //     transaction: tmpTx,
  //   })

  //   expect(finalTx.success).toBeFalsy()
  //   expect(finalTx.error).toBeDefined()
  // })

  // it('should generate the raw nft transfer transaction', async () => {
  //   const tx = {
  //     from: '0xdBC3A556693CBb5682127864fd80C8ae6976bfcf',
  //     to: '0xdBC3A556693CBb5682127864fd80C8ae6976bfcf',
  //     tokenId: 52852,
  //     type: ENFTTypes.ERC721,
  //     contractAddress: '0xc36442b4a4522e871399cd717abdd847ab11fe88',
  //   }

  //   const response = await controller.generateNFTRawTransaction(tx)
  //   expect(response.success).toBeTruthy()
  // }, 10000)

  // it('should transfer the nft', async () => {
  //   const tx = {
  //     from: '0xdBC3A556693CBb5682127864fd80C8ae6976bfcf',
  //     to: '0xdBC3A556693CBb5682127864fd80C8ae6976bfcf',
  //     tokenId: 52852,
  //     type: ENFTTypes.ERC721,
  //     contractAddress: '0xc36442b4a4522e871399cd717abdd847ab11fe88',
  //   }

  //   const unsignedTxResponse = await controller.generateNFTRawTransaction(tx)

  //   const infura_key = configService.get<string>(EEnvironment.infuraAPIKey)
  //   const provider = new ethers.providers.InfuraProvider('goerli', infura_key)
  //   const signer = new ethers.Wallet(nftOwnerKey, provider)

  //   const unsignedTx = parseTransaction(unsignedTxResponse.data as string)
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   const { type, r, v, s, ...newTx } = unsignedTx

  //   const signedTx = await signer.signTransaction(newTx)
  //   const response = await controller.sendNFTTransaction(signedTx)
  //   expect(response.success).toBeTruthy()
  // }, 40000)
})
