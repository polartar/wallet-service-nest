import { Controller, Get, Query, UsePipes } from '@nestjs/common'
import { NewsService } from './news.service'
import { NewsValidationPipe } from './news.pipe'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import {
  NewsPaginationDto,
  PaginationNewsSwaggerResponse,
} from './dto/news-pagination.dto'
// import { NewsTopDto, TopNewsSwaggerResponse } from './dto/news-top.dto'

@Controller('news')
@ApiTags('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @ApiOperation({ summary: 'Get the news with pagination' })
  @ApiOkResponse({ type: PaginationNewsSwaggerResponse })
  @UsePipes(new NewsValidationPipe())
  getNews(
    @Query()
    query: NewsPaginationDto,
  ) {
    return this.newsService.getNews(query)
  }
}
