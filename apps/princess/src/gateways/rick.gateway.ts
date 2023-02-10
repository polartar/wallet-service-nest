import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { PortfolioService } from '../portfolio/portfolio.service'
type IRickSocketData = {
  accountId: number
}
@WebSocketGateway() //, { namespace: 'rick', transports: ['websocket'] })
export class RickGateway {
  @WebSocketServer()
  server: Server

  constructor(private readonly portfolioService: PortfolioService) {}

  @SubscribeMessage('get_portfolio_history')
  async handleMessage(
    @MessageBody()
    data: IRickSocketData,
    @ConnectedSocket() client: Socket,
  ) {
    const channelId = `portfolio_history`
    this.portfolioService
      .getWalletHistory(data.accountId)
      .subscribe((response) => {
        client.emit(channelId, JSON.stringify(response.data))
      })
  }
}
