export default async function handler(req, res) {
  const wallet = "2eb81eBXidrgW6sSzTDnHTEQpqJpmkANMCSRS1BKjUku"; // ✅ Hardcoded correctly
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

    // ✅ Filter out NFTs
    const realTokens = allTokens.filter(acc => {
      const info = acc?.account?.data?.parsed?.info;
      const amount = parseFloat(info?.tokenAmount?.uiAmountString || "0");
      const decimals = info?.tokenAmount?.decimals;

      // ✅ Exclude NFTs: (decimals === 0 && amount === 1)
      return !(decimals === 0 && amount === 1);
    });

    return res.status(200).json({ result: { value: realTokens } });
  } catch (err) {
    console.error("Wallet fetch error:", err);
    return res.status(500).json({ result: { value: [] } });
  }
}
