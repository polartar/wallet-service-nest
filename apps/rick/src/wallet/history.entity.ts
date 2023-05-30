import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { AddressEntity } from './address.entity'

@Entity()
export class HistoryEntity {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => AddressEntity, (address) => address.history)
  @JoinColumn()
  address: AddressEntity

  @Column()
  balance: string

  @Column()
  from: string

  @Column()
  to: string

  @Column()
  hash: string

  @Column({ nullable: true })
  amount: string

  @Column({ nullable: true })
  tokenId: number

  @Column('bigint')
  timestamp: number
}
