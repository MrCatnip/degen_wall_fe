import {
  DATA_DELIMITER,
  MAX_DATA_SIZE,
  PX_HEIGHT,
  PX_SIZE,
  PX_WIDTH,
  SERVER_URL,
  USER_REGEX,
} from "@/app/constants";
import {
  CanvasLayout,
  MetadataAccountParsed,
  MetadataItem,
  Socials,
} from "@/app/types";
import { isHealthyEndpoint } from "@/app/web3/misc";
import AnchorInterface from "@/app/web3/anchorInterface";
import { Connection } from "@solana/web3.js";
import urlRegex from "url-regex";
import { DEFAULT_TOKEN } from "@/app/constantsUncircular";

const DEFAULLT_PAYER = "DEGenPMwjmLCw9LmdvfCUK5M4XKrbep2rts4DDqG3J5x";
const DEFAULT_WEBSITE = "https://degen_wall.com";
const DEFAULT_TWITTER = "https://x.com/degen_wall";
const DEFAULT_COMMUNITY = "https://t.me/degen_wall";
const DEFAULT_IMAGE = "https://i.ibb.co/ABC/1500x500.jpg";
const DEFAULT_NAME = "Degen Wall";
const DEFAULT_TICKER = "DEV";
const DEFAULT_DESCRIPTION = "Put your pixels on display dawg";
const DEFAULT_COLOR = "1b1d28";
const URL_PREFIX = "https://";
const CANVAS_SIZE = PX_WIDTH * PX_HEIGHT;

const IMAGE_REGEX = /\.(jpg|jpeg|png|gif|bmp|webp)$/i;

let canvas: CanvasLayout | false = [];
let isColoredPixel = Array(CANVAS_SIZE).fill(false);

export const getDefaultCanvas = (): CanvasLayout => {
  const default_socials = getDefaultSocials();
  const default_pixel = getDefaultPixel(default_socials);
  return Array(CANVAS_SIZE).fill(default_pixel);
};

export const invertColor = (color: string) => {
  color = color.replace(/^#/, "");
  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);
  r = 255 - r;
  g = 255 - g;
  b = 255 - b;
  const invertedColor = `${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)
    .toUpperCase()}`;
  return invertedColor;
};

export const getDefaultSocials = (): Socials => {
  return {
    payer: DEFAULLT_PAYER,
    token: DEFAULT_TOKEN,
    website: DEFAULT_WEBSITE,
    twitter: DEFAULT_TWITTER,
    community: DEFAULT_COMMUNITY,
    image: DEFAULT_IMAGE,
    name: DEFAULT_NAME,
    ticker: DEFAULT_TICKER,
    description: DEFAULT_DESCRIPTION,
  };
};

const getDefaultPixel = (socials: Socials): MetadataItem => {
  return {
    color: DEFAULT_COLOR,
    socials,
  };
};

const parseImage = (image: string) => {
  if (IMAGE_REGEX.test(image)) return image;
  console.warn(`Invalid image ${image}`);
  return "";
};

const parseUrl = (urlString: string, name: string) => {
  urlString = URL_PREFIX + urlString;
  try {
    const isValidUrl = urlRegex({ strict: false, exact: true }).test(urlString);
    if (!isValidUrl) {
      console.warn(`Invalid url ${urlString} for ${name}`);
      return "";
    }
    return urlString;
  } catch (error) {
    console.warn(`Invalid url ${urlString} for ${name}: ${error}`);
    return "";
  }
};

const parseTwitter = (twitter: string) => {
  if (USER_REGEX.test(twitter)) return "https://x.com/" + twitter;
  console.warn(`Invalid twitter ${twitter}`);
  return "";
};

const parseSocials = (socials: Socials) => {
  let {
    payer,
    token,
    website,
    twitter,
    community,
    image,
    name,
    ticker,
    description,
  } = socials;
  if (!payer)
    throw new Error(`Invalid payer for website ${website} and token ${token}`);
  if (!token) throw new Error(`Invalid token for payer ${payer}`);
  if (token === DEFAULT_TOKEN) token = "";
  if (website) website = parseUrl(website, "website");
  if (twitter) twitter = parseTwitter(twitter);
  if (community) community = parseUrl(community, "community");
  if (image) image = parseUrl(image, "image");
  if (image) image = parseImage(image);
  return {
    payer,
    token,
    website,
    twitter,
    community,
    image,
    name,
    ticker,
    description,
  };
};

