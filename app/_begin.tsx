"use client";

import { SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/20/solid";
import * as Slider from "@radix-ui/react-slider";
import { useState } from "react";

export default function Page() {
  let [volume, setVolume] = useState(50);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full px-12">
        <div className="flex justify-center">
          <div className="flex w-full max-w-sm items-center gap-3">
            <div>
              <SpeakerXMarkIcon className="size-5 text-white" />
            </div>

            <Slider.Root
              value={[volume]}
              onValueChange={([v]) => setVolume(v)}
              className="relative flex w-full grow cursor-grab touch-none items-center py-4 active:cursor-grabbing"
            >
              <div className="flex h-1.5 grow">
                <Slider.Track className="relative h-full grow overflow-hidden rounded-full bg-white">
                  <Slider.Range className="absolute h-full bg-sky-500" />
                </Slider.Track>
              </div>
              <Slider.Thumb />
            </Slider.Root>

            <div>
              <SpeakerWaveIcon className="size-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <p className="mt-1 text-center font-medium">
        Volume: <span className="tabular-nums">{volume}</span>
      </p>
    </div>
  );
}
