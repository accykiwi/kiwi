export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const tokenMints = [
    "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump", // Fartcoin
    "J3NKxxXZcnNiMjKw9hYb2K4LUxgwB6t1FtPtQVsv3KFr", // SPX6900
    "63LfDmNb3MQ8mw9MtZ2To9bEA2M71kZUUGq5tiJxcqj9", // GIGACHAD
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
    "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R"  // RAY
  ];

  const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

  const tokenDecimals = {
    "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump": 6, // Fartcoin
    "J3NKxxXZcnNiMjKw9hYb2K4LUxgwB6t1FtPtQVsv3KFr": 9, // SPX6900
    "63LfDmNb3MQ8mw9MtZ2To9bEA2M71kZUUGq5tiJxcqj9": 9, // GIGACHAD
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": 6, // USDC
    "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R": 6  // RAY
  };

  const prices = {};

  for (const mint of tokenMints) {
    if (mint === USDC_MINT) {
      prices[mint] = 1.0;
      continue;
    }

    try {
      const res = await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=${mint}&outputMint=${USDC_MINT}&amount=100000000&slippageBps=50`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!res.ok) {
        console.error(`Error fetching price for ${mint}:`, await res.text());
        prices[mint] = null;
        continue;
      }

      const data = await res.json();

      if (data.outAmount && data.inAmount) {
        const outAmount = Number(data.outAmount) / 1e6; // USDC always 6 decimals
        const inAmount = Number(data.inAmount) / Math.pow(10, tokenDecimals[mint] || 6); // token decimals
        const price = outAmount / inAmount;
        prices[mint] = price;
      } else {
        prices[mint] = null;
      }

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
