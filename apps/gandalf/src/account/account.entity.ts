import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class AccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  email: string

  @Column()
  name: string

  @Column({ nullable: true })
  serverShard: string

  @Column({ nullable: true })
  accountShard: string

  @Column({ nullable: true })
  passcodeKey: string

  @Column({ nullable: true })
  recoveryKey: string

  @Column({ nullable: true })
  iCloudShard: string

  @Column({ nullable: true })
  vaultShard: string
}
