import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { IWalletType } from './wallet.types'
import { AccountEntity } from '../account/account.entity'
import { RecordEntity } from './record.entity'

@Entity()
export class WalletEntity {
  @PrimaryGeneratedColumn()
  id: number

  @OneToMany(() => RecordEntity, (record) => record.wallet)
  @JoinColumn()
  history: RecordEntity[]

  @Column('text')
  type: IWalletType

  @Column()
  address: string

  @CreateDateColumn()
  createdAt: Date

  @ManyToOne(() => AccountEntity, (account) => account.wallets)
  account: AccountEntity

  @Column('boolean', { default: true })
  isActive = true
}
