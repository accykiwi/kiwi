// /pages/api/proxy-price.js

export default async function handler(req, res) {
  const BASE_AMOUNT = 100_000_000;
  const JUPITER_API = 'https://quote-api.jup.ag/v6/quote';

  const TOKENS = [
    {
      mint: '63LfDmNb3MQ8mw9MtZ2To9bEA2M71kZUUGq5tiJxcqj9', // GIGACHAD
      fix: true,
    },
    {
      mint: 'J3NKxxXZcnNiMjKw9hYb2K4LUxgwB6t1FtPtQVsv3KFr', // SPX6900
    },
    {
      mint: '9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump', // Fartcoin
    },
    {
      mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    },
    {
      mint: 'So11111111111111111111111111111111111111112', // SOL
    },
  ];

  const prices = {};

  for (const token of TOKENS) {
    try {
      const quoteUrl = `${JUPITER_API}?inputMint=${token.mint}&outputMint=So11111111111111111111111111111111111111112&amount=${BASE_AMOUNT}&onlyDirectRoutes=true`;

      const resp = await fetch(quoteUrl);
      const data = await resp.json();

      let price = data?.data?.[0]?.outAmount / BASE_AMOUNT;

      if (token.fix) {
        price = price / 1000;
      }

      prices[token.mint] = price || null;
    } catch (e) {
      prices[token.mint] = null;
    }
  }

  res.status(200).json(prices);
}
