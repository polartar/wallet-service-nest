import { WalletEntity } from './../wallet/wallet.entity'
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
import { ECoinType, getTimestamp } from '@rana/core'

@Entity()
export class AddressEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  address: string

  @Column()
  createdAt: number

  @Column('text')
  coinType: ECoinType

  @Column()
  path: string

  @ManyToOne(() => WalletEntity, (wallet) => wallet.addresses)
  wallet: WalletEntity

  @OneToMany(() => HistoryEntity, (history) => history.address)
  @JoinColumn()
  history: HistoryEntity[]

  @Column('boolean', { default: true })
  isActive = true

  @BeforeInsert()
  public setCreatedAt() {
    this.createdAt = getTimestamp()
  }
}
