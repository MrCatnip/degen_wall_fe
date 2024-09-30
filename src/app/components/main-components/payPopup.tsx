/* eslint-disable @next/next/no-img-element */
import {
  BackdropCommon,
  ConnectWalletButton,
  SelectTokenDropdown,
  TokenBalanceDisplay,
} from "@/app/common";
import {
  MAX_SOCIALS_SIZE,
  NAME_LENGTH,
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
import { getDefaultSocials } from "./canvas-components/canvas-util";
import { Toast } from "primereact/toast";
import { CircularProgress } from "@mui/material";
import { SelectTokenContext } from "@/app/context/SelectTokenProvider";
import eventEmitter from "@/app/hooks/eventEmitter";
import { EVENT_NAME } from "@/app/constantsUncircular";
import {
  arraysEqual,
  calculateUtf8StringSize,
  extractTwitterUser,
  isValidImageUrl,
  isValidUrl,
  parseUrl,
  splitObjectIntoChunks,
  TextField,
} from "./pay_popup-components";

const INVALID_URL_ERROR = "Invalid URL";
const UNSUPPORTED_IMAGE_FORMAT_ERROR = "Unsupported Image Format!";
const MAX_RETRY_ATTEMPTS = 3;

const EMPTY_SOCIALS = getDefaultSocials();

for (let key in EMPTY_SOCIALS) {
  if (EMPTY_SOCIALS.hasOwnProperty(key)) {
    EMPTY_SOCIALS[key as keyof Socials] = "";
  }
}

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
  const [imgUrl, setImgUrl] = useState<string | null>(null);

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
      else if (!isValidImageUrl(image))
        errorLabel = UNSUPPORTED_IMAGE_FORMAT_ERROR;
      else setImgUrl(`https://${image}`);
    }
    if (errorLabel || !imageHttps) setImgUrl("");
    setSocials((prevSocials) => ({ ...prevSocials, image }));
    setErrorLabels((prevErrorLabels) => ({
      ...prevErrorLabels,
      image: errorLabel,
    }));
  };

  const onPay = async () => {
    setIsLoading(true);
    if (anchorContext && wallet?.publicKey) {
      try {
        const processChunks = async (chunks: ColoredPixelsDict[]) => {
          let retryCount = 0;
          for (let i = 0; i < chunks.length; i++) {
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

            const txResult: TxResult = await Promise.race([
              anchorContext.createMetadataAccount(
                //@ts-expect-error shut the fuck up
                { ...socials, payer: wallet?.publicKey.toString() },
                chunks[i],
                selectTokenContext.token,
                id
              ),
              eventPromise,
            ]);
            if (txResult === "Success") retryCount = 0;
            else if (txResult === "UserRejectedError")
              throw new Error("User rejected request!");
            else if (
              txResult === "UnexpectedError" ||
              txResult === "EventError"
            )
              throw new Error("Unexpected Error!");
            else {
              i--;
              retryCount++;
            }
            if (retryCount > MAX_RETRY_ATTEMPTS) {
              throw new Error(
                `Couldn't process tx no.${i + 1} after ${
                  MAX_RETRY_ATTEMPTS + 1
                } attempts. Reason: ${txResult}`
              );
            }
            setRetryCount(retryCount);
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
          summary: "Error!", //@ts-expect-error shut the fuck up!
          detail: error.message,
          life: 3000,
        });
      }
    }
    setIsLoading(false);
    setRetryCount(0);
  };

  const textFields: {
    id: keyof Socials;
    type: HTMLInputTypeAttribute;
    validate: (value: string) => void;
  }[] = [
    { id: "name", type: "text", validate: validateName },
    { id: "ticker", type: "text", validate: validateTicker },
    { id: "website", type: "url", validate: validateWebsite },
    { id: "twitter", type: "url", validate: validateTwitter },
    { id: "community", type: "url", validate: validateCommunity },
    { id: "description", type: "text", validate: validateDescription },
    { id: "image", type: "url", validate: validateImage },
  ];

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
            {textFields.map(({ id, type, validate }) =>
              TextField({
                id,
                type,
                validate,
                value: socials[id],
                error: errorLabels[id],
              })
            )}
            <div className="max-w-24">
              {imgUrl && <img src={imgUrl} alt="project-image"></img>}
            </div>
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
            {TextField({
              id: "token",
              type: "text",
              validate: validateToken,
              value: socials["token"],
              error: errorLabels["token"],
            })}
          </div>
          {isLoading ? (
            <div className="flex flex-col">
              <CircularProgress />
              <span>
                {chunk.count}/{chunk.length}
              </span>
              {
                <span style={{ visibility: retryCount ? "visible" : "hidden" }}>
                  Retrying {retryCount}/{MAX_RETRY_ATTEMPTS}
                </span>
              }
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
