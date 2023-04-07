import { Controller, Get, ParseIntPipe, Query, UsePipes } from '@nestjs/common'
import { NewsService } from './news.service'
import { NewsValidationPipe } from './news.pipe'
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { NewsPagination } from './dto/NewsPagination.dto'

@Controller('news')
@ApiTags('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('top')
  @ApiOperation({ summary: 'Get the top news' })
  @ApiQuery({
    name: 'count',
    description: 'count of top news',
  })
  getLatestNews(@Query('count', ParseIntPipe) count?: number) {
    return this.newsService.getLatestNews(count)
  }

  @Get()
  @ApiOperation({ summary: 'Get the news with pagination' })
  @UsePipes(new NewsValidationPipe())
  getNews(
    @Query()
    query: NewsPagination,
  ) {
    return this.newsService.getNews(query)
  }
}
