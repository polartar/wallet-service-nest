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

  @Column({ nullable: true })
  name: string

  @Column()
  tokenId: string

  @Column()
  collectionAddress: string

  @Column({ nullable: true })
  description: string

  @Column({ nullable: true })
  image: string

  @Column({ nullable: true })
  amount: string

  @Column({ nullable: true })
  externalUrl: string

  @Column({
    type: 'jsonb',
  })
  attributes: INftAttribute[]
}
