import { Body, Controller, Post } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { VaultSync, VaultSyncSwaggerResponse } from './dto/SigninDto'
import { VaultService } from './vault.service'
import { Public } from '../auth/decorators/public.decorator'

@Controller('vault')
@ApiTags('Vault')
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Post('sync')
  @Public()
  @ApiOkResponse({ type: VaultSyncSwaggerResponse })
  async sync(@Body() data: VaultSync) {
    return this.vaultService.sync(data.parts)
  }
}
