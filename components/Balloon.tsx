"use client";

import Image from "next/image";
import balloon from "@/assets/balloon_animated.gif";
import { useEffect, useState } from "react";

export default function Balloon({ float = false }: { float?: boolean }) {
  const [isFloating, setIsFloating] = useState(false);

  useEffect(() => {
    setIsFloating(float);
  }, [float]);

  const transition = isFloating
    ? "transition-transform duration-[10000ms] -translate-y-[999px]"
    : "";

  return (
    <div className="hidden md:block absolute top-1/2 -right-24 -mt-12 cursor-pointer hover:scale-[1.5] hover:lg:scale-[6] hover:translate-x-10 hover:lg:translate-x-24 hover:lg:-translate-y-10 transition-transform duration-[10s]">
      <Image
        onClick={() => setIsFloating(true)}
        className={transition}
        src={balloon}
        alt="An animated joyful happy balloon"
        width={150}
        height={150}
      />
    </div>
  );
}
