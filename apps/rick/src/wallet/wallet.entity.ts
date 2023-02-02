import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { IWalletType } from './wallet.types'
import { AccountEntity } from '../account/account.entity'
import { AddressEntity } from '../address/address.entity'

@Entity()
export class WalletEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('text')
  type: IWalletType

  @Column()
  publicKey: string

  @CreateDateColumn()
  created_at: Date

  @ManyToMany(() => AccountEntity, (account) => account.wallets)
  accounts: AccountEntity[]

  @OneToMany(() => AddressEntity, (address) => address.wallet)
  @JoinColumn()
  addresses: AddressEntity[]
}
