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
import { ICoinType, IWalletType } from './wallet.types'
import { AddressEntity } from './address.entity'
import { AccountEntity } from '../account/account.entity'

@Entity()
export class WalletEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('text')
  coinType: ICoinType

  @Column('text')
  xPub: string

  @Column('text')
  type: IWalletType

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
