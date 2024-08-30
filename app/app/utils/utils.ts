import idl from "../idl/funblink.json";
import { AnchorProvider, Idl, Program, Wallet } from "@project-serum/anchor";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";

const programID = new PublicKey(idl.metadata.address);

const getProvider = (connection: Connection, wallet: Wallet) => {
  if (!wallet) {
    throw new Error("Wallet is not connected");
  }
  const provider = new AnchorProvider(
    connection,
    wallet,
    AnchorProvider.defaultOptions()
  );
  return provider;
};

const createBlink = async (
  connection: Connection,
  wallet: Wallet,
  title: string,
  iconURL: string,
  description: string,
  toPubkey: string,
  actions: string
) => {
  try {
    const anchorProvider = getProvider(connection, wallet);
    const program = new Program(idl as Idl, programID, anchorProvider);

    const blinkSeeds = [Buffer.from("blink_list"), wallet.publicKey.toBuffer()];
    const [blinkAccount] = await PublicKey.findProgramAddress(
      blinkSeeds,
      program.programId
    );

    let id;
    try {
      const blinks = await program.account.blinkList.fetch(blinkAccount);
      const lastElement = (blinks.blinks as any[])[
        (blinks.blinks as any[]).length - 1
      ];
      id = parseInt(lastElement.id) + 1;
    } catch (error) {
      console.log("Blink List not found");
      id = 0;
    }

    await program.methods
      .createBlink(
        id?.toString(),
        title,
        iconURL,
        description,
        "Transfer",
        toPubkey,
        actions
      )
      .accounts({
        blinkList: blinkAccount,
        signer: anchorProvider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([])
      .rpc();

    return { status: "success", data: { id } };
  } catch (error) {
    return { status: "error", data: error };
  }
};

const fetchBlinkList = async (connection: Connection, wallet: Wallet) => {
  try {
    const anchorProvider = getProvider(connection, wallet);
    const program = new Program(idl as Idl, programID, anchorProvider);

    const blinkSeeds = [Buffer.from("blink_list"), wallet.publicKey.toBuffer()];
    const [blinkAccount] = await PublicKey.findProgramAddress(
      blinkSeeds,
      program.programId
    );
    const blinkAccountString = blinkAccount.toBase58();

    const blinks = await program.account.blinkList.fetch(blinkAccount);
    return { status: "success", data: { blinks }, pda: { blinkAccountString } };
  } catch (error) {
    return { status: "error", data: error };
  }
};

const generateActionsString = (
  actions: { value: number }[],
  manualSend: boolean
) => {
  const baseHref = "${baseHref}";

  const actionStrings = actions.map((action) => {
    return `{"label":"Send ${action.value} SOL","href":"${baseHref}&amount=${action.value}"}`;
  });

  if (manualSend) {
    actionStrings.push(`{
        "label":"Send SOL",
        "href":"${baseHref}&amount={amount}",
        "parameters":[
          {
            "name":"amount",
            "label":"Enter the amount of SOL to send",
            "required":true
          }
        ]
      }`);
  }

  return `{
      "actions":[${actionStrings.join(",")}]
    }`;
};

export { createBlink, fetchBlinkList };
