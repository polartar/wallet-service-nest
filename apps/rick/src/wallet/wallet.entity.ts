import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { IWalletType } from './wallet.types'
import { AccountEntity } from '../account/account.entity'

@Entity()
export class WalletEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('text', { nullable: true })
  balanceHistory: string

  @Column('text')
  type: IWalletType

  @Column()
  address: string

  @CreateDateColumn()
  created_at: Date

  @ManyToOne(() => AccountEntity, (account) => account.wallets)
  account: AccountEntity
}
