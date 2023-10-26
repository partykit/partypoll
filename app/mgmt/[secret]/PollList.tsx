"use client";

import { PARTYKIT_HOST } from "@/app/env";
import { PollWithMetadata } from "@/party/polls";
import usePartySocket from "partysocket/react";
import { useState } from "react";

const sum = (arr?: number[]) => arr?.reduce((a, b) => a + b, 0) ?? 0;

function ListItem({ poll }: { poll: PollWithMetadata }) {
  const [sure, setSure] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const deletePoll = async () => {
    setDeleted(true);
    try {
      const req = await fetch(`${window.location.pathname}/api?id=${poll.id}`, {
        method: "DELETE",
      });

      if (!req.ok) {
        throw new Error("Something went wrong: " + (await req.text()));
      }
    } catch (e) {
      console.error(e);
      setDeleted(false);
    }
  };

  if (deleted) {
    return null;
  }

  return (
    <li key={poll.id} className="grid grid-cols-3">
      <span>
        <a className="underline" href={`/${poll.id}`}>
          {poll.title}
        </a>
        <span> ({sum(poll.votes)} votes)</span>
      </span>
      <span>{new Date(poll.created!).toLocaleString()}</span>
      <span>
        {sure ? (
          <button className="underline text-red-500" onDoubleClick={deletePoll}>
            Double click to confirm
          </button>
        ) : (
          <button className="underline" onClick={() => setSure(true)}>
            Delete
          </button>
        )}
      </span>
    </li>
  );
}

export default function PollList({
  initialPolls,
}: {
  initialPolls: Record<string, PollWithMetadata>;
}) {
  const [polls, setPolls] = useState(initialPolls);

  usePartySocket({
    host: PARTYKIT_HOST,
    party: "polls",
    room: "list",
    onMessage(event) {
      const message = JSON.parse(event.data);
      if (message.update) {
        setPolls((prev) => ({ ...prev, ...message.update }));
      }
    },
  });

  return (
    <div className="flex flex-col space-y-4">
      <ul>
        {Object.values(polls).map((poll) =>
          poll && poll.id ? <ListItem key={poll.id} poll={poll} /> : null
        )}
      </ul>
    </div>
  );
}
