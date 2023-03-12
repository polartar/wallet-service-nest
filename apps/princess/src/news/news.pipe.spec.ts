import { ESort, INewsQuery } from './news.types'
import { NewsValidationPipe } from './news.pipe'
import { BadRequestException } from '@nestjs/common'

describe('News Pipe', () => {
  const pipe = new NewsValidationPipe()
  it('Should reject wrong pageNumber', () => {
    expect(() =>
      pipe.transform({
        sort: ESort.ASC,
        pageNumber: 0,
      }),
    ).toThrow(BadRequestException)
  })

  it('Should reject wrong countPerPage', () => {
    expect(() =>
      pipe.transform({
        sort: ESort.ASC,
        countPerPage: 0,
      }),
    ).toThrow(BadRequestException)
  })

  it('Should reject wrong date', () => {
    expect(() =>
      pipe.transform({
        sort: ESort.ASC,
        startTime: 'wrong date' as unknown as Date,
      }),
    ).toThrow(BadRequestException)
  })

  it('Should accept good news', () => {
    const newsBody: INewsQuery = {
      sort: ESort.ASC,
      pageNumber: 1,
    }

    expect(pipe.transform(newsBody)).toBe(newsBody)
  })
})
