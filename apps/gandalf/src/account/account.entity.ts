import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class AccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  email: string

  @Column()
  name: string
}
