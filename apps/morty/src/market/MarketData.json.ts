const ETHMarketData = {
  data: {
    id: 1,
    name: 'Bitcoin',
    symbol: 'BTC',
    is_active: 1,
    is_fiat: 0,
    quotes: [
      {
        timestamp: '2018-06-22T19:29:37.000Z',
        quote: {
          USD: {
            price: 6242.29,
            volume_24h: 4681670000,
            market_cap: 106800038746.48,
            circulating_supply: 4681670000,
            total_supply: 4681670000,
            timestamp: '2018-06-22T19:29:37.000Z',
          },
        },
      },
      {
        timestamp: '2018-06-22T19:34:33.000Z',
        quote: {
          USD: {
            price: 6242.82,
            volume_24h: 4682330000,
            market_cap: 106809106575.84,
            circulating_supply: 4681670000,
            total_supply: 4681670000,
            timestamp: '2018-06-22T19:34:33.000Z',
          },
        },
      },
    ],
  },
  status: {
    timestamp: '2023-02-03T22:59:19.939Z',
    error_code: 0,
    error_message: '',
    elapsed: 10,
    credit_count: 1,
  },
}

const BTCMarketData = {
  data: {
    id: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    is_active: 1,
    is_fiat: 0,
    quotes: [
      {
        timestamp: '2018-06-22T19:29:37.000Z',
        quote: {
          USD: {
            price: 1345.29,
            volume_24h: 4681670000,
            market_cap: 106800038746.48,
            circulating_supply: 4681670000,
            total_supply: 4681670000,
            timestamp: '2018-06-22T19:29:37.000Z',
          },
        },
      },
      {
        timestamp: '2018-06-22T19:34:33.000Z',
        quote: {
          USD: {
            price: 1700.82,
            volume_24h: 4682330000,
            market_cap: 106809106575.84,
            circulating_supply: 4681670000,
            total_supply: 4681670000,
            timestamp: '2018-06-22T19:34:33.000Z',
          },
        },
      },
    ],
  },
  status: {
    timestamp: '2023-02-03T22:59:19.939Z',
    error_code: 0,
    error_message: '',
    elapsed: 10,
    credit_count: 1,
  },
}

export { ETHMarketData, BTCMarketData }
