import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { PortfolioService } from '../portfolio/portfolio.service'
import { Logger } from '@nestjs/common'

type IRickSocketData = {
  accountId: number
}
@WebSocketGateway() //, { namespace: 'rick', transports: ['websocket'] })
export class RickGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server

  PORTFOLIO_HISTORY_CHANNEL = 'portfolio_history'

  constructor(private readonly portfolioService: PortfolioService) {}
  afterInit() {
    Logger.log('Init')
  }

  handleDisconnect(client: Socket) {
    Logger.log(`Client disconnected: ${client.id}`)
    // this.clients = this.clients.filter((c) => c.sock.id !== client.id)
    this.portfolioService.removeClient(client.id)
  }

  handleConnection(client: Socket) {
    Logger.log(`Client connected: ${client.id}`)
    // we should get the account Id from the authorization token
    const accountId = 1
    this.portfolioService.addClient(accountId, client)
  }

  @SubscribeMessage('get_portfolio_history')
  async handleMessage(
    @MessageBody()
    data: IRickSocketData,
    @ConnectedSocket() client: Socket,
  ) {
    // this.portfolioService.addClient(data.accountId, client)

    this.portfolioService
      .getWalletHistory(data.accountId)
      .subscribe((response) => {
        client.emit(
          this.PORTFOLIO_HISTORY_CHANNEL,
          JSON.stringify(response.data),
        )
      })
  }
}
