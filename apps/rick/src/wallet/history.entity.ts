import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { AssetEntity } from './asset.entity'

@Entity()
export class HistoryEntity {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => AssetEntity, (address) => address.history)
  @JoinColumn()
  asset: AssetEntity

  @Column()
  balance: string

  @Column()
  from: string

  @Column()
  to: string

  @Column()
  hash: string

  @Column({ nullable: true })
  amount: string

  @Column({ nullable: true })
  tokenId: string

  @Column('bigint')
  timestamp: number

  toJSON() {
    return {
      from: this.from,
      to: this.to,
      balance: this.balance,
      amount: this.amount,
      tokenId: this.tokenId,
      timestamp: +this.timestamp,
    }
  }
}
