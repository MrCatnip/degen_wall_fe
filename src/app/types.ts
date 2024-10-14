import { BN } from "@coral-xyz/anchor";
import { Theme } from "@mui/material";
import {
  SystemStyleObject,
  CSSSelectorObjectOrCssVariables,
} from "@mui/system";
import { PublicKey } from "@solana/web3.js";
import { Toast } from "primereact/toast";
import { ReactNode, RefObject } from "react";

export type Socials = {
  payer: string;
  token: string;
  website?: string;
  twitter?: string;
  community?: string;
  image?: string;
  name?: string;
  ticker?: string;
  description?: string;
};

export type MetadataItem = {
  color: string;
  socials: Socials;
};

export interface CanvasReadonlyProps {
  squareSize: number;
  isEditMode: boolean;
  canvasReadonly: CanvasLayout;
}

export enum Action {
  Undo = "Undo",
  Redo = "Redo",
}

export type ActionStamped = null | {
  timestamp: number;
  action: Action;
};

export type PixelArray = (string | null)[][];

export interface CanvasEditProps {
  isEditMode: boolean;
  drawColor: string;
  isEraseMode: boolean;
  onColorPixel: (index: number, color?: string) => void;
  onErasePixel: (index: number) => void;
  forceUpdate: (isNewAction?: boolean) => void;
  actionStamped: ActionStamped;
  pixelArray: PixelArray;
  onClearImage: () => void;
}

export interface UploadPopupProps {
  popupUpload: boolean;
  onClosePopupUpload: () => void;
  onSaveImage: (pixelArray: PixelArray) => void;
}

export interface PayPopupProps {
  popupPay: boolean;
  onClosePopupPay: () => void;
  coloredPixelsDict: ColoredPixelsDict;
  exitEditMode: () => void;
}

export type ColoredPixelsDict = {
  [key: number]: string;
};

export type ColorPixelPointers = {
  prevColor?: string;
  newColor?: string;
};

export type ColoredPixelsActionsDict = {
  [key: number]: ColorPixelPointers;
};

export type CanvasLayout = MetadataItem[];

export type MenuSectionProps = {
  isEditMode: boolean;
  isEraseMode: boolean;
  drawColor: string;
  undoCount: number;
  redoCount: number;
  coloredPixelsCount: number;
  onSetActionStamped: (action: Action) => void;
  onSetDrawColor: (color: string) => void;
  enterEditMode: () => void;
  enableEraseMode: () => void;
  exitEditMode: () => void;
  onOpenPopupUpload: () => void;
  onOpenPopupPay: () => void;
};

export type MetadataAccountCreatedEvent = {
  id: number[];
  mint: PublicKey;
  timestamp: BN;
  payer: PublicKey;
  token: PublicKey;
  data: number[];
  website: string;
  twitter: string;
  community: string;
  image: string;
  name: string;
  ticker: string;
  description: string;
};

export type MetadataAccountParams = {
  id: number[];
  token: string;
  data: number[];
  website: string;
  twitter: string;
  community: string;
  image: string;
  name: string;
  ticker: string;
  description: string;
};

export type MetadataAccountParsed = Omit<MetadataAccountParams, "id"> & {
  mint: string;
  timestamp: number;
  payer: string;
};

export type MetadataAccount = {
  mint: PublicKey;
  timestamp: BN;
  payer: PublicKey;
  token: PublicKey;
  data: number[];
  socials: string;
};

export type MetadataAccountAccounts = {
  authority: PublicKey;
  metadataAccount: PublicKey;
  token: PublicKey;
};

export interface CommonBackdropProps {
  open: boolean;
  children: ReactNode;
  sx?: SystemStyleObject<Theme> | CSSSelectorObjectOrCssVariables<Theme>;
}

export type AnchorPrimitive =
  | "u8"
  | "u16"
  | "u32"
  | "u64"
  | "u128"
  | "i8"
  | "i16"
  | "i32"
  | "i64"
  | "i128"
  | "string"
  | "bool"
  | "pubkey";

export type AnchorArray = [AnchorPrimitive, number];

export type AnchorType = AnchorPrimitive | AnchorArray;

const validStrings = ["socials"];
export type StringType = "socials";
export const validateString = (str: string) => {
  if (!validStrings.includes(str))
    throw new Error(`Invalid string argument ${str}`);
  return str as StringType;
};

export type ConstantType =
  | "maxDataSize"
  | "version"
  | "pxSize"
  | "pxWidth"
  | "pxHeight"
  | "dataDelimiter"
  | "maxSocialsSize"
  | "stringDelimiter"
  | "nameLength"
  | "tickerLength"
  | "twitterLength"
  | "seedPrefix";

export type FieldType = {
  name: string;
  type:
    | AnchorPrimitive
    | {
        array: AnchorArray;
      };
};

export type PayButtonProps = {
  token: Token;
  coloredPixelsDict: ColoredPixelsDict;
  toast: RefObject<Toast>;
  exitEditMode: () => void;
  onClosePopupPay: () => void;
  socialsSize: number;
  socials: Socials;
  errorsExist: boolean;
};

export type AccountStruct =
  | "createMetadataAccountParams"
  | "metadataAccount"
  | "metadataAccountCreated"
  | "poolAccount"
  | "solTreasuryAccount";

export type BorshDeserializeParams = {
  from?: string;
  to?: string;
  account: AccountStruct;
};

export type TokenSymbol = "SOL" | "GOLD";
export type TokenName = "Wrapped SOL" | "Gold";
export type Token = {
  address: string;
  name: string;
  decimals: number;
  vaultWsol: PublicKey;
  vaultMint: PublicKey;
  treasuryMint: PublicKey;
};

export type BalanceCache = {
  timestamp: number;
  balance: number;
  walletAddress: string;
};

export type ErrorTypes =
  | "Success"
  | "Timeout"
  | "UnexpectedError"
  | "EventError"
  | "UserRejectedError";

export type TxResult = ErrorTypes;

export interface ThemeButton {
  id: number;
  color: string;
}

export interface ThemeButtonProps {
  theme: ThemeButton;
  onChange: (id: number) => void;
}
