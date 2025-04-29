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

  try {
    const ids = tokenMints.join(',');
    const res = await fetch(`https://price.jup.ag/v4/price?ids=${ids}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      console.error(`Error fetching prices:`, await res.text());
      return new Response(JSON.stringify({ prices: {} }), { status: 500 });
    }

    const data = await res.json();
    const prices = {};

    for (const mint of tokenMints) {
      prices[mint] = data.data[mint]?.price ?? null;
    }

    return new Response(JSON.stringify({ prices }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`Error processing prices:`, error);
    return new Response(JSON.stringify({ prices: {} }), { status: 500 });
  }
}
