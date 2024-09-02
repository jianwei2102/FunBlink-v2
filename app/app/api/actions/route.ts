/**
 * FunBlink Actions Example
 */

import { generateActionsString } from "@/app/utils/utils";
import idl from "../../idl/funblink.json";
import { AnchorProvider, Idl, Program } from "@project-serum/anchor";

import {
  ActionGetRequest,
  ActionPostRequest,
  ActionPostResponse,
  createActionHeaders,
} from "@solana/actions";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

// Create the standard headers for this route (including CORS)
const headers = createActionHeaders();

const DEFAULT_SOL_AMOUNT = 0.1;
const DEFAULT_SOL_ADDRESS: PublicKey = new PublicKey(
  "5ufHigmjsV3ucetqXxZgZuYkmHyRiyYPYm5RSM8y2WFQ" // devnet wallet
);

export async function GET(req: Request) {
  try {
    const requestUrl = new URL(req.url);
    const blink = await loadUserPDA(requestUrl);

    if (!blink) {
      throw new Error("Failed to load blink");
    }

    // Calculate baseHref
    const baseHref = new URL(
      `/api/actions?to=${blink.toPubkey}`,
      requestUrl.origin
    ).toString();
    const blinkActionsLink = JSON.parse(blink.link);

    // Parse the link and replace ${baseHref} with the actual baseHref
    const blinkData = JSON.parse(
      generateActionsString(blinkActionsLink.a, blinkActionsLink.m)
    );
    const actions = blinkData.actions.map(
      (action: { label: string; href: string; parameters?: any[] }) => ({
        ...action,
        href: action.href.replace("${baseHref}", baseHref),
      })
    );
    console.log("Actions:", actions);

    const payload: ActionGetRequest = {
      title: blink.title ?? "Actions Example - Transfer Native SOL",
      icon:
        blink.icon ??
        new URL("/solana-token.png", requestUrl.origin).toString(),
      description: blink.description ?? "Transfer SOL to another Solana wallet",
      label: blink.label ?? "Transfer",
      links: {
        actions: actions,
      },
    };

    return Response.json(payload, {
      headers,
    });
  } catch (err) {
    console.log(err);
    let message = "An unknown error occurred";
    if (typeof err == "string") message = err;
    return new Response(message, {
      status: 400,
      headers,
    });
  }
}

export async function POST(req: Request) {
  try {
    const requestUrl = new URL(req.url);
    const { amount, toPubkey } = validatedQueryParams(requestUrl);

    const body: ActionPostRequest = await req.json();

    // Validate the client provided input
    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch (err) {
      return new Response('Invalid "account" provided', {
        status: 400,
        headers,
      });
    }

    const connection = new Connection(clusterApiUrl("mainnet-beta"));

    // SEND Token Mint Address
    const tokenMintAddress = new PublicKey(
      "SENDdRQtYMWaQrBroBrJ2Q53fgVuq95CV9UPGEvpCxa"
    );

    // Get the associated token addresses for the sender and receiver
    const fromTokenAccount = await getAssociatedTokenAddress(
      tokenMintAddress,
      account
    );
    const toTokenAccount = await getAssociatedTokenAddress(
      tokenMintAddress,
      new PublicKey(toPubkey)
    );

    // create a transaction
    const tx = new Transaction();
    tx.feePayer = account;
    tx.recentBlockhash = (
      await connection.getLatestBlockhash({ commitment: "finalized" })
    ).blockhash;

    // Check if the receiving account exists; if not, create it
    const toTokenAccountInfo = await connection.getAccountInfo(toTokenAccount);
    if (toTokenAccountInfo === null) {
      // Create the associated token account for the receiver
      const createToAccountIx = createAssociatedTokenAccountInstruction(
        account, // Payer of the transaction
        toTokenAccount, // Associated token account to be created
        new PublicKey(toPubkey), // Receiver's public key
        tokenMintAddress // The token mint
      );
      tx.add(createToAccountIx);
    }

    // Create a transfer instruction for SPL tokens
    const transferTokenInstruction = createTransferInstruction(
      fromTokenAccount, // Sender's associated token account
      toTokenAccount, // Receiver's associated token account
      account, // Owner of the sender's account
      amount * Math.pow(10, 6) // Number of tokens to send
    );

    tx.add(transferTokenInstruction);

    const serialTX = tx
      .serialize({ requireAllSignatures: false, verifySignatures: false })
      .toString("base64");

    const payload: ActionPostResponse = {
      transaction: serialTX,
      message: `Send ${amount} SEND token to ${toPubkey.toBase58()}`,
    };

    return Response.json(payload, {
      headers,
    });
  } catch (err) {
    console.log(err);
    let message = "An unknown error occurred";
    if (typeof err == "string") message = err;
    return new Response(message, {
      status: 400,
      headers,
    });
  }
}

// DO NOT FORGET TO INCLUDE THE `OPTIONS` HTTP METHOD
// THIS WILL ENSURE CORS WORKS FOR BLINKS
export const OPTIONS = async (req: Request) => {
  return new Response(null, { headers });
};

function validatedQueryParams(requestUrl: URL) {
  let toPubkey: PublicKey = DEFAULT_SOL_ADDRESS;
  let amount: number = DEFAULT_SOL_AMOUNT;

  try {
    if (requestUrl.searchParams.get("to")) {
      toPubkey = new PublicKey(requestUrl.searchParams.get("to")!);
    }
  } catch (err) {
    throw "Invalid input query parameter: to";
  }

  try {
    if (requestUrl.searchParams.get("amount")) {
      amount = parseFloat(requestUrl.searchParams.get("amount")!);
    }

    if (amount <= 0) throw "amount is too small";
  } catch (err) {
    throw "Invalid input query parameter: amount";
  }

  return {
    amount,
    toPubkey,
  };
}
async function loadUserPDA(requestUrl: URL) {
  const pda = requestUrl.searchParams.get("pda") ?? "";
  const id = requestUrl.searchParams.get("id");

  try {
    const dummyWallet = {
      publicKey: null,
      signTransaction: async (tx: Transaction) => tx,
      signAllTransactions: async (txs: Transaction[]) => txs,
    };

    const anchorProvider = new AnchorProvider(
      new Connection(clusterApiUrl("devnet")),
      dummyWallet as any,
      AnchorProvider.defaultOptions()
    );

    const program = new Program(
      idl as Idl,
      idl.metadata.address,
      anchorProvider
    );

    const blinks = await program.account.blinkList.fetch(pda);
    console.log("Blinks:", blinks);

    // Filter the blink entry by id
    const blink = (blinks.blinks as any[]).find(
      (blink: { id: string }) => blink.id === id
    );

    if (blink) {
      return blink;
    } else {
      console.error("Blink not found");
      return null;
    }
  } catch (error) {
    console.error("Error", error);
    return null;
  }
}
