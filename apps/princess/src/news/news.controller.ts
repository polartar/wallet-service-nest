import { ECoinType } from '@rana/core'
import {
  Controller,
  Get,
  ParseEnumPipe,
  ParseIntPipe,
  Query,
  UsePipes,
} from '@nestjs/common'
import { NewsService } from './news.service'
import { NewsValidationPipe } from './news.pipe'
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { NewsPaginationDto } from './dto/NewsPagination.dto'
import { NewsTopDto } from './dto/NewsTopDto'

@Controller('news')
@ApiTags('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('top')
  @ApiOperation({ summary: 'Get the top news' })
  getLatestNews(@Query() query?: NewsTopDto) {
    return this.newsService.getLatestNews(query.count, query.symbol)
  }

  @Get()
  @ApiOperation({ summary: 'Get the news with pagination' })
  @UsePipes(new NewsValidationPipe())
  getNews(
    @Query()
    query: NewsPaginationDto,
  ) {
    return this.newsService.getNews(query)
  }
}
