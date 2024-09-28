import { Connection, PublicKey } from "@solana/web3.js";

export const isHealthyEndpoint = async (endpoint: string) => {
  try {
    const connection = new Connection(endpoint);
    const result = await connection.getEpochInfo();
    if (result?.epoch) return true;
    return false;
  } catch (error) {
    console.error(`Error checking endpoint ${endpoint}: ${error}`);
    return false;
  }
};

export const isValidAddress = (address: string) => {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
};

export const formatBalance = (balance: number): string => {
  if (balance < 1000) {
      return balance.toFixed(3) // Display as normal value with 3 decimals
  } else if (balance < 1e6) {
      return (balance / 1e3).toFixed(1) + 'K' // Display as Ks with 1 decimal
  } else if (balance < 1e9) {
      return (balance / 1e6).toFixed(1) + 'M' // Display as Ms with 1 decimal
  } else if (balance < 1e12) {
      return (balance / 1e9).toFixed(1) + 'B' // Display as Bs with 1 decimal
  } else {
      return (balance / 1e12).toFixed(1) + 'T' // Display as Ts with 1 decimal
  }
}
