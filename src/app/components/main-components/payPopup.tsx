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
import { PayButtonProps, PayPopupProps, Socials } from "@/app/types";
import { isValidAddress } from "@/app/web3/misc";
import {
  HTMLInputTypeAttribute,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getDefaultSocials } from "./canvas-components/canvas-util";
import { Toast } from "primereact/toast";
import { SelectTokenContext } from "@/app/context/SelectTokenProvider";
import {
  calculateUtf8StringSize,
  extractTwitterUser,
  isValidImageUrl,
  isValidUrl,
  parseUrl,
  PayButton,
  TextField,
} from "./pay_popup-components";
import { TOAST_LIFE_MS } from "@/app/constants-styles";

const INVALID_URL_ERROR = "Invalid URL";
const UNSUPPORTED_IMAGE_FORMAT_ERROR = "Unsupported Image Format!";

const EMPTY_SOCIALS = getDefaultSocials();

for (let key in EMPTY_SOCIALS) {
  if (EMPTY_SOCIALS.hasOwnProperty(key)) {
    EMPTY_SOCIALS[key as keyof Socials] = "";
  }
}

export default function PayPopup(props: PayPopupProps) {
  const { popupPay, onClosePopupPay, coloredPixelsDict, exitEditMode } = props;
  const menuRef = useRef<HTMLDivElement>(null);
  const [socials, setSocials] = useState<Socials>(EMPTY_SOCIALS);
  const [errorLabels, setErrorLabels] = useState<Socials>(EMPTY_SOCIALS);
  const isInitialRender = useRef(true);
  const socialsSize = calculateUtf8StringSize(socials);
  const toast = useRef<Toast>(null);
  const selectTokenContext = useContext(SelectTokenContext);
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
        life: TOAST_LIFE_MS,
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
        life: TOAST_LIFE_MS,
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

  const payButtonProps: PayButtonProps = {
    token: selectTokenContext.token,
    coloredPixelsDict,
    toast,
    exitEditMode,
    onClosePopupPay,
    socialsSize,
    socials,
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
          <PayButton {...payButtonProps}></PayButton>
        </div>
      </BackdropCommon>
      <Toast ref={toast}></Toast>
    </>
  );
}
