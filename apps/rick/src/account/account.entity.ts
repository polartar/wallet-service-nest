import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { WalletEntity } from '../wallet/wallet.entity'

@Entity()
export class AccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  accountId: string

  @Column({ nullable: true })
  email: string

  @Column({ nullable: true })
  name: string

  @OneToMany(() => WalletEntity, (wallet) => wallet.account)
  wallets: WalletEntity[]
}
