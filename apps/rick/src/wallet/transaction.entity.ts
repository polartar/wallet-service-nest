import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { AssetEntity } from './asset.entity'
import { ETransactionStatuses } from './wallet.types'

@Entity()
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => AssetEntity, (asset) => asset.transactions)
  @JoinColumn()
  asset: AssetEntity

  @Column()
  balance: string

  @Column({ nullable: true })
  usdPrice: string

  @Column()
  from: string

  @Column()
  to: string

  @Column()
  hash: string

  @Column({ nullable: true })
  cryptoAmount: string

  @Column({ nullable: true })
  fiatAmount: string

  @Column({ nullable: true })
  fee: string

  @Column({ nullable: true })
  tokenId: number

  @Column('bigint')
  timestamp: number

  @Column('bigint')
  @Column({ nullable: true })
  blockNumber?: number

  @Column('text')
  status: ETransactionStatuses

  toJSON() {
    return {
      from: this.from,
      to: this.to,
      balance: this.balance,
      usdPrice: this.usdPrice,
      hash: this.hash,
      fee: this.fee,
      cryptoAmount: this.cryptoAmount,
      fiatAmount: this.fiatAmount,
      tokenId: this.tokenId,
      timestamp: +this.timestamp,
    }
  }
}
