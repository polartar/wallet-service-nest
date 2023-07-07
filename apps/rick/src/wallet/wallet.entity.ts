import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { AccountEntity } from '../account/account.entity'
import { getTimestamp } from '@rana/core'
import { AssetEntity } from './asset.entity'

@Entity()
export class WalletEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('text')
  mnemonic: string

  @Column('text')
  title: string

  @ManyToOne(() => AccountEntity, (account) => account.wallets)
  // @JoinTable({ joinColumn: { referencedColumnName: 'accountId' } })
  @JoinColumn({ name: 'accountId', referencedColumnName: 'accountId' })
  account: AccountEntity

  @ManyToMany(() => AssetEntity, (address) => address.wallets)
  @JoinTable()
  assets: AssetEntity[]

  @Column()
  createdAt: number

  @BeforeInsert()
  public setCreatedAt() {
    this.createdAt = getTimestamp()
  }
}
