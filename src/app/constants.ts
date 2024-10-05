import { Connection, PublicKey } from "@solana/web3.js";
import AnchorInterface from "./web3/anchorInterface";

export const WSOL_ADDRESS = "So11111111111111111111111111111111111111112";
export const GOLD_ADDRESS = "A4SvyMLMGXrHR8ahP7qotUrKvGD8KgbdAcLNs3nbVftE";
export const TOKEN_ARRAY = [WSOL_ADDRESS, GOLD_ADDRESS];
export const TOKEN_DICT = {
  ["SOL"]: {
    decimals: 9,
    name: "Wrapped SOL",
    address: WSOL_ADDRESS,
    vaultWsol: new PublicKey(WSOL_ADDRESS),
    vaultMint: new PublicKey(WSOL_ADDRESS),
    treasuryMint: new PublicKey(WSOL_ADDRESS),
  },
  ["GOLD"]: {
    decimals: 9,
    name: "Gold",
    address: GOLD_ADDRESS,
    vaultWsol: new PublicKey("58DmxrkK8KTJkDhcG4oDVQ7Li7yfbpNikhtsiLD53KTD"),
    vaultMint: new PublicKey("6jBwx67VgAFPBTrGKnTmE2SVKzXgWJ2sAP25ks2YZUE1"),
    treasuryMint: new PublicKey(
      "CeqkbDdECYJZ86K4qJndBxNQD85tFj498XYY5UyxPuQp"
    ),
  },
};
export const FETCH_BALANCE_INTERVAL_MS = 20000;
export const SERVER_URL = "http://localhost:3001";
export const RPC_URL_KEY = "RPC_URL";
export const ERASE_PIXELS_CODE = -1;
export const USER_REGEX = /^[a-zA-Z0-9_]{1,15}$/;
// we're using a class because for some reason we need to instantiate a wallet with connection
// if we want to have access to the IDL constants
const anchorInterface = new AnchorInterface(null as unknown as Connection);
export const {
  MAX_DATA_SIZE,
  PX_SIZE,
  PX_HEIGHT,
  PX_WIDTH,
  DATA_DELIMITER,
  MAX_SOCIALS_SIZE,
  STRING_DELIMITER,
  NAME_LENGTH,
  TICKER_LENGTH,
  TWITTER_LENGTH,
  SEED_PREFIX,
} = anchorInterface;
