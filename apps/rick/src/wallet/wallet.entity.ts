import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { IWalletType } from './wallet.types'
import { AccountEntity } from '../account/account.entity'

@Entity()
export class WalletEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  balance: string

  @Column()
  type: IWalletType

  @Column()
  address: string

  @ManyToOne(() => AccountEntity, (account) => account.wallets)
  account: AccountEntity
}
