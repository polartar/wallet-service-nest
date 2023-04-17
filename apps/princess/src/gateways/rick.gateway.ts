import { IRickGetPortfolioHistory } from './rick.types'
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
import { MarketService } from '../market/market.service'

@WebSocketGateway() //, { namespace: 'rick', transports: ['websocket'] })
export class RickGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server

  PORTFOLIO_HISTORY_CHANNEL = 'portfolio_history'
  ACCOUNT_INFO_CHANNEL = 'account_info'

  constructor(
    private readonly portfolioService: PortfolioService,
    private readonly marketService: MarketService,
  ) {}
  afterInit() {
    Logger.log('Init')
    this.marketService.server = this.server
  }

  handleDisconnect(client: Socket) {
    Logger.log(`Client disconnected: ${client.id}`)
    this.portfolioService.removeClient(client.id)
  }

  handleConnection(client: Socket) {
    Logger.log(`Client connected: ${client.id}`)
    // we should get the account Id from the authorization token
    const accountId = 1
    this.portfolioService.addClient(accountId, client)
  }

  @SubscribeMessage('get_portfolio_history')
  async handlePortfolioHistory(
    @MessageBody()
    data: IRickGetPortfolioHistory,
    @ConnectedSocket() client: Socket,
  ) {
    let accountId
    try {
      accountId = await this.portfolioService.getAccountIdFromAccessToken(
        data.access_token,
      )
    } catch (err) {
      client.emit(this.PORTFOLIO_HISTORY_CHANNEL, { error: 'Unauthorized' })
      return
    }
    this.portfolioService.addClient(accountId, client)

    this.portfolioService
      .getWalletHistory(accountId, data.periods)
      .then((response) => {
        client.emit(this.PORTFOLIO_HISTORY_CHANNEL, response)
      })
      .catch((err) => {
        client.emit(this.PORTFOLIO_HISTORY_CHANNEL, { error: err.message })
      })
  }

  @SubscribeMessage('get_account')
  async handleGetAccount(
    @MessageBody()
    data: {
      accountId: number
    },
    @ConnectedSocket() client: Socket,
  ) {
    this.portfolioService.getAccount(data.accountId).subscribe((response) => {
      client.emit(this.ACCOUNT_INFO_CHANNEL, JSON.stringify(response.data))
    })
  }
}
