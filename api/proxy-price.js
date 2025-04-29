// /pages/api/proxy-price.js

export default async function handler(req, res) {
  const BASE_AMOUNT = 100_000_000;
  const JUPITER_API = 'https://quote-api.jup.ag/v6/quote';

  const MINTS = {
    'GIGACHAD': '63LfDmNb3MQ8mw9MtZ2To9bEA2M71kZUUGq5tiJxcqj9',
    'SPX6900': 'J3NKxxXZcnNiMjKw9hYb2K4LUxgwB6t1FtPtQVsv3KFr',
    'Fartcoin': '9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump',
    'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    'SOL': 'So11111111111111111111111111111111111111112',
  };

  const prices = {};

  const mintKeys = Object.keys(MINTS);

  for (const symbol of mintKeys) {
    const mint = MINTS[symbol];
    try {
      const quoteUrl = `${JUPITER_API}?inputMint=${mint}&outputMint=So11111111111111111111111111111111111111112&amount=${BASE_AMOUNT}&onlyDirectRoutes=true`;

      const resp = await fetch(quoteUrl);
      const data = await resp.json();

      if (!data?.data?.[0]?.outAmount) {
        prices[mint] = null;
        continue;
      }

      let price = data.data[0].outAmount / BASE_AMOUNT;

      // Special fix only for GIGACHAD
      if (symbol === 'GIGACHAD') {
        price = price / 1000;
      }

      // Return price by mint address, not symbol
      prices[mint] = price;
    } catch (error) {
      prices[mint] = null;
    }
  }

  res.status(200).json(prices);
}
