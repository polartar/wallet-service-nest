import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { AddressEntity } from './address.entity'
import { AccountEntity } from '../account/account.entity'
import { EWalletType, getTimestamp } from '@rana/core'

@Entity()
export class WalletEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('text')
  xPub: string

  @Column('text')
  type: EWalletType

  @ManyToMany(() => AccountEntity, (account) => account.wallets)
  @JoinTable()
  accounts: AccountEntity[]

  @OneToMany(() => AddressEntity, (address) => address.wallet)
  @JoinColumn()
  addresses: AddressEntity[]

  @Column('boolean', { default: true })
  isActive = true

  @Column()
  createdAt: number

  @BeforeInsert()
  public setCreatedAt() {
    this.createdAt = getTimestamp()
  }
}
