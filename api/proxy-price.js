export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const tokenMap = {
    "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump": "8hfPCXX2MvmSY8FuC9QUy3P3C8MjMLK1qvErsVuCTeRo", // Fartcoin
    "J3NKxxXZcnNiMjKw9hYb2K4LUxgwB6t1FtPtQVsv3KFr": "2wZGhBRVZutphN1Y5AXbVCZxZ62pysez3zrNVqGfTHFS", // SPX6900
    "63LfDmNb3MQ8mw9MtZ2To9bEA2M71kZUUGq5tiJxcqj9": "4twnR1chjTTzoEFcpY5jaCzLfZCgjZL3tNN81GuuhBGe", // GIGACHAD
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": null, // USDC (fixed)
    "4k3Dyjzvzp8mZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R": null // RAY (leave null for now)
  };

  const prices = {};

  try {
    for (const [mint, lpAddress] of Object.entries(tokenMap)) {
      if (mint === "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v") {
        prices[mint] = 1.0; // USDC hardcoded
        continue;
      }

      if (!lpAddress) {
        prices[mint] = null; // If we don't have an LP address (like RAY), leave as null
        continue;
      }

      const res = await fetch(`https://api.dexscreener.com/latest/dex/pairs/solana/${lpAddress}`);
      if (!res.ok) {
        console.error(`Error fetching price for mint ${mint}:`, await res.text());
        prices[mint] = null;
        continue;
      }

      const data = await res.json();
      const priceUsd = data.pair?.priceUsd;

      if (priceUsd) {
        prices[mint] = parseFloat(priceUsd);
      } else {
        prices[mint] = null;
      }
    }
  } catch (error) {
    console.error('Error fetching prices:', error);
    for (const mint of Object.keys(tokenMap)) {
      if (!prices[mint]) {
        prices[mint] = null;
      }
    }
  }

  return new Response(JSON.stringify({ prices }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
