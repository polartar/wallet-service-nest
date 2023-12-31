import { WalletEntity } from './wallet.entity'
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { ENetworks, getTimestamp } from '@rana/core'
import { TransactionEntity } from './transaction.entity'
import { NftEntity } from './nft.entity'

@Entity()
export class AssetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  address: string

  @Column()
  publicKey: string

  @Column()
  createdAt: number

  @Column('text')
  network: ENetworks

  @Column()
  index: number

  @ManyToMany(() => WalletEntity, (wallet) => wallet.assets, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  wallets: WalletEntity[]

  @OneToMany(() => TransactionEntity, (transaction) => transaction.asset)
  @JoinColumn()
  transactions: TransactionEntity[]

  @OneToMany(() => NftEntity, (transaction) => transaction.asset)
  @JoinColumn()
  nfts: NftEntity[]

  @BeforeInsert()
  public setCreatedAt() {
    this.createdAt = getTimestamp()
  }
}
