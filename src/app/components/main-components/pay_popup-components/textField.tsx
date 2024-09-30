import { Socials } from "@/app/types";
import { HTMLInputTypeAttribute } from "react";
import { getDefaultSocials } from "../canvas-components/canvas-util";

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
const DEFAULT_SOCIALS = getDefaultSocials();

export default function TextField(props: {
  id: keyof Socials;
  type: HTMLInputTypeAttribute;
  value: string | undefined;
  error: string | undefined;
  validate: (value: string) => void;
}) {
  const { id: key, type, value, error, validate } = props;
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
        )}
        <input
          id={`${key}`}
          type={type}
          spellCheck="false"
          placeholder={
            type === "url"
              ? `${DEFAULT_SOCIALS[key]?.replace("https://", "")}`
              : `${DEFAULT_SOCIALS[key]}`
          }
          value={value || ""}
          onChange={(event) => validate(event.target.value)}
        ></input>
      </div>
      <label htmlFor={`${key}`}>{error}</label>
    </div>
  );
}
