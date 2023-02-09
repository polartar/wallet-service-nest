import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server } from 'socket.io'
import { PortfolioService } from '../portfolio/portfolio.service'
type IRickSocketData = {
  accountId: number
}
@WebSocketGateway() //, { namespace: 'rick', transports: ['websocket'] })
export class RickGateway {
  @WebSocketServer()
  server: Server

  constructor(private readonly portfolioService: PortfolioService) {}

  @SubscribeMessage('rick')
  async handleMessage(
    @MessageBody()
    data: IRickSocketData,
  ) {
    this.portfolioService
      .getWalletHistory(data.accountId)
      .subscribe((response) => {
        this.server.emit('wallet_history', JSON.stringify(response.data))
      })
  }
}
