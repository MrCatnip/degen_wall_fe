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
      className="flex flex-col"
    >
      <p
        style={{
          display: name || ticker ? "block" : "none",
        }}
      >
        {name} ${ticker}
      </p>
      <div style={{ display: image ? "block" : "none" }}>
        <img src={image} alt="image" className="max-w-32"></img>
      </div>
      <p style={{ display: description ? "block" : "none" }}>{description}</p>
      <p style={{ display: website ? "block" : "none" }}>Website: {website}</p>
      <p style={{ display: twitter ? "block" : "none" }}>Twitter: {twitter}</p>
      <p style={{ display: community ? "block" : "none" }}>
        Community: {community}
      </p>
      <p style={{ display: token ? "block" : "none" }}>
        Chart: https://dexscreener.com/solana/{token}
      </p>
    </div>
  );
}
