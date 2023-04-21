import { Controller, Get, Query, UsePipes } from '@nestjs/common'
import { NewsService } from './news.service'
import { NewsValidationPipe } from './news.pipe'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import {
  NewsPaginationDto,
  PaginationNewsResponse,
} from './dto/NewsPagination.dto'
import { NewsTopDto, TopNewsResponse } from './dto/NewsTopDto'

@Controller('news')
@ApiTags('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('top')
  @ApiOkResponse({ type: TopNewsResponse })
  @ApiOperation({ summary: 'Get the top news' })
  getLatestNews(@Query() query?: NewsTopDto) {
    return this.newsService.getLatestNews(query.count, query.symbol)
  }

  @Get()
  @ApiOperation({ summary: 'Get the news with pagination' })
  @ApiOkResponse({ type: PaginationNewsResponse })
  @UsePipes(new NewsValidationPipe())
  getNews(
    @Query()
    query: NewsPaginationDto,
  ) {
    return this.newsService.getNews(query)
  }
}
