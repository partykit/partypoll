"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col space-y-2">
      <h2 className="text-2xl font-bold">Not Found</h2>
      <Link className="underline" href="/">
        Return Home
      </Link>
    </div>
  );
}
