import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'
import { isAddress } from 'ethers/lib/utils'

@Injectable()
export class NftPipe implements PipeTransform {
  transform(value: string) {
    if (isAddress(value)) {
      return value
    } else {
      throw new BadRequestException('Invalid Address')
    }
  }
}
