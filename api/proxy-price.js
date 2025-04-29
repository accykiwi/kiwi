export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const tokenPairs = {
    "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump": "8hfPCXX2MvmSY8FuC9QUy3P3C8MjMLK1qvErsVuCTeRo", // Fartcoin
    "J3NKxxXZcnNiMjKw9hYb2K4LUxgwB6t1FtPtQVsv3KFr": "2wZGhBRVZutphN1Y5AXbVCZxZ62pysez3zrNVqGfTHFS", // SPX
    "63LfDmNb3MQ8mw9MtZ2To9bEA2M71kZUUGq5tiJxcqj9": "4twnR1chjTTzoEFcpY5jaCzLfZCgjZL3tNN81GuuhBGe", // GIGA
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": null, // USDC
    "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R": null  // RAY
  };

  const prices = {};

  for (const [mint, pairAddress] of Object.entries(tokenPairs)) {
    if (!pairAddress) {
      prices[mint] = (mint === "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v") ? 1
