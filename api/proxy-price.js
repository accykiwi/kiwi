export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const mint = searchParams.get('mint');

  if (!mint) {
    return new Response(JSON.stringify({ error: 'Missing mint address' }), { status: 400 });
  }

  try {
    const response = await fetch(`https://quote-api.jup.ag/v6/price?ids=${mint}`, {
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
    const tokenData = data?.data?.[mint];
    if (!tokenData) {
      return new Response(JSON.stringify({ error: 'Price not found in Jupiter' }), { status: 404 });
    }

    return new Response(JSON.stringify({ value: tokenData.price }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Proxy server error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error (proxy)' }), { status: 500 });
  }
}
