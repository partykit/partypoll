import { notFound } from "next/navigation";
import { PARTYKIT_URL } from "@/app/env";
import { PollWithMetadata } from "@/party/polls";
import PollList from "./PollList";

const PARTY_SECRET = process.env.PARTY_SECRET;

export default async function ManagementPage({
  params,
}: {
  params: { secret: string };
}) {
  if (params.secret !== PARTY_SECRET) {
    return notFound();
  }

  const req = await fetch(`${PARTYKIT_URL}/parties/polls/list`, {
    method: "GET",
    headers: {
      Authorization: `${PARTY_SECRET}`,
    },
    next: {
      revalidate: 0,
    },
  });

  if (!req.ok) {
    if (req.status === 404) {
      notFound();
    } else {
      throw new Error("Something went wrong: " + (await req.text()));
    }
  }

  const polls = (await req.json()) as Record<string, PollWithMetadata>;

  return (
    <>
      <PollList initialPolls={polls} />
    </>
  );
}
