// /components/LPTracker.js

import { useEffect, useState } from "react";

export default function LPTracker() {
  const [prices, setPrices] = useState(null);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch("/api/proxy-lp-price");
        const data = await res.json();
        setPrices(data);
      } catch (error) {
        console.error("Error fetching LP prices:", error);
      }
    }
    fetchPrices();
  }, []);

  if (!prices) return <div>Loading LP prices...</div>;

  return (
    <div className="space-y-4">
      {Object.entries(prices).map(([symbol, price]) => (
        <div key={symbol} className="p-4 border rounded">
          <h2 className="text-xl font-semibold">{symbol}</h2>
          <p>Price: {price ? `$${price.toFixed(4)}` : "Unavailable"}</p>
        </div>
      ))}
    </div>
  );
}
