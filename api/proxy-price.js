export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const outputMint = searchParams.get('mint'); // The token you want the price for

  if (!outputMint) {
    return new Response(JSON.stringify({ error: 'Missing mint address' }), { status: 400 });
  }

  const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // USDC Mint Address

  try {
    const response = await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=${USDC_MINT}&outputMint=${outputMint}&amount=1000000&slippageBps=50`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Jupiter error response:', text);
      return new Response(JSON.stringify({ error: 'Jupiter API failed', details: text }), { status: response.status });
    }

    const data = await response.json();

    if (!data.outAmount || !data.inAmount) {
      return new Response(JSON.stringify({ error: 'Invalid quote data' }), { status: 500 });
    }

    // Calculate price
    const outAmountLamports = Number(data.outAmount);
    const inAmountLamports = Number(data.inAmount);

    const price = outAmountLamports / inAmountLamports;

    return new Response(JSON.stringify({ value: price }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Proxy server error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error (proxy)' }), { status: 500 });
  }
}
