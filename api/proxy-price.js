export const config = {
  runtime: 'edge', // important: forces Vercel to use native fetch
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const mint = searchParams.get('mint');

  if (!mint) {
    return new Response(JSON.stringify({ error: 'Missing mint address' }), { status: 400 });
  }

  try {
    const apiResponse = await fetch(`https://public-api.birdeye.so/market/token_price?address=${mint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer 5e03e241b51b4ed3946001c68634ddcf`,
        'Accept': 'application/json'
      }
    });

    if (!apiResponse.ok) {
      const text = await apiResponse.text();
      console.error('Birdeye error response:', text);
      return new Response(JSON.stringify({ error: 'Birdeye API failed', details: text }), { status: apiResponse.status });
    }

    const data = await apiResponse.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Proxy server error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error (proxy)' }), { status: 500 });
  }
}
