import { PARTYKIT_URL } from "@/app/env";
import { NextRequest } from "next/server";

export const DELETE = (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    return fetch(`${PARTYKIT_URL}/party/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: process.env.PARTY_SECRET!,
      },
    });
  }

  return new Response("Missing id", { status: 400 });
};
