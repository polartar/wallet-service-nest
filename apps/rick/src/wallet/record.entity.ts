import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { WalletEntity } from '../wallet/wallet.entity'

@Entity()
export class RecordEntity {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => WalletEntity, (wallet) => wallet.history)
  @JoinColumn()
  wallet: WalletEntity

  @Column()
  balance: string

  @Column('bigint')
  timestamp: number

  toJSON() {
    return {
      balance: this.balance,
      timestamp: this.timestamp,
    }
  }
}
