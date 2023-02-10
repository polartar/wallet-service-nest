import { ISockets, IWallet } from './../portfolio/portfolio.types'
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

  PORTFOLIO_HISTORY_CHANNEL = 'portfolio_history'

  constructor(private readonly portfolioService: PortfolioService) {}

  @SubscribeMessage('get_portfolio_history')
  async handleMessage(
    @MessageBody()
    data: IRickSocketData,
    @ConnectedSocket() client: Socket,
  ) {
    this.portfolioService.addClient(data.accountId, client)

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
