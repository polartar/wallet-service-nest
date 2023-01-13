import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { CreatePairingDto } from './dto/create-pairing.dto'
import { FindPairingDto } from './dto/find-pairing.dto'
import { PairingEntity } from './pairing.entity'

@Injectable()
export class PairingService {
  constructor(
    @InjectRepository(PairingEntity)
    private readonly pairingRepository: Repository<PairingEntity>,
  ) {}

  create(createPairingDto: CreatePairingDto): Promise<PairingEntity> {
    const pair = new PairingEntity()
    pair.userID = createPairingDto.userID

    return this.pairingRepository.save(pair)
  }

  lookup(findPairingDto: FindPairingDto): Promise<PairingEntity> {
    return this.pairingRepository.findOne({
      where: findPairingDto,
    })
  }
}
