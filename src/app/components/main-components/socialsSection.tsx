/* eslint-disable @next/next/no-img-element */
import { CANVAS_DISPLAY_RATIO, LG_WIDTH } from "@/app/constants-styles";
import useWindowDimensions from "@/app/hooks/useWindowDimensions";
import { Socials } from "@/app/types";

export default function SocialsSection(
  props: Socials & { isEditMode: boolean; isPopup?: boolean }
) {
  const {
    payer,
    name,
    ticker,
    image,
    description,
    website,
    twitter,
    community,
    token,
    isEditMode,
    isPopup,
  } = props;

  const isHeaderVisible = name || ticker || image || description;

  const isLinkSectionVisible =
    isPopup && (website || twitter || community || token);

  const isSocialsTabVisible = isHeaderVisible || isLinkSectionVisible;

  const { height, width } = useWindowDimensions();

  const socialsSectionWidth =
    width <= LG_WIDTH
      ? "100%"
      : `${Math.floor((1 - CANVAS_DISPLAY_RATIO) * width)}px`;

  return (
    <div
      id="socials-tab"
      className="flex flex-col bg-color-2 p-6 gap-2"
      style={{
        display: isEditMode ? "none" : "flex",
        width: `${socialsSectionWidth}`,
        height: `100%`,
      }}
    >
      {isSocialsTabVisible ? (
        <>
          <div
            style={{ display: isSocialsTabVisible ? "flex" : "none" }}
            className="flex-col gap-2"
          >
            <h3
              style={{
                display: name || ticker ? "block" : "none",
              }}
              className="font-semibold text-xl lg:text-center"
            >
              {name}
              <a
                href={`https://dexscreener.com/solana/${token}`}
                className="text-color-5 hyperlink"
                target="_blank"
              >
                {" "}
                ${ticker}
              </a>
            </h3>
            <div
              style={{
                display: image ? "inline-block" : "none",
                maxWidth: "80%",
              }}
              className="lg:mx-auto"
            >
              <img src={image} alt="image" className="max-w-full lg:mx-auto"></img>
            </div>
            <h3 className="font-semibold text-xl lg:text-center">About</h3>
            <p style={{ display: description ? "block" : "none" }} className="lg:text-center">
              {description}
            </p>
          </div>
          <div
            style={{ display: isLinkSectionVisible ? "flex" : "none" }}
            className="flex-col gap-2"
          >
            <button
              className="common-button"
              style={{ display: website ? "block" : "none" }}
            >
              <a href={`${website}`} target="_blank">
                Website
              </a>
            </button>
            <button
              className="common-button"
              style={{ display: twitter ? "block" : "none" }}
            >
              <a href={`${twitter}`} target="_blank">
                Twitter
              </a>
            </button>
            <button
              className="common-button"
              style={{ display: community ? "block" : "none" }}
            >
              <a href={`${community}`} target="_blank">
                Community
              </a>
            </button>
            <button
              className="common-button"
              style={{ display: token ? "block" : "none" }}
            >
              <a
                href={`https://dexscreener.com/solana/${token}`}
                target="_blank"
              >
                Dexscreener
              </a>
            </button>
          </div>
        </>
      ) : (
        <span className="font-semibold text-xl">Nothing to see here...</span>
      )}
    </div>
  );
}
