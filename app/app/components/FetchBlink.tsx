"use client";

import { useEffect, useState } from "react";
import { Wallet } from "@project-serum/anchor";
import { fetchBlinkList } from "../utils/utils";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import BlinkDisplay from "./BlinkDisplay";

export default function FetchBlink() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet() as Wallet;

  // State to hold the blink list
  const [blinkList, setBlinkList] = useState<any[]>([]);
  const [blinkAccount, setBlinkAccount] = useState<string >("");

  useEffect(() => {
    const getBlinkList = async () => {
      let response = await fetchBlinkList(connection, wallet);
      console.log("Response:", response);
      if (response.status === "success") {
        setBlinkAccount(response.pda?.blinkAccountString?.toString() || "");
        setBlinkList((response.data as any).blinks.blinks);
      } else {
        console.log("Error creating blink", response);
      }
    };

    getBlinkList();
  }, [connection, wallet]);

  return (
    <div className="flex flex-row justify-center items-center w-full ">
      {/* Map over the blinkList and pass each blink to the BlinkDisplay component */}
      {blinkList.map((blink, index) => (
        <BlinkDisplay
          key={blink.id}
          manualSend={JSON.parse(blink.link).m}
          title={blink.title}
          description={blink.description}
          iconURL={blink.iconURL}
          actions={JSON.parse(blink.link).a}
          blinkAccount={blinkAccount}
        />
      ))}
      {blinkList.length === 0 && (
        <div className="text-center my-4 font-semibold text-2xl italic text-blue-200">
          No blinks created yet
        </div>
      )}
    </div>
  );
}
