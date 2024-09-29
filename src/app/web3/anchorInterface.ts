import { AnchorProvider, Program, web3 } from "@coral-xyz/anchor";
import {
  AccountStruct,
  AnchorArray,
  BorshDeserializeParams,
  ColoredPixelsDict,
  ConstantType,
  FieldType,
  MetadataAccount,
  MetadataAccountAccounts,
  MetadataAccountCreatedEvent,
  MetadataAccountParams,
  MetadataAccountParsed,
  Socials,
  StringType,
  Token,
  validateString,
} from "../types";
import * as borsh from "@coral-xyz/borsh";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { DegenWall } from "./degen_wall";
import IDL from "./idl.json";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import eventEmitter from "../hooks/eventEmitter";
import { DEFAULT_TOKEN, EVENT_NAME } from "../constantsUncircular";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";

const STRING_OFFSET = 4;
const TREASURY_PUBLICKEY = new PublicKey(
  "AWJQAWxPE3hJz2XVrJDmBDdQk4pC2SjeKpLFhjUncCKM"
);
const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);
const COMMITMENT = "confirmed";

export default class AnchorInterface {
  private program: Program<DegenWall>;
  private listener = 0;
  public readonly MAX_DATA_SIZE: number;
  public readonly PX_SIZE: number;
  public readonly PX_WIDTH: number;
  public readonly PX_HEIGHT: number;
  public readonly DATA_DELIMITER: number;
  public readonly MAX_SOCIALS_SIZE: number;
  public readonly STRING_DELIMITER: string;
  public readonly NAME_LENGTH: number;
  public readonly TICKER_LENGTH: number;
  public readonly TWITTER_LENGTH: number;
  public readonly SEED_PREFIX: Uint8Array;

  constructor(connection: Connection, wallet?: AnchorWallet) {
    const provider = wallet
      ? new AnchorProvider(connection, wallet, { commitment: COMMITMENT })
      : new AnchorProvider(connection, null as unknown as AnchorWallet);
    this.program = new Program<DegenWall>(IDL as DegenWall, provider);
    this.MAX_DATA_SIZE = this.getNumberValue("maxDataSize");
    this.PX_SIZE = this.getNumberValue("pxSize");
    this.PX_WIDTH = this.getNumberValue("pxWidth");
    this.PX_HEIGHT = this.getNumberValue("pxHeight");
    this.DATA_DELIMITER = this.getNumberValue("dataDelimiter");
    this.MAX_SOCIALS_SIZE = this.getNumberValue("maxSocialsSize");
    this.STRING_DELIMITER = this.getConstantValue("stringDelimiter");
    this.NAME_LENGTH = this.getNumberValue("nameLength");
    this.TICKER_LENGTH = this.getNumberValue("tickerLength");
    this.TWITTER_LENGTH = this.getNumberValue("twitterLength");
    this.SEED_PREFIX = Buffer.from(
      String.fromCharCode(
        ...this.getConstantValue("seedPrefix")
          .replace(/[\[\]\s]/g, "")
          .split(",")
          .map(Number)
      )
    );
  }

  updateProgram(connection: Connection, wallet: AnchorWallet) {
    const provider = new AnchorProvider(connection, wallet);
    this.program = new Program<DegenWall>(IDL as DegenWall, provider);
  }

  registerEventListener() {
    this.listener = this.program.addEventListener(
      EVENT_NAME,
      (eventRAW, _slot) => {
        const event = this.getParsedEvent(eventRAW);
        eventEmitter.emit(EVENT_NAME, event);
      }
    );
  }

  unregisterEventListener() {
    try {
      this.program.removeEventListener(this.listener);
    } catch (error) {
      console.error(
        `Error unregistering event with listener no ${this.listener}`
      );
    }
  }

