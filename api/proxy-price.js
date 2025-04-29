export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const tokenPairs = {
    "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump": "<Fartcoin/SOL pair address>",
    "J3NKxxXZcnNiMjKw9hYb2K4LUxgwB6t1FtPtQVsv3KFr": "<SPX/SOL pair address>",
    "63LfDmNb3MQ8mw9MtZ2To9bEA2M71kZUUGq5tiJxcqj9": "<GIGA/SOL pair address>",
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": null, // USDC
    "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R": null  // RAY
  };

  const prices = {};

  for (const [mint, pairAddress] of Object.entries(tokenPairs)) {
    if (!pairAddress) {
      prices[mint] = (mint === "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v") ? 1.0 : null;
      continue;
    }

    try {
      const res = await fetch(`https://api.dexscreener.com/latest/dex/pairs/solana/${pairAddress}`);
      if (!res.ok) {
        console.error(`Error fetching price for ${mint}:`, await res.text());
        prices[mint] = null;
        continue;
      }

      const data = await res.json();
      const priceUsd = data.pair.priceUsd;

      prices[mint] = priceUsd ? parseFloat(priceUsd) : null;

    } catch (error) {
      console.error(`Error processing price for ${mint}:`, error);
      prices[mint] = null;
    }
  }

  return new Response(JSON.stringify({ prices }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
