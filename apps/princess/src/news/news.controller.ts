import { Controller, Get, ParseIntPipe, Query, UsePipes } from '@nestjs/common'
import { NewsService } from './news.service'
import { NewsValidationPipe } from './news.pipe'
import { ApiQuery, ApiTags } from '@nestjs/swagger'
import { NewsPagination } from './dto/NewsPagination.dto'

@Controller('news')
@ApiTags('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('top')
  @ApiQuery({
    name: 'count',
    description: 'current page number',
  })
  getTopNews(@Query('count', ParseIntPipe) count?: number) {
    return this.newsService.getTopNews(count)
  }

  @Get()
  @UsePipes(new NewsValidationPipe())
  getNews(
    @Query()
    query: NewsPagination,
  ) {
    return this.newsService.getNews(query)
  }
}
