import { Body, Controller, Post } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { VaultSync, VaultSyncSwaggerResponse } from './dto/SigninDto'
import { VaultService } from './vault.service'

@Controller('vault')
@ApiTags('Vault')
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Post('sync')
  @ApiOkResponse({ type: VaultSyncSwaggerResponse })
  async login(@Body() data: VaultSync) {
    return this.vaultService.sync(data.parts)
  }
}
