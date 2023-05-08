import { WalletEntity } from './../wallet/wallet.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { HistoryEntity } from './history.entity'
import { ECoinType } from '@rana/core'

@Entity()
export class AddressEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  address: string

  @CreateDateColumn()
  createdAt: Date

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
}
