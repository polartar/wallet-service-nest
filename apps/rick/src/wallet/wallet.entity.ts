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
import { Exclude } from 'class-transformer'

@Entity()
export class WalletEntity {
  @PrimaryGeneratedColumn()
  id: number

  @OneToMany(() => RecordEntity, (recond) => recond.wallet)
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
