import { Test, TestingModule } from '@nestjs/testing'
import { NewsService } from './news.service'
import { ConfigModule } from '@nestjs/config'
import { Environment } from './../environments/environment.dev'
import { HttpModule } from '@nestjs/axios'
import { AppModule } from '../app/app.module'

describe('NewsService', () => {
  let service: NewsService

  beforeEach(async () => {
    jest.setTimeout(60000)
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ load: [Environment] }), //
        AppModule,
        HttpModule,
      ],
      providers: [NewsService],
    }).compile()

    service = module.get<NewsService>(NewsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should get top 5 news', async () => {
    const news = await service.getTopNews(5)
    expect((news as { data: [] }).data.length).toBe(5)
  }, 10000)

  it('should get 5 news with pagination', async () => {
    const response = (await service.getNews({
      pageNumber: 1,
      countPerPage: 5,
    })) as {
      success: boolean
      data: { news: []; countPerPage: number; currentPage: number }
    }

    expect(response.data.news.length).toBe(5)
    expect(response.data.currentPage).toBe(1)
  }, 10000)
})
