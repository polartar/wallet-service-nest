import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
export class PairingEntity {
  @Column()
  userId: string

  @PrimaryColumn()
  deviceId: string
}
