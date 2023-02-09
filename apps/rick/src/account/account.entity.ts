import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { WalletEntity } from '../wallet/wallet.entity'

@Entity()
export class AccountEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  email: string

  @Column()
  name: string

  @OneToMany(() => WalletEntity, (wallet) => wallet.account)
  @JoinColumn()
  wallets: WalletEntity[]
}
