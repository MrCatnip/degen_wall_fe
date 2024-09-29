import {
  BackdropCommon,
  ConnectWalletButton,
  SelectTokenDropdown,
  TokenBalanceDisplay,
} from "@/app/common";
import {
  MAX_DATA_SIZE,
  MAX_SOCIALS_SIZE,
  NAME_LENGTH,
  PX_SIZE,
  TICKER_LENGTH,
  USER_REGEX,
} from "@/app/constants";
import { AnchorContext } from "@/app/context/AnchorProvider";
import {
  ColoredPixelsDict,
  PayPopupProps,
  Socials,
  TxResult,
} from "@/app/types";
import { isValidAddress } from "@/app/web3/misc";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  HTMLInputTypeAttribute,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import urlRegex from "url-regex";
import { getDefaultSocials } from "./canvas-components/canvas-util";
import { Toast } from "primereact/toast";
import { CircularProgress } from "@mui/material";
import { SelectTokenContext } from "@/app/context/SelectTokenProvider";
import eventEmitter from "@/app/hooks/eventEmitter";
import { EVENT_NAME } from "@/app/constantsUncircular";

const TWITTER_REGEX = /(?:twitter\.com\/|x\.com\/)([A-Za-z0-9_]+)(?:[/?]|$)/;
const INVALID_URL_ERROR = "Invalid URL";
const TX_TIMEOUT_MS = 30 * 1000;
const MAX_RETRY_ATTEMPTS = 3;

