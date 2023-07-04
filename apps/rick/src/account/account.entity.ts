import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { WalletEntity } from '../wallet/wallet.entity'

@Entity()
export class AccountEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  accountId: number

  @Column({ nullable: true })
  email: string

  @Column({ nullable: true })
  name: string

  @OneToMany(() => WalletEntity, (wallet) => wallet.account)
  wallets: WalletEntity[]
}
