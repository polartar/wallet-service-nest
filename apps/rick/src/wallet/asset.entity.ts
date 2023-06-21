import { WalletEntity } from './wallet.entity'
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { ENetworks, getTimestamp } from '@rana/core'
import { TransactionEntity } from './transaction.entity'

@Entity()
export class AssetEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  address: string

  @Column()
  createdAt: number

  @Column('text')
  network: ENetworks

  @Column()
  path: string

  @ManyToOne(() => WalletEntity, (wallet) => wallet.assets)
  wallet: WalletEntity

  @OneToMany(() => TransactionEntity, (transaction) => transaction.asset)
  @JoinColumn()
  transactions: TransactionEntity[]

  @Column('boolean', { default: true })
  isActive = true

  @BeforeInsert()
  public setCreatedAt() {
    this.createdAt = getTimestamp()
  }
}
