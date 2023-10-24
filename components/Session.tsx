"use client";

import { signOut, signIn, useSession } from "next-auth/react";

export { SessionProvider } from "next-auth/react";

export function Session() {
  const session = useSession();

  switch (session.status) {
    case "authenticated":
      return (
        <button
          onClick={() => signOut({ callbackUrl: `${window.location.href}` })}
          className="underline text-white text-sm"
        >
          Sign out
        </button>
      );
    case "unauthenticated":
      return (
        <button
          className="underline text-white text-sm"
          onClick={() =>
            signIn("github", { callbackUrl: `${window.location.href}` })
          }
        >
          Sign in with GitHub
        </button>
      );
    default:
      return null;
  }
}
