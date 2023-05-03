import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm'
import { WalletEntity } from '../wallet/wallet.entity'

@Entity()
export class RickAccountEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  accountId: number

  @Column({ nullable: true })
  email: string

  @Column({ nullable: true })
  name: string

  @ManyToMany(() => WalletEntity, (wallet) => wallet.accounts)
  wallets: WalletEntity[]
}
