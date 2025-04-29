// proxy-price.js

export default async function handler(req, res) {
  const BASE_AMOUNT = 100_000_000; // 100 million base units
  const JUPITER_API = 'https://quote-api.jup.ag/v6/quote';

  const TOKENS = [
    {
      symbol: 'GIGACHAD',
      mint: '63LfDmNb3MQ8mw9MtZ2To9bEA2M71kZUUGq5tiJxcqj9',
      fix: 'giga',
    },
    {
      symbol: 'SPX6900',
      mint: 'J3NKxxXZcnNiMjKw9hYb2K4LUxgwB6t1FtPtQVsv3KFr',
    },
    {
      symbol: 'Fartcoin',
      mint: '9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump',
    },
    {
      symbol: 'USDC',
      mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    },
    {
      symbol: 'SOL',
      mint: 'So11111111111111111111111111111111111111112',
    },

    // LP Token Assets – used for LP pricing only
    { symbol: 'LP_SOL', mint: 'So11111111111111111111111111111111111111112' },
    { symbol: 'LP_Fartcoin', mint: '9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump' },
    { symbol: 'LP_USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
  ];

  const prices = {};

  for (const token of TOKENS) {
    try {
      const quoteUrl = `${JUPITER_API}?inputMint=${token.mint}&outputMint=So11111111111111111111111111111111111111112&amount=${BASE_AMOUNT}&onlyDirectRoutes=true`;

      const resp = await fetch(quoteUrl);
      const data = await resp.json();

      let price = data?.data?.[0]?.outAmount / BASE_AMOUNT;

      // Special fix for GIGA
      if (token.fix === 'giga') {
        price = price / 1000;
      }

      prices[token.symbol] = price || null;
    } catch (e) {
      prices[token.symbol] = null;
    }
  }

  res.status(200).json(prices);
}
