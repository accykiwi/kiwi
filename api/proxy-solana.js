const knownTokenMints = [
  "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump", // Fartcoin
  "J3NKxxXZcnNiMjKw9hYb2K4LUxgwB6t1FtPtQVsv3KFr", // SPX6900
  "63LfDmNb3MQ8mw9MtZ2To9bEA2M71kZUUGq5tiJxcqj9", // GIGACHAD
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
  "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R"  // RAY
];

export default async function handler(req, res) {
  const wallet = "2eb81eBXidrgW6sSzTDnHTEQpqJpmkANMCSRS1BKjUku";
  const solanaEndpoint = "https://api.mainnet-beta.solana.com";

  try {
    const response = await fetch(solanaEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTokenAccountsByOwner",
        params: [
          wallet,
          { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
          { encoding: "jsonParsed" }
        ]
      })
    });

    const tokenData = await response.json();
    const allTokens = tokenData?.result?.value || [];

    // ✅ Filter only known priced mints
    const realTokens = allTokens.filter(acc => {
      const mint = acc?.account?.data?.parsed?.info?.mint;
      return knownTokenMints.includes(mint);
    });

    return res.status(200).json({ result: { value: realTokens } });
  } catch (err) {
    console.error("Wallet fetch error:", err);
    return res.status(500).json({ result: { value: [] } });
  }
}
