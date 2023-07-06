import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { randomBytes } from 'crypto'
import { encode } from 'hi-base32'

@Entity()
export class DeviceEntity {
  @PrimaryGeneratedColumn('uuid')
  deviceId: string

  @Column({ nullable: true })
  userId: string

  @Column()
  secret: string

  @Column({ nullable: true })
  serverShard: string

  @Column({ nullable: true })
  accountShard: string

  @Column({ nullable: true })
  passcodeKey: string

  @Column({ nullable: true })
  recoveryKey: string

  @Column({ nullable: true })
  iCloudshard: string

  @Column({ nullable: true })
  vaultShard: string

  async _getRandomKey(len: number) {
    return new Promise<string>((resolve) =>
      randomBytes(len, (_error, buffer) => {
        resolve(buffer.toString())
      }),
    )
  }

  private _encodeBase32(key: string) {
    return encode(key)
  }

  async _generateSecret(len = 10) {
    return this._encodeBase32(await this._getRandomKey(len))
  }

  @BeforeInsert()
  async generateSecret() {
    this.secret = await this._generateSecret()
  }
}
