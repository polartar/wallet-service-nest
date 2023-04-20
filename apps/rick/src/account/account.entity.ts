import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm'
import { WalletEntity } from '../wallet/wallet.entity'

@Entity()
export class AccountEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  accountId: number

  @Column()
  email: string

  @Column()
  name: string

  @ManyToMany(() => WalletEntity, (wallet) => wallet.accounts)
  wallets: WalletEntity[]
}