  async getAllAccounts(endpoint: string) {
    const accountsDeserialized = await this.getAccountsDeserialized(endpoint);
    if (!accountsDeserialized?.length) {
      console.log("There are no existing accounts!");
      return null;
    }
    return accountsDeserialized
      .map((account) => this.getParsedAccount(account))
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  async createMetadataAccount(
    socials: Socials,
    dataRAW: ColoredPixelsDict,
    paymentToken: Token
  ) {
    const {
      token,
      website = "",
      twitter = "",
      community = "",
      image = "",
      name = "",
      ticker = "",
      description = "",
      payer = "",
    } = socials;
    const authority = new PublicKey(payer);
    const token_publickey = new PublicKey(token || DEFAULT_TOKEN);
    const id = Array.from(Keypair.generate().publicKey.toBytes());
    const ID_SEED = Buffer.from(id);
    const PAYER_SEED = authority.toBuffer();
    const [metadataAccount] = web3.PublicKey.findProgramAddressSync(
      [this.SEED_PREFIX, PAYER_SEED, ID_SEED],
      this.program.programId
    );
    const metadataAccountAccounts = {
      authority,
      metadataAccount,
      token: token_publickey,
    };
    const metadataAccountParamsPartial = {
      id,
      token,
      website,
      twitter,
      community,
      image,
      name,
      ticker,
      description,
    };
    const dataArray = this.formatData(dataRAW);
    if (dataArray.length === 1) {
      const metadataAccountParams: MetadataAccountParams = {
        data: dataArray[0],
        ...metadataAccountParamsPartial,
      };
      const metadataAccountWrapped =
        paymentToken.address === DEFAULT_TOKEN
          ? this.getMetadataAccountWrapped(
              metadataAccountParams,
              metadataAccountAccounts
            )
          : this.getMetadataAccountMintWrapped(
              metadataAccountParams,
              metadataAccountAccounts,
              paymentToken,
              PAYER_SEED
            );
      await metadataAccountWrapped.rpc();
    }
  }

  private getMetadataAccountWrapped(
    metadataAccountParams: MetadataAccountParams,
    metadataAccountAccounts: MetadataAccountAccounts
  ) {
    const [solTreasuryAccount] = web3.PublicKey.findProgramAddressSync(
      [this.SEED_PREFIX],
      this.program.programId
    );
    return this.program.methods
      .createMetadataAccount(metadataAccountParams)
      .accounts({
        //@ts-ignore
        solTreasuryAccount,
        treasury: TREASURY_PUBLICKEY,
        ...metadataAccountAccounts,
      });
  }

  private getMetadataAccountMintWrapped(
    metadataAccountParams: MetadataAccountParams,
    metadataAccountAccounts: MetadataAccountAccounts,
    paymentToken: Token,
    payerSeed: Buffer
  ) {
    const { vaultWsol, vaultMint, treasuryMint, address } = paymentToken;
    const mint = new PublicKey(address);
    const MINT_SEED = mint.toBuffer();
    const [poolAccount] = web3.PublicKey.findProgramAddressSync(
      [this.SEED_PREFIX, MINT_SEED],
      this.program.programId
    );
    const [payerTokenAccount] = web3.PublicKey.findProgramAddressSync(
      [payerSeed, TOKEN_PROGRAM_ID.toBuffer(), MINT_SEED],
      SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    );
    return this.program.methods
      .createMetadataAccountMint(metadataAccountParams)
      .accounts({
        //@ts-ignore
        poolAccount,
        mint,
        vaultWsol,
        vaultMint,
        treasuryMint,
        payerTokenAccount,
        ...metadataAccountAccounts,
      });
  }

  private formatData(dataRAW: ColoredPixelsDict) {
    const data: number[] = [];
    for (const [indexString, color] of Object.entries(dataRAW)) {
      const index = Number(indexString);
      const bigint = parseInt(color, 16);
      const x = index % this.PX_WIDTH;
      const y = Math.floor(index / this.PX_WIDTH);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      data.push(x, y, r, g, b);
    }
    while (data.length % this.MAX_DATA_SIZE !== 0) {
      data.push(255);
    }

    return this.splitArrayIntoChunks(data, this.MAX_DATA_SIZE);
  }

  private splitArrayIntoChunks<T>(array: T[], chunkSize: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
  }

  private getParsedEvent(event: MetadataAccountCreatedEvent) {
    const { mint, timestamp, payer, token, data } = event;
    return {
      ...event,
      mint: mint.toString(),
      timestamp: Number(timestamp),
      payer: payer.toString(),
      token: token.toString(),
      data: data,
    };
  }

  private getNumberValue(key: ConstantType): number {
    const value = Number(this.getConstantValue(key));
    if (isNaN(value)) {
      throw new Error(`Invalid data type for ${key}`);
    }
    return value;
  }

  private getStringSize(name: StringType) {
    let stringLength: number;
    switch (name) {
      case "socials":
        stringLength = this.MAX_SOCIALS_SIZE;
        break;
      default:
        throw new Error(`Invalid StringType for ${name}`);
    }
    if (isNaN(stringLength))
      throw new Error(`Constant ${name} is not a number`);
    return STRING_OFFSET + stringLength;
  }

  private getConstantValue(constantName: ConstantType) {
    const constant = this.program.idl.constants.find(
      (constant) => constant.name === constantName
    );
    if (!constant)
      throw new Error(`Couldn't parse string size for ${constantName}`);
    return constant.value;
  }

  private getTypeSize(field: FieldType) {
    const { type, name } = field;
    switch (type) {
      case "u8":
      case "i8":
      case "bool":
        return 1;
      case "u16":
      case "i16":
        return 2;
      case "u32":
      case "i32":
        return 4;
      case "u64":
      case "i64":
        return 8;
      case "u128":
      case "i128":
        return 16;
      case "pubkey":
        return 32;
      case "string": // Let's avoid strings since usually they're variable in length
        const validatedName = validateString(name);
        return this.getStringSize(validatedName);
      default: //@ts-ignore
        return this.getArraySize(type.array);
    }
  }

  private getArraySize(array: AnchorArray): number {
    const anchorPrimitive = array[0];
    const arrayLength = array[1];
    const primitiveSize = this.getTypeSize({
      type: anchorPrimitive,
      name: "DefinitelyNotAString",
    });
    return primitiveSize * arrayLength;
  }

  private getAccountStruct(name: string) {
    const accountStruct = this.program.idl.types.find(
      (acc) => acc.name === name
    )?.type;
    if (!accountStruct) throw new Error(`Account ${name} doesn't exist`);
    return accountStruct;
  }

  private getOffset(name: string, accountName: AccountStruct) {
    const accountStruct = this.getAccountStruct(accountName);
    let offset = 8; // discriminator offset
    let { fields } = accountStruct;
    let fieldPosition = 0;
    for (const field of fields) {
      if (field.name === name) break;
      // @ts-ignore
      offset += this.getTypeSize(field);
      fieldPosition++;
    }
    if (fieldPosition === fields.length)
      throw new Error(
        `Fieldname ${name} doesnt exist for account ${accountName} return getOffset`
      );
    return offset;
  }

  private getEncodedValue(input: number | string) {
    if (typeof input === "number") return bs58.encode([input]);
    if (typeof input === "string") return bs58.encode(Buffer.from(input));
    throw new Error(`Invalid input ${input} for encoding`);
  }

  private getStructField(field: FieldType) {
    const { name, type } = field;
    if (type === "pubkey") return borsh.publicKey(name);
    if (type === "string") return borsh.str(name);
    if (typeof type === "string")
      //@ts-ignore
      return borsh[type](name);
    const { array } = type;
    if (array) {
      const [subType, length] = array;
      //@ts-ignore
      return borsh.array(borsh[subType]("undefined"), length, name);
    }
  }

  private deserialize(
    data: Buffer,
    params: BorshDeserializeParams
  ): MetadataAccount {
    const { from, to, account } = params;
    const accountStruct = this.getAccountStruct(account);
    const { fields } = accountStruct;
    const fromIndex = from
      ? fields.findIndex((field) => field.name === from)
      : 0;
    const toIndex = to
      ? fields.findIndex((field) => field.name === to)
      : fields.length;
    if (fromIndex < 0) throw new Error(`Invalid from arg ${from}`);
    if (toIndex < 0) throw new Error(`Invalid to arg  ${to}`);
    if (fromIndex >= toIndex)
      throw new Error(
        `from ${from} cannot be at an index equal or greater than to ${to}`
      );
    const structArray = [];
    for (let i = fromIndex; i < toIndex; i++) {
      //@ts-ignore
      structArray.push(this.getStructField(fields[i]));
    }
    return borsh.struct(structArray).decode(data);
  }

  private async getAccountsDeserialized(
    endpoint: string
  ): Promise<MetadataAccount[]> {
    const connection = new Connection(endpoint);
    const accountStruct: AccountStruct = "metadataAccount";
    const startField = "mint";
    const fieldToMatch = "version";
    const METADATA_ACCOUNT_SIZE =
      8 + // anchor discriminator
      1 + // bump
      32 + // id
      1 + // version
      8 + // epoch
      32 + // mint
      8 + // timestamp
      32 + // payer
      // user input
      32 + // token
      this.MAX_DATA_SIZE + // data -> max 100 pixels
      STRING_OFFSET + // string offset
      this.MAX_SOCIALS_SIZE; // all socials squashed in 1 string
    const accountsSerialized = await connection.getProgramAccounts(
      this.program.programId,
      {
        filters: [
          {
            memcmp: {
              bytes: this.getEncodedValue(
                Number(this.getConstantValue(fieldToMatch))
              ),
              offset: this.getOffset(fieldToMatch, accountStruct),
            },
          },
        ],
        dataSlice: {
          offset: this.getOffset(startField, accountStruct),
          length:
            METADATA_ACCOUNT_SIZE - this.getOffset(startField, accountStruct),
        },
      }
    );
    return accountsSerialized.map((account) =>
      this.deserialize(account.account.data, {
        account: accountStruct,
        from: startField,
      })
    );
  }

  private getParsedAccount(account: MetadataAccount): MetadataAccountParsed {
    const { mint, timestamp, payer, token, data, socials } = account;
    const [
      website,
      twitter,
      community,
      image,
      name,
      ticker,
      ...descriptionStrings
    ] = socials.split(this.STRING_DELIMITER); // description might contain the STRING_DELIMITER
    const description = descriptionStrings
      ? descriptionStrings
          .map((str, index) => {
            if (index === str.length - 1) return str;
            return str + this.STRING_DELIMITER;
          })
          .join()
      : "";
    return {
      mint: mint.toString(),
      timestamp: Number(timestamp),
      payer: payer.toString(),
      token: token.toString(),
      data: data,
      website,
      twitter,
      community,
      image,
      name,
      ticker,
      description,
    };
  }
}
