import { MAX_DATA_SIZE, PX_SIZE } from "@/app/constants";
import { ColoredPixelsDict, Socials } from "@/app/types";
import urlRegex from "url-regex";

export const TWITTER_REGEX =
  /(?:twitter\.com\/|x\.com\/)([A-Za-z0-9_]+)(?:[/?]|$)/;

export const arraysEqual = (arr1: number[], arr2: number[]) => {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
};

export const extractTwitterUser = (url: string) => {
  const match = url.match(TWITTER_REGEX);
  return match ? match[1] : null;
};

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const isValidUrl = (urlString: string) => {
  return urlRegex({ strict: false, exact: true }).test("https://" + urlString);
};

export const isValidImageUrl = (url: string) => {
  const imageExtensions = /\.(apng|avif|gif|jpg|jpeg|png|svg|webp|bmp|ico)$/i;
  return imageExtensions.test(url);
};

export const parseUrl = (urlString: string) => {
  return urlString.replace(/^https?:\/\//, "");
};

export const splitObjectIntoChunks = (
  obj: ColoredPixelsDict,
  chunkSize = MAX_DATA_SIZE / PX_SIZE
) => {
  // Get all keys and sort them (assuming they are numeric keys)
  const keys = Object.keys(obj)
    .map(Number)
    .sort((a, b) => a - b);

  // Create an array to hold the sub-objects
  const subObjects: ColoredPixelsDict[] = [];

  // Iterate over the keys and create sub-objects of at most chunkSize keys
  for (let i = 0; i < keys.length; i += chunkSize) {
    const chunkKeys = keys.slice(i, i + chunkSize);
    const chunk: ColoredPixelsDict = {};

    // Add the key-value pairs to the current chunk
    chunkKeys.forEach((key) => {
      chunk[key] = obj[key];
    });

    // Push the chunk to the array of sub-objects
    subObjects.push(chunk);
  }

  return subObjects;
};

export const calculateUtf8StringSize = (socials: Socials) => {
  const mergedString = Object.keys(socials)
    .filter((key) => key !== "payer" && key !== "token") // Exclude "payer" and "token"
    .map((key) => socials[key as keyof Socials])
    .join("");
  const encoder = new TextEncoder();
  const utf8Bytes = encoder.encode(mergedString);
  return utf8Bytes.length;
};
