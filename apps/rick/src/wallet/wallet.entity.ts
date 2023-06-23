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
import { EWalletType, getTimestamp } from '@rana/core'
import { AssetEntity } from './asset.entity'

@Entity()
export class WalletEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('text')
  mnemonic: string

  @Column('text')
  title: string

  @Column('text')
  type: EWalletType

  @ManyToOne(() => AccountEntity, (account) => account.wallets)
  @JoinTable()
  account: AccountEntity

  @ManyToMany(() => AssetEntity, (address) => address.wallets)
  @JoinColumn()
  assets: AssetEntity[]

  @Column()
  createdAt: number

  @BeforeInsert()
  public setCreatedAt() {
    this.createdAt = getTimestamp()
  }
}
