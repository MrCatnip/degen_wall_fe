import { AnchorContext } from "@/app/context/AnchorProvider";
import { ColoredPixelsDict, PayButtonProps, TxResult } from "@/app/types";
import { useWallet } from "@solana/wallet-adapter-react";
import { useContext, useState } from "react";
import { arraysEqual, splitObjectIntoChunks } from "./validate-utils";
import eventEmitter from "@/app/hooks/eventEmitter";
import { EVENT_NAME } from "@/app/constantsUncircular";
import { CircularProgress } from "@mui/material";
import { MAX_SOCIALS_SIZE } from "@/app/constants";
import { TOAST_LIFE_MS } from "@/app/constants-styles";

const MAX_RETRY_ATTEMPTS = 3;

export default function PayButton(props: PayButtonProps) {
  const {
    token,
    coloredPixelsDict,
    toast,
    exitEditMode,
    onClosePopupPay,
    socialsSize,
    socials,
    errorsExist,
  } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [chunk, setChunk] = useState({ length: 0, count: 0 });
  const [retryCount, setRetryCount] = useState(0);
  const anchorContext = useContext(AnchorContext);
  const wallet = useWallet();

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
                token,
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
          life: TOAST_LIFE_MS,
          className: "toast-success",
        });
        exitEditMode();
        onClosePopupPay();
      } catch (error) {
        console.error(error);
        toast?.current?.show({
          severity: "error",
          summary: "Error!", //@ts-expect-error shut the fuck up!
          detail: error.message,
          life: TOAST_LIFE_MS,
          className: "toast-error",
        });
      }
    }
    setIsLoading(false);
    setRetryCount(0);
  };

  const payButtonDisabled =
    !(anchorContext && wallet?.publicKey) ||
    socialsSize > MAX_SOCIALS_SIZE ||
    errorsExist;

  return isLoading ? (
    <div className="flex flex-col">
      <div className="flex justify-center">
        <CircularProgress sx={{ color: "var(--color-4)" }} />
      </div>
      <div className="flex justify-center">
        <span>
          Awaiting tx {chunk.count}/{chunk.length}
        </span>
      </div>
      <div className="flex justify-center">
        <span style={{ visibility: retryCount ? "visible" : "hidden" }}>
          Retrying {retryCount}/{MAX_RETRY_ATTEMPTS}
        </span>
      </div>
    </div>
  ) : (
    <button
      onClick={onPay}
      disabled={payButtonDisabled}
      className={
        "common-button" + (payButtonDisabled ? " common-button-disabled" : "")
      }
    >
      Pay
    </button>
  );
}