const fetchLatestCanvas = async () => {
  const response = await fetch(SERVER_URL);
  if (!response.ok) {
    console.error(response.status);
    return false;
  }
  const canvas = (await response.json()) as CanvasLayout;
  return canvas;
};

export const getUpdatedCanvas = (
  oldCanvas: CanvasLayout,
  account: MetadataAccountParsed,
  pixelsLeft?: number
): number | CanvasLayout => {
  let canvas: CanvasLayout;
  if (pixelsLeft)
    canvas = oldCanvas; // think of pixelsLeft as a isMutatingInPlace bool
  else canvas = JSON.parse(JSON.stringify(oldCanvas)); // look at return values to get a better picture
  const { payer, token, data, website, twitter, community, image } = account;
  const socialsRAW = {
    payer,
    token,
    website,
    twitter,
    community,
    image,
  };
  if (data.length !== MAX_DATA_SIZE)
    throw Error(`Invalid data size for ${socialsRAW}`);
  const socials = parseSocials(socialsRAW);
  for (let i = 0; i < MAX_DATA_SIZE; i += PX_SIZE) {
    const x = data[i];
    const y = data[i + 1];
    const R = data[i + 2];
    const G = data[i + 3];
    const B = data[i + 4];
    if (x === DATA_DELIMITER) break;
    if (x >= PX_WIDTH || x < 0) throw new Error(`Invalid x ${x} at index ${i}`);
    if (y >= PX_HEIGHT || y < 0) {
      throw new Error(`Invalid y ${y} at index ${i}`);
    }
    if (R < 0 || R > 255) throw new Error(`Invalid R ${R} at index ${i}`);
    if (G < 0 || G > 255) throw new Error(`Invalid G ${G} at index ${i}`);
    if (B < 0 || B > 255) throw new Error(`Invalid B ${B} at index ${i}`);
    const index = x + y * PX_WIDTH;
    if (pixelsLeft && !isColoredPixel[index]) {
      pixelsLeft--;
      isColoredPixel[index] = true;
      canvas[index] = {
        color:
          R.toString(16).padStart(2, "0") +
          G.toString(16).padStart(2, "0") +
          B.toString(16).padStart(2, "0"),
        socials,
      };
    } else if (!pixelsLeft)
      canvas[index] = {
        color:
          R.toString(16).padStart(2, "0") +
          G.toString(16).padStart(2, "0") +
          B.toString(16).padStart(2, "0"),
        socials,
      };
    if (pixelsLeft && pixelsLeft <= 0) break;
  }
  return pixelsLeft ? pixelsLeft : canvas;
};

const getLatestCanvas = async (endpoint: string) => {
  const canvas = getDefaultCanvas();
  const anchorInterface = new AnchorInterface(new Connection(endpoint));
  const accounts = await anchorInterface.getAllAccounts(endpoint);
  let pixelsLeft = CANVAS_SIZE;
  if (accounts) {
    let i = 0;
    for (const account of accounts) {
      if (i === 0) {
        i++;
      }
      try {
        pixelsLeft = getUpdatedCanvas(canvas, account, pixelsLeft) as number;
        if (pixelsLeft <= 0) break;
      } catch (error) {
        console.warn(`Error for account ${JSON.stringify(account)}: ${error}`);
      }
    }
  }
  return canvas;
};

export const getEmptyCanvas = () => {
  const socials = getDefaultSocials();
  return Array.from({ length: CANVAS_SIZE }, () => ({
    color: "",
    socials,
  }));
};

export const initAndGetCanvas = async (
  endpoint?: string
): Promise<CanvasLayout | false | null> => {
  try {
    if (endpoint && (await isHealthyEndpoint(endpoint))) {
      return await getLatestCanvas(endpoint);
    }
    canvas = await fetchLatestCanvas();
    return canvas;
  } catch (error) {
    console.error(`Error retrieving canvas: ${error}`);
    return null;
  }
};

export const drawPixel = (
  x: number,
  y: number,
  color: string,
  squareSize: number,
  ctx: CanvasRenderingContext2D
) => {
  ctx.fillStyle = `#${color}`; // Set the fill color
  ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize); // Draw the filled square
  return ctx; // Return the context
};
