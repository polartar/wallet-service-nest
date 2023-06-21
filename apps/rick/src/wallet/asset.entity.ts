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
import { HistoryEntity } from './history.entity'
import { ENetworks, getTimestamp } from '@rana/core'

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

  @OneToMany(() => HistoryEntity, (history) => history.asset)
  @JoinColumn()
  history: HistoryEntity[]

  @Column('boolean', { default: true })
  isActive = true

  @BeforeInsert()
  public setCreatedAt() {
    this.createdAt = getTimestamp()
  }
}
