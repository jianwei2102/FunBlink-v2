"use Client";

import React from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import FunBlinkLogo from "../../public/FunBlinkLogo.png";

// To avoid Hydration Mismatch Error
const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const HeaderItem = () => {
  return (
    <div className="flex justify-between items-center w-full">
      <div className="flex flex-row gap-2 text-2xl font-semibold tracking-wider">
        <Image
          src={FunBlinkLogo}
          alt={"Logo"}
          height={32}
          width={32}
          className="rounded-lg"
        />
        FunBlink
      </div>
      <WalletMultiButtonDynamic />
    </div>
  );
};

export default HeaderItem;
