import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { IAddressType } from './address.types'
import { WalletEntity } from '../wallet/wallet.entity'
import { Wallet } from 'ethers'

@Entity()
export class AddressEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  balance: string

  @Column('text')
  type: IAddressType

  @Column()
  address: string

  @CreateDateColumn()
  created_at: Date

  @ManyToOne(() => WalletEntity, (wallet) => wallet.addresses)
  wallet: Wallet
}
