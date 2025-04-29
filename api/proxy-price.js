export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const tokenPairs = {
    "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump": "8hfPCXX2MvmSY8FuC9QUy3P3C8MjMLK1qvErsVuCTeRo", // Fartcoin
    "J3NKxxXZcnNiMjKw9hYb2K4LUxgwB6t1FtPtQVsv3KFr": "2wZGhBRVZutphN1Y5AXbVCZxZ62pysez3zrNVqGfTHFS", // SPX6900
    "63LfDmNb3MQ8mw9MtZ2To9bEA2M71kZUUGq5tiJxcqj9": "4twnR1chjTTzoEFcpY5jaCzLfZCgjZL3tNN81GuuhBGe", // GIGA
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": null, // USDC
    "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R": null  // RAY
  };

  const prices = {};

  try {
    for (const [mint, pairAddress] of Object.entries(tokenPairs)) {
      if (!pairAddress) {
        if (mint === "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v") {
          prices[mint] = 1.0; // USDC fixed at $1
        } else {
          prices[mint] = null; // No price for missing pairs (e.g., RAY for now)
        }
        continue;
      }

      const res = await fetch(`https://api.dexscreener.com/latest/dex/pairs/solana/${pairAddress}`);
      if (!res.ok) {
        console.error(`Error fetching price for ${mint}:`, await res.text());
        prices[mint] = null;
        continue;
      }

      const data = await res.json();
      const priceUsd = data.pair?.priceUsd;

      prices[mint] = priceUsd ? parseFloat(priceUsd) : null;
    }
  } catch (error) {
    console.error(`Unexpected error fetching prices:`, error);
    // If global error happens, mark all as null
    for (const mint of Object.keys(tokenPairs)) {
      prices[mint] = null;
    }
  }

  return new Response(JSON.stringify({ prices }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
