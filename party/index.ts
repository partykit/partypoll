import type * as Party from "partykit/server";
import type { Poll } from "@/app/types";
import { SINGLETON_ROOM_ID } from "./polls";

export default class Server implements Party.Server {
  options: Party.ServerOptions = { hibernate: true };
  constructor(readonly party: Party.Party) {}

  poll: Poll | undefined;

  async onRequest(req: Party.Request) {
    if (req.method === "DELETE") {
      if (this.party.env.PARTY_SECRET === req.headers.get("Authorization")) {
        this.poll = undefined;
        await this.party.storage.deleteAll();
        return new Response(JSON.stringify({ deleted: this.party.id }));
      }
    }

    if (req.method === "POST") {
      const poll = (await req.json()) as Poll;
      this.poll = { ...poll, votes: poll.options.map(() => 0) };
      this.savePoll();
      this.notifyPollCreated();
    }

    if (this.poll) {
      return new Response(JSON.stringify(this.poll), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not found", { status: 404 });
  }

  async onMessage(message: string) {
    if (!this.poll) return;

    const event = JSON.parse(message);
    if (event.type === "vote") {
      this.poll.votes![event.option] += 1;
      this.party.broadcast(JSON.stringify(this.poll));
      this.savePoll();
      this.notifyPollVoteUpdated();
    }
  }

  async savePoll() {
    if (this.poll) {
      await this.party.storage.put<Poll>("poll", this.poll);
    }
  }

  async onStart() {
    this.poll = await this.party.storage.get<Poll>("poll");
  }

  async notifyPollCreated() {
    return this.notifyPollTracker("POST");
  }

  async notifyPollVoteUpdated() {
    return this.notifyPollTracker("PUT");
  }

  async notifyPollTracker(method: "POST" | "PUT") {
    this.party.context.parties.polls.get(SINGLETON_ROOM_ID).fetch({
      method,
      headers: {
        Authorization: `${this.party.env.PARTY_SECRET}`,
      },
      body: JSON.stringify({
        id: this.party.id,
        poll: this.poll,
      }),
    });
  }
}

Server satisfies Party.Worker;
