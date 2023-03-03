/* eslint-disable array-element-newline */
import { Test, TestingModule } from '@nestjs/testing'
import { TransactionController } from './transaction.controller'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { Environment } from '../environments/environment.dev'
import { TransactionService } from './transaction.service'
import { ICoinType, ITransactionInput } from './transaction.types'
import * as bitcoin from 'bitcoinjs-lib'
import * as secp from 'tiny-secp256k1'
import * as ecfacory from 'ecpair'

describe('TransactionController', () => {
  let controller: TransactionController
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
  const getRawTransaction = async () => {
    const transactionData: ITransactionInput = {
      from: address,
      to: 'myeuSQtJdvgTKjYL1q9WU13zH3g5aRnjGx',
      amount: 1,
      coinType: ICoinType.BITCOIN,
    }
    return await controller.generateTransaction(transactionData)
  }

  const signTransaction = (privKey: Buffer, transaction: any) => {
    const keys = ECPair.fromPrivateKey(privKey)

    const tmpTx = transaction
    tmpTx.pubkeys = []
    tmpTx.signatures = tmpTx.tosign.map(function (tosign, n) {
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
      providers: [TransactionService],
      controllers: [TransactionController],
    }).compile()

    controller = module.get<TransactionController>(TransactionController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should publish the transaction', async () => {
    const newTx = await getRawTransaction()

    const tmpTx = signTransaction(privKey, newTx.data)

    const finalTx = await controller.pushTransaction({
      coinType: ICoinType.BITCOIN,
      transaction: tmpTx,
    })
    expect(finalTx.success).toBeTruthy()
    expect(finalTx.data.tx.outputs[0].value).toBe(1)
  })

  it('should not publish the transaction with invalid signature', async () => {
    const newTx = await getRawTransaction()

    // invalid private key
    const tmpTx = signTransaction(invalidPrivKey, newTx.data)

    const finalTx = await controller.pushTransaction({
      coinType: ICoinType.BITCOIN,
      transaction: tmpTx,
    })

    expect(finalTx.success).toBeFalsy()
    expect(finalTx.errors.length).toBeGreaterThan(0)
  })
})