const arraysEqual = (arr1: number[], arr2: number[]) => {
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

const extractTwitterUser = (url: string) => {
  const match = url.match(TWITTER_REGEX);
  return match ? match[1] : null;
};

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const isValidUrl = (urlString: string) => {
  return urlRegex({ strict: false, exact: true }).test("https://" + urlString);
};

const parseUrl = (urlString: string) => {
  return urlString.replace(/^https?:\/\//, "");
};
const EMPTY_SOCIALS: Socials = {
  payer: "",
  name: "",
  ticker: "",
  token: "",
  website: "",
  twitter: "",
  community: "",
  description: "",
  image: "",
};

const splitObjectIntoChunks = (
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

const DEFAULT_SOCIALS = getDefaultSocials();

const calculateUtf8StringSize = (socials: Socials) => {
  const mergedString = Object.keys(socials)
    .filter((key) => key !== "payer" && key !== "token") // Exclude "payer" and "token"
    .map((key) => socials[key as keyof Socials])
    .join("");
  const encoder = new TextEncoder();
  const utf8Bytes = encoder.encode(mergedString);
  return utf8Bytes.length;
};

export default function PayPopup(props: PayPopupProps) {
  const { popupPay, onClosePopupPay, coloredPixelsDict, exitEditMode } = props;
  const menuRef = useRef<HTMLDivElement>(null);
  const anchorContext = useContext(AnchorContext);
  const [socials, setSocials] = useState<Socials>(EMPTY_SOCIALS);
  const [errorLabels, setErrorLabels] = useState<Socials>(EMPTY_SOCIALS);
  const isInitialRender = useRef(true);
  const wallet = useWallet();
  const socialsSize = calculateUtf8StringSize(socials);
  const toast = useRef<Toast>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const selectTokenContext = useContext(SelectTokenContext);
  const [chunk, setChunk] = useState({ length: 0, count: 0 });

  useEffect(() => {
    if (popupPay && isInitialRender.current) {
      isInitialRender.current = false;
      setSocials(EMPTY_SOCIALS);
      setErrorLabels(EMPTY_SOCIALS);
    } else if (!popupPay) {
      isInitialRender.current = true;
    }
  }, [popupPay]);

  const validateName = (name: string) => {
    if (name.length > NAME_LENGTH) {
      toast?.current?.show({
        severity: "error",
        detail: `Name can't be bigger than ${NAME_LENGTH}!`,
        life: 3000,
      });
    } else {
      setSocials((prevSocials) => ({ ...prevSocials, name }));
    }
  };

  const validateTicker = (ticker: string) => {
    if (ticker.length > TICKER_LENGTH) {
      toast?.current?.show({
        severity: "error",
        detail: `Ticker can't be bigger than ${TICKER_LENGTH}!`,
        life: 3000,
      });
    } else {
      setSocials((prevSocials) => ({ ...prevSocials, ticker }));
    }
  };

  const validateToken = (token: string) => {
    let errorLabel = "";
    if (token) {
      if (!isValidAddress(token)) errorLabel = "Invalid address";
    }
    setSocials((prevSocials) => ({ ...prevSocials, token }));
    setErrorLabels((prevErrorLabels) => ({
      ...prevErrorLabels,
      token: errorLabel,
    }));
  };

  const validateDescription = (description: string) => {
    setSocials((prevSocials) => ({ ...prevSocials, description }));
  };

  const validateWebsite = (websiteHttps: string) => {
    let website = "";
    let errorLabel = "";
    if (websiteHttps) {
      website = parseUrl(websiteHttps);
      if (!isValidUrl(website)) errorLabel = INVALID_URL_ERROR;
    }
    setSocials((prevSocials) => ({ ...prevSocials, website }));
    setErrorLabels((prevErrorLabels) => ({
      ...prevErrorLabels,
      website: errorLabel,
    }));
  };

  const validateTwitter = (twitterHttps: string) => {
    let twitter = "";
    let errorLabel = "";
    if (twitterHttps) {
      twitter = parseUrl(twitterHttps);
      if (!isValidUrl(twitter)) errorLabel = INVALID_URL_ERROR;
      else {
        const twitterUser = extractTwitterUser(twitter);
        if (!(twitterUser && USER_REGEX.test(twitterUser)))
          errorLabel = "Invalid user";
      }
    }
    setSocials((prevSocials) => ({ ...prevSocials, twitter }));
    setErrorLabels((prevErrorLabels) => ({
      ...prevErrorLabels,
      twitter: errorLabel,
    }));
  };

  const validateCommunity = (communityHttps: string) => {
    let community = "";
    let errorLabel = "";
    if (communityHttps) {
      community = parseUrl(communityHttps);
      if (!isValidUrl(community)) errorLabel = INVALID_URL_ERROR;
    }
    setSocials((prevSocials) => ({ ...prevSocials, community }));
    setErrorLabels((prevErrorLabels) => ({
      ...prevErrorLabels,
      community: errorLabel,
    }));
  };

  const validateImage = (imageHttps: string) => {
    let image = "";
    let errorLabel = "";
    if (imageHttps) {
      image = parseUrl(imageHttps);
      if (!isValidUrl(image)) errorLabel = INVALID_URL_ERROR;
    }
    setSocials((prevSocials) => ({ ...prevSocials, image }));
    setErrorLabels((prevErrorLabels) => ({
      ...prevErrorLabels,
      image: errorLabel,
    }));
  };

  const onPay = async () => {
    setIsLoading(true);
    setRetryCount(0);
    if (anchorContext && wallet?.publicKey) {
      try {
        const processChunks = async (chunks: ColoredPixelsDict[]) => {
          for (let i = 0; i < chunks.length; i++) {
            if (retryCount > MAX_RETRY_ATTEMPTS)
              throw new Error("Couldn't process tx");
            setChunk({ count: i + 1, length: chunks.length });
            const id = anchorContext.generateId();

            // Create a promise for the event listener
            const eventPromise: Promise<TxResult> = new Promise((resolve) => {
              const handleEvent = (eventId: number[]) => {
                try {
                  if (arraysEqual(id, eventId)) {
                    resolve("Success");
                  }
                } catch (error) {
                  console.error(error);
                  resolve("EventError");
                } finally {
                  eventEmitter.off(EVENT_NAME, handleEvent); // Unsubscribe from the event after it resolves
                }
              };
              eventEmitter.on(EVENT_NAME, handleEvent);
            });

            const timeoutPromise: Promise<TxResult> = new Promise((resolve) =>
              setTimeout(() => resolve("Timeout"), TX_TIMEOUT_MS)
            );

            const txResult: TxResult = await Promise.race([
              anchorContext.createMetadataAccount(
                //@ts-expect-error shut the fuck up
                { ...socials, payer: wallet?.publicKey.toString() },
                chunks[i],
                selectTokenContext.token,
                id
              ),
              eventPromise,
              timeoutPromise,
            ]);
            if (txResult !== "Success") {
              i--;
              setRetryCount((prevRetrycount) => prevRetrycount + 1);
            } else if (retryCount) {
              setRetryCount(0);
            }
          }
        };

        if (Object.keys(coloredPixelsDict).length <= 100) {
          await processChunks([coloredPixelsDict]);
        } else {
          const coloredPixelsDictArray =
            splitObjectIntoChunks(coloredPixelsDict);
          await processChunks(coloredPixelsDictArray);
        }

        toast?.current?.show({
          severity: "success",
          summary: "Success!",
          detail: "That was a breeze, wasn't it?",
          life: 3000,
        });
        exitEditMode();
        onClosePopupPay();
      } catch (error) {
        console.error(error);
        toast?.current?.show({
          severity: "error",
          summary: "Error!",
          detail: "Transaction failed!",
          life: 3000,
        });
      }
    }
    setIsLoading(false);
  };

  const TextField = (props: {
    id: keyof Socials;
    type: HTMLInputTypeAttribute;
    validate: (value: string) => void;
  }) => {
    const { id: key, type, validate } = props;
    return (
      <div>
        <label htmlFor={`${key}`}>
          {`${capitalize(key)}${type === "url" ? " URL" : ""}`}
          {` (optional)`}
        </label>
        <div>
          {type === "url" && (
            <label htmlFor={`${key}`} className="bg-slate-500">
              https://
            </label>
          )}{" "}
          <input
            id={`${key}`}
            type={type}
            spellCheck="false"
            placeholder={
              type === "url"
                ? `${DEFAULT_SOCIALS[key]?.replace("https://", "")}`
                : `${DEFAULT_SOCIALS[key]}`
            }
            value={socials[key] || ""}
            onChange={(event) => validate(event.target.value)}
          ></input>
        </div>
        <label htmlFor={`${key}`}>{errorLabels[key]}</label>
      </div>
    );
  };

  return (
    <>
      <BackdropCommon open={popupPay}>
        <div ref={menuRef} className="bg-green-100 text-black relative">
          <ConnectWalletButton></ConnectWalletButton>
          <TokenBalanceDisplay></TokenBalanceDisplay>
          <SelectTokenDropdown></SelectTokenDropdown>
          <button className="absolute top-0 right-0" onClick={onClosePopupPay}>
            X
          </button>
          <div>
            {TextField({ id: "name", type: "text", validate: validateName })}
            {TextField({
              id: "ticker",
              type: "text",
              validate: validateTicker,
            })}
            {TextField({
              id: "website",
              type: "url",
              validate: validateWebsite,
            })}
            {TextField({
              id: "twitter",
              type: "url",
              validate: validateTwitter,
            })}
            {TextField({
              id: "community",
              type: "url",
              validate: validateCommunity,
            })}
            {TextField({ id: "image", type: "url", validate: validateImage })}
            {TextField({
              id: "description",
              type: "text",
              validate: validateDescription,
            })}
            <div className="flex flex-col">
              <span id="character-count">
                Character Count: {socialsSize}/{MAX_SOCIALS_SIZE}
              </span>
              <label
                htmlFor="character-count"
                style={{
                  display: socialsSize > MAX_SOCIALS_SIZE ? "inline" : "none",
                }}
              >
                Character count cannot be greater than {MAX_SOCIALS_SIZE}.
                Please trim your socials!
              </label>
            </div>
            {TextField({ id: "token", type: "text", validate: validateToken })}
          </div>
          {isLoading ? (
            <div>
              <CircularProgress />
              <span>
                {chunk.count}/{chunk.length}
              </span>
              {retryCount && (
                <span>
                  Retrying {retryCount}/{MAX_RETRY_ATTEMPTS}
                </span>
              )}
            </div>
          ) : (
            <button
              onClick={onPay}
              disabled={
                !(anchorContext && wallet?.publicKey) ||
                socialsSize > MAX_SOCIALS_SIZE
              }
            >
              Pay
            </button>
          )}
        </div>
      </BackdropCommon>
      <Toast ref={toast}></Toast>
    </>
  );
}
