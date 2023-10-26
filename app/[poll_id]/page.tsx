import { notFound } from "next/navigation";
import { PARTYKIT_URL } from "@/app/env";
import type { Poll } from "@/app/types";

import PollUI from "@/components/PollUI";
import Balloon from "@/components/Balloon";

export default async function PollPage({
  params,
}: {
  params: { poll_id: string };
}) {
  const pollId = params.poll_id;

  const req = await fetch(`${PARTYKIT_URL}/party/${pollId}`, {
    method: "GET",
    next: {
      revalidate: 0,
    },
  });

  if (!req.ok) {
    if (req.status === 404) {
      notFound();
    } else {
      throw new Error("Something went wrong.");
    }
  }

  const poll = (await req.json()) as Poll;

  return (
    <>
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold">{poll.title}</h1>
        <PollUI id={pollId} options={poll.options} initialVotes={poll.votes} />
      </div>

      <Balloon float />
      <div className="font-medium text-lg pt-8 text-center">
        <a className="underline" href="/">
          Create your own poll!
        </a>
      </div>
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { poll_id: string };
}) {
  const attrs = {
    title: "A live poll created using PartyKit!",
    cta: "Vote now!",
  };

  try {
    const req = await fetch(`${PARTYKIT_URL}/party/${params.poll_id}`);
    if (req.ok) {
      const res = await req.json();
      if (res.title) {
        attrs.title = res.title;
      }
    }
  } catch (e) {
    console.error("Failed to generate metadata for poll page", e);
  }

  return {
    openGraph: {
      images: [`/api/og?${new URLSearchParams(attrs)}`],
    },
  };
}
