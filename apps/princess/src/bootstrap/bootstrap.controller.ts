import { BootstrapService } from './bootstrap.service'
import { Controller, Get, Post, Query } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Public } from '../gateway/decorators/public.decorator'
import { CreateDeviceSwaggerResponse } from './dto/create-device.dto'
import { GetInfoSwaggerResponse } from './dto/get-info-swagger.dto'

@Controller('bootstrap')
@ApiTags('bootstrap')
export class BootstrapController {
  constructor(private readonly bootstrapService: BootstrapService) {}

  @Public()
  @Post('device')
  @ApiOkResponse({ type: CreateDeviceSwaggerResponse })
  async createDevice() {
    return this.bootstrapService.createDevice()
  }

  @Public()
  @Get('info')
  @ApiOkResponse({ type: GetInfoSwaggerResponse })
  async getInfo(
    @Query('include-health-checks') isIncludeHealthCheck?: boolean,
  ) {
    return await this.bootstrapService.getInfo(isIncludeHealthCheck)
  }
}
