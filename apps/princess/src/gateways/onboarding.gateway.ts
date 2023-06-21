import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets'
import { Socket } from 'socket.io'
import { AuthService } from '../auth/auth.service'

@WebSocketGateway()
export class OnboardingGateway {
  constructor(private readonly onboardingService: AuthService) {}

  @SubscribeMessage('bootstrap')
  async handleBootstrap(
    @MessageBody('account_id')
    accountId: number,
    @ConnectedSocket() client: Socket,
  ) {
    this.onboardingService.getAccountHash(accountId).then((hash) => {
      client.emit('bootstrap_client', hash)
    })
  }

  // @SubscribeMessage('sync')
  // async handleSync(
  //   @MessageBody()
  //   data: ISyncInput,
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   this.onboardingService
  //     .syncAccount(data.type, data.hash, data.account_id)
  //     .then((response) => {
  //       client.emit('bootstrap_client', response)
  //     })
  // }
}
