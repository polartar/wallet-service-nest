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
    const history = await this.portfolioService.getWalletHistory(data.accountId)
    this.server.emit('wallet_history', JSON.stringify(history))
  }
}
