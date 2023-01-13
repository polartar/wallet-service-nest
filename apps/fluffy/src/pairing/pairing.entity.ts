import { totp } from 'otplib'
import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { randomBytes, randomUUID } from 'crypto'
import { encode } from 'hi-base32'

@Entity()
export class PairingEntity {
  @PrimaryGeneratedColumn()
  id: number

  @PrimaryGeneratedColumn('uuid')
  deviceID: string

  @Column()
  userID: string

  @Column()
  secret: string

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

  async _generateSecret(len: number = 10) {
    return this._encodeBase32(await this._getRandomKey(len))
  }

  @BeforeInsert()
  async generateSecret() {
    this.secret = await this._generateSecret()
  }
}
