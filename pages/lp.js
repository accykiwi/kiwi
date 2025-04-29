// /pages/lp.js

import LPTracker from "@/components/LPTracker";

export default function LPPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Liquidity Pool Tracker</h1>
      <LPTracker />
    </div>
  );
}
