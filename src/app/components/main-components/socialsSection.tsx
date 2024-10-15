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
  return (
    <div
      id="socials-tab"
      style={{
        visibility: payer ? "visible" : "hidden",
        display: isEditMode ? "none" : "flex",
      }}
      className="flex flex-col bg-color-2 p-6 gap-2"
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
          ${ticker}
        </a>
      </h3>
      <div
        style={{
          display: image ? "block" : "none",
          maxWidth: "80%",
          aspectRatio: "1 / 1",
        }}
      >
        <img src={image} alt="image" className="max-w-32"></img>
      </div>
      <h3 className="font-semibold text-xl">About</h3>
      <p style={{ display: description ? "block" : "none" }}>{description}</p>
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
        <a href={`https://dexscreener.com/solana/${token}`} target="_blank">
          Dexscreener
        </a>
      </button>
    </div>
  );
}
