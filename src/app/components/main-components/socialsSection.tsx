/* eslint-disable @next/next/no-img-element */
import { Socials } from "@/app/types";

export default function SocialsSection(
  props: Socials & { isEditMode: boolean }
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
  } = props;

  const isHeaderVisible = name || ticker || image;

  const isAboutSectionVisible =
    description || website || twitter || community || token;

  const isSocialsTabVisible = isHeaderVisible || isAboutSectionVisible;

  return (
    <div
      id="socials-tab"
      className="flex flex-col bg-color-2 p-6"
      style={{ display: isEditMode ? "none" : "flex" }}
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
              className="font-semibold text-xl"
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
                aspectRatio: "1 / 1",
              }}
            >
              <img src={image} alt="image" className="max-w-full"></img>
            </div>
          </div>
          <div
            style={{ display: isAboutSectionVisible ? "flex" : "none" }}
            className="flex-col gap-2"
          >
            <h3 className="font-semibold text-xl">About</h3>
            <p style={{ display: description ? "block" : "none" }}>
              {description}
            </p>
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
