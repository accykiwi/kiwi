// /pages/api/proxy-lp-price.js

export default async function handler(req, res) {
  const BASE_AMOUNT = 100_000_000; // 100 million base units
  const JUPITER_API = 'https://quote-api.jup.ag/v6/quote';

  const PAIRS = [
    { symbol: 'SOL', mint: 'So11111111111111111111111111111111111111112' },
    { symbol: 'Fartcoin', mint: '9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump' },
    { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
  ];

  const prices = {};

  for (const token of PAIRS) {
    try {
      const quoteUrl = `${JUPITER_API}?inputMint=${token.mint}&outputMint=So11111111111111111111111111111111111111112&amount=${BASE_AMOUNT}&onlyDirectRoutes=true`;
      const resp = await fetch(quoteUrl);
      const data = await resp.json();

      const price = data?.data?.[0]?.outAmount / BASE_AMOUNT;

      prices[token.symbol] = price || null;
    } catch (e) {
      prices[token.symbol] = null;
    }
  }

  res.status(200).json(prices);
}
