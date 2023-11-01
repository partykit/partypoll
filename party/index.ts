import type * as Party from "partykit/server";
import type { Poll } from "@/app/types";
import { createSessionHandler } from "./utils/auth";

type ConnectionState = { sessionId: string; vote?: number };

export default class Server implements Party.Server {
  constructor(readonly party: Party.Party) {}

  poll: Poll | undefined;

  static onFetch(req: Party.Request, lobby: Party.FetchLobby) {
    return createSessionHandler(req, lobby);
  }

  async onRequest(req: Party.Request) {
    if (req.method === "POST") {
      const poll = (await req.json()) as Poll;
      this.poll = { ...poll, votes: poll.options.map(() => 0) };
      this.savePoll();
    }

    if (this.poll) {
      return new Response(JSON.stringify(this.poll), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not found", { status: 404 });
  }

  async onMessage(message: string, sender: Party.Connection<ConnectionState>) {
    if (!this.poll) return;

    const event = JSON.parse(message);
    if (event.type === "vote") {
      if ((await this.getVote(sender, event.sessionId)) === null) {
        await this.setVote(sender, event.sessionId, event.option);
        this.poll.votes![event.option] += 1;
        this.party.broadcast(JSON.stringify(this.poll));
        this.savePoll();
      }
    }

    if (event.type === "identify") {
      const vote = await this.getVote(sender, event.sessionId);
      if (vote !== null) {
        sender.send(JSON.stringify({ ...this.poll, ownVote: vote }));
      }
    }
  }

  async savePoll() {
    if (this.poll) {
      await this.party.storage.put<Poll>("poll", this.poll);
    }
  }

  async getVote(
    connection: Party.Connection<ConnectionState>,
    sessionId: string
  ): Promise<number | null> {
    if (connection.state?.sessionId === sessionId) {
      return connection.state.vote ?? null;
    }

    const vote = await this.party.context.parties.session
      .get(sessionId)
      .fetch(`/vote/${this.party.id}`, { method: "GET" })
      .then((res) => res.json());

    if (vote) {
      connection.setState({ sessionId, vote: vote.option });
      return vote.option;
    }

    return null;
  }

  async setVote(
    connection: Party.Connection<ConnectionState>,
    sessionId: string,
    option: number
  ) {
    connection.setState({ sessionId, vote: option });

    const data = { pollId: this.party.id, option, timestamp: Date.now() };
    await this.party.context.parties.session
      .get(sessionId)
      .fetch(`/vote/${this.party.id}`, {
        method: "POST",
        body: JSON.stringify(data),
      });
  }

  async onStart() {
    this.poll = await this.party.storage.get<Poll>("poll");
  }
}

Server satisfies Party.Worker;
