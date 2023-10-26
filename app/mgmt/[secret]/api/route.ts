import { PARTYKIT_URL } from "@/app/env";
import { NextRequest } from "next/server";

const PARTY_SECRET = process.env.PARTY_SECRET;

export const DELETE = (req: NextRequest) => {
  if (PARTY_SECRET && req.nextUrl.pathname.includes(PARTY_SECRET)) {
    const id = req.nextUrl.searchParams.get("id");
    if (id) {
      return fetch(`${PARTYKIT_URL}/party/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: PARTY_SECRET,
        },
      });
    }
  }

  return new Response("Bad request", { status: 400 });
};
