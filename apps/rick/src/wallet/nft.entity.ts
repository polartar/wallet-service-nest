import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { AssetEntity } from './asset.entity'
import { INftAttribute } from './wallet.types'
import { ENetworks } from '@rana/core'

@Entity()
export class NftEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => AssetEntity, (asset) => asset.transactions)
  @JoinColumn()
  asset: AssetEntity

  @Column('text')
  network: ENetworks

  @Column({ nullable: true })
  contractType: string

  @Column()
  ownerOf: string

  @Column()
  hash: string

  @Column()
  name: string

  @Column()
  tokenId: string

  @Column()
  description: string

  @Column()
  image: string

  @Column()
  externalUrl: string

  @Column({
    type: 'jsonb',
  })
  attributes: INftAttribute[]
}
