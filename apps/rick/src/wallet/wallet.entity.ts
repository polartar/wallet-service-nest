import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { AddressEntity } from './address.entity'
import { AccountEntity } from '../account/account.entity'
import { ECoinType, EWalletType } from '@rana/core'

@Entity()
export class WalletEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('text')
  coinType: ECoinType

  @Column('text')
  xPub: string

  @Column('text')
  type: EWalletType

  @Column()
  address: string

  @ManyToMany(() => AccountEntity, (account) => account.wallets)
  @JoinTable()
  accounts: AccountEntity[]

  @OneToMany(() => AddressEntity, (address) => address.wallet)
  @JoinColumn()
  addresses: AddressEntity[]

  @Column('boolean', { default: true })
  isActive = true

  @Column()
  path: string

  @CreateDateColumn()
  createdAt: Date
}
