"use client";

import { PARTYKIT_HOST } from "@/app/env";
import { Poll } from "@/app/types";
import usePartySocket from "partysocket/react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import PollOptions from "./PollOptions";

const useSessionId = () => {
  const nextAuthSession = useSession();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (nextAuthSession.status === "authenticated") {
      fetch("/session", { method: "POST" })
        .then((res) => res.json())
        .then((session) => setSessionId(session.id));
    }
    if (nextAuthSession.status === "unauthenticated") {
      let localSessionId = localStorage?.getItem("sessionId");
      if (!localSessionId) {
        localSessionId = Math.random().toString(36).substring(2, 10);
        localStorage?.setItem("sessionId", localSessionId);
      }
      setSessionId(localSessionId);
    }
  }, [nextAuthSession.status]);

  return sessionId;
};

export default function PollUI({
  id,
  options,
  initialVotes,
}: {
  id: string;
  options: string[];
  initialVotes?: number[];
}) {
  const sessionId = useSessionId();
  const [votes, setVotes] = useState<number[]>(initialVotes ?? []);
  const [vote, setVote] = useState<number | null>(null);

  const socket = usePartySocket({
    host: PARTYKIT_HOST,
    room: id,
    onMessage(event) {
      const message = JSON.parse(event.data) as Poll;
      if (message.votes) {
        setVotes(message.votes);
      }
      if (message.ownVote) {
        setVote(message.ownVote);
      }
    },
  });

  const sendVote = async (option: number) => {
    if (vote === null) {
      socket.send(JSON.stringify({ type: "vote", option, sessionId }));
      setVote(option);
    }
  };

  // prevent double voting
  useEffect(() => {
    let saved = localStorage?.getItem("poll:" + id);
    if (vote === null && saved !== null) {
      setVote(+saved);
    } else if (vote !== null && saved === null) {
      localStorage?.setItem("poll:" + id, `${vote}`);
    }
  }, [id, vote]);

  useEffect(() => {
    if (socket && sessionId) {
      socket.send(JSON.stringify({ type: "identify", sessionId }));
    }
  }, [socket, sessionId]);

  return (
    <PollOptions
      options={options}
      votes={votes}
      vote={vote}
      setVote={sendVote}
    />
  );
}
