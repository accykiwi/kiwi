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

    // ✅ New strict NFT filter
    const realTokens = allTokens.filter(acc => {
      const info = acc?.account?.data?.parsed?.info;
      const amountRaw = info?.tokenAmount?.amount || "0";
      const decimals = info?.tokenAmount?.decimals ?? 0;

      // ✅ NFTs always have exact "1" amount and 0 decimals
      return !(amountRaw === "1" && decimals === 0);
    });

    return res.status(200).json({ result: { value: realTokens } });
  } catch (err) {
    console.error("Wallet fetch error:", err);
    return res.status(500).json({ result: { value: [] } });
  }
}
