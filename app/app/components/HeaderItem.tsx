"use Client";

import React from "react";
import dynamic from "next/dynamic";

// To avoid Hydration Mismatch Error
const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const HeaderItem = () => {
  return (
    <div className="flex justify-between items-center w-full">
      <div className="text-2xl font-semibold tracking-wider">FunBlink</div>
      <WalletMultiButtonDynamic  />
    </div>
  );
};

export default HeaderItem;
