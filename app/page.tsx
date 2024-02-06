"use client";

import { XMarkIcon } from "@heroicons/react/16/solid";
import {
  InformationCircleIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from "@heroicons/react/20/solid";
import * as Slider from "@radix-ui/react-slider";
import {
  AnimatePresence,
  MotionValue,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import { ElementRef, ReactNode, useRef, useState } from "react";

// Sigmoid-based decay function
function decay(value: number, max: number) {
  if (max === 0) {
    return 0;
  }

  let entry = value / max;
  let sigmoid = 2 * (1 / (1 + Math.exp(-entry)) - 0.5);

  return sigmoid * max;
}

export default function Page() {
  let [volume, setVolume] = useState(50);
  let [debug, setDebug] = useState(false);
  let [maxOverflow, setMaxOverflow] = useState(50);

  let ref = useRef<ElementRef<typeof Slider.Root>>(null);
  let [region, setRegion] = useState("middle");
  let clientX = useMotionValue(0);
  let overflow = useMotionValue(0);
  let scale = useMotionValue(1);

  useMotionValueEvent(clientX, "change", (latest) => {
    if (ref.current) {
      let { left, right } = ref.current.getBoundingClientRect();
      let newValue;

      if (latest < left) {
        setRegion("left");
        newValue = left - latest;
      } else if (latest > right) {
        setRegion("right");
        newValue = latest - right;
      } else {
        setRegion("middle");
        newValue = 0;
      }

      overflow.jump(decay(newValue, maxOverflow));
    }
  });

  // Info bar state
  let [isUsingPointer, setIsUsingPointer] = useState(false);

  return (
    <div className="flex min-h-full flex-col items-center justify-center overflow-hidden">
      <div className="relative flex w-full grow flex-col items-center justify-center">
        <div className="flex w-full select-none px-12">
          <motion.div
            onHoverStart={() => animate(scale, 1.2)}
            onHoverEnd={() => animate(scale, 1)}
            onTouchStart={() => animate(scale, 1.2)}
            onTouchEnd={() => animate(scale, 1)}
            style={{
              scale,
              opacity: useTransform(scale, [1, 1.2], [0.7, 1]),
            }}
            className="flex w-full touch-none select-none items-center justify-center gap-3"
          >
            <motion.div
              animate={{
                scale: region === "left" ? [1, 1.4, 1] : 1,
                transition: { duration: 0.25 },
              }}
              style={{
                x: useTransform(() =>
                  region === "left" ? -overflow.get() / scale.get() : 0,
                ),
              }}
            >
              <SpeakerXMarkIcon className="size-5 translate-x-0 translate-y-0 text-white" />
            </motion.div>

            <Slider.Root
              ref={ref}
              value={[volume]}
              onValueChange={([v]) => setVolume(Math.floor(v))}
              step={0.01}
              className="relative flex w-full max-w-[200px] grow cursor-grab touch-none select-none items-center py-4 active:cursor-grabbing"
              onPointerMove={(e) => {
                if (e.buttons > 0) {
                  clientX.jump(e.clientX);
                }
              }}
              onLostPointerCapture={() => {
                animate(overflow, 0, { type: "spring", bounce: 0.5 });
              }}
            >
              <motion.div
                style={{
                  scaleX: useTransform(() => {
                    if (ref.current) {
                      let { width } = ref.current.getBoundingClientRect();

                      return 1 + overflow.get() / width;
                    }
                  }),
                  scaleY: useTransform(overflow, [0, maxOverflow], [1, 0.8]),
                  transformOrigin: useTransform(() => {
                    if (ref.current) {
                      let { left, width } = ref.current.getBoundingClientRect();

                      return clientX.get() < left + width / 2
                        ? "right"
                        : "left";
                    }
                  }),
                  height: useTransform(scale, [1, 1.2], [6, 12]),
                  marginTop: useTransform(scale, [1, 1.2], [0, -3]),
                  marginBottom: useTransform(scale, [1, 1.2], [0, -3]),
                }}
                className="flex grow"
              >
                <Slider.Track className="relative isolate h-full grow overflow-hidden rounded-full bg-gray-500 ">
                  <Slider.Range className="absolute h-full bg-white" />
                </Slider.Track>
              </motion.div>
              <Slider.Thumb />
            </Slider.Root>

            <motion.div
              animate={{
                scale: region === "right" ? [1, 1.4, 1] : 1,
                transition: { duration: 0.25 },
              }}
              style={{
                x: useTransform(() =>
                  region === "right" ? overflow.get() / scale.get() : 0,
                ),
              }}
            >
              <SpeakerWaveIcon className="size-5 translate-x-0 translate-y-0 text-white" />
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0">
          <button
            onClick={() => setDebug(true)}
            className="m-1 rounded-md p-2 text-gray-600 hover:text-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
            tabIndex={debug ? -1 : undefined}
          >
            <InformationCircleIcon className="size-5" />
          </button>
        </div>

        {/* Info bar */}
        <AnimatePresence>
          {debug && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="absolute inset-x-0 bottom-0"
            >
              <div className="relative p-2">
                <div className="absolute left-2.5 top-2.5">
                  <button
                    onClick={() => setDebug(false)}
                    className="rounded-sm p-2 text-gray-500 hover:text-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
                  >
                    <XMarkIcon className="size-4" />
                  </button>
                </div>
                <div className="flex rounded bg-gray-700 px-4 py-3 shadow-md shadow-black/30">
                  <div className="grid grow grid-cols-4">
                    <Stat label="Volume">{volume}</Stat>
                    <Stat label="Client X">
                      <MotionValueDebug motionValue={clientX} />
                    </Stat>
                    <Stat label="Overflow">
                      <MotionValueDebug motionValue={overflow} />
                    </Stat>
                    <Stat label="Region">
                      <div className="flex divide-x divide-gray-500/50 rounded-full border border-gray-500/50 bg-gray-600 px-0.5 text-xs font-semibold tracking-tight">
                        <span
                          className={`${
                            region === "left" ? "text-white" : "text-gray-400"
                          } flex h-5 items-center px-1.5`}
                        >
                          L
                        </span>
                        <span
                          className={`${
                            region === "middle" ? "text-white" : "text-gray-400"
                          } flex h-5 items-center px-1.5`}
                        >
                          M
                        </span>
                        <span
                          className={`${
                            region === "right" ? "text-white" : "text-gray-400"
                          } flex h-5 items-center px-1.5`}
                        >
                          R
                        </span>
                      </div>
                    </Stat>
                  </div>
                  <div className="hidden grow justify-end sm:flex">
                    <Stat
                      label={
                        <span className="text-white">
                          Max overflow:{" "}
                          <span className="tabular-nums">{maxOverflow}</span>
                        </span>
                      }
                    >
                      <Slider.Root
                        className="relative flex h-5 w-32 touch-none select-none items-center"
                        value={[maxOverflow]}
                        onValueChange={(value) => setMaxOverflow(value[0])}
                        onPointerDown={() => setIsUsingPointer(true)}
                        onBlur={() => setIsUsingPointer(false)}
                      >
                        <Slider.Track className="relative h-[6px] grow rounded-full bg-gray-500">
                          <Slider.Range className="absolute h-full rounded-full bg-[#6479f2]" />
                        </Slider.Track>
                        <Slider.Thumb
                          className={`block h-4 w-4 cursor-grab rounded-[10px] bg-gray-200 shadow-md transition hover:bg-white active:cursor-grabbing ${
                            isUsingPointer
                              ? "focus:outline-none"
                              : "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
                          }`}
                          aria-label="Minimum delay"
                        />
                      </Slider.Root>
                    </Stat>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Stat({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 font-medium">
      <span className="text-sm font-semibold tabular-nums text-white">
        {children}
      </span>
      <span className="text-right text-xs text-gray-400">{label}</span>
    </div>
  );
}

function MotionValueDebug({ motionValue }: { motionValue: MotionValue }) {
  return (
    <motion.span>
      {useTransform(() => Math.floor(motionValue.get()))}
    </motion.span>
  );
}
