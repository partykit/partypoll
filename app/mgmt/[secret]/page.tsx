import { notFound } from "next/navigation";
import { PARTYKIT_URL } from "@/app/env";
import { PollWithMetadata } from "@/party/polls";

const PARTY_SECRET = process.env.PARTY_SECRET;

const sum = (arr?: number[]) => arr?.reduce((a, b) => a + b, 0) ?? 0;

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

  const poll = (await req.json()) as Record<string, PollWithMetadata>;

  return (
    <>
      <div className="flex flex-col space-y-4">
        <ul>
          {Object.values(poll).map((poll) => (
            <li key={poll.id} className="grid grid-cols-2">
              <span>
                <a className="underline" href={`/${poll.id}`}>
                  {poll.title}
                </a>
                <span> ({sum(poll.votes)} votes)</span>
              </span>
              <span>{new Date(poll.created!).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
