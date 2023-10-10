# TODO

1. Starting point (Next.js app with UI that doesn't connect to anything)
   1. Poll creation UI
   2. Poll from static data
2. Add partykit to project (partykit init)
3. Implement SSR
4. Implement suuuper basic PartyKit backend for just creating parties (dynamic polls
5. Add WebSockets and voting
6. Talk about storage

---
1. Implement preventing multiple voting
2. Implement authentication (with NextAuth)

## Cheating

```ts
import type * as Party from "partykit/server";
import type { Poll, Vote } from "./types";

export default class Server implements Party.Server {
  constructor(readonly party: Party.Party) {}

  poll: Poll | undefined;
  votes: Map<string, number> = new Map();

  async onStart() {
    this.poll = await this.party.storage.get<Poll>("poll");
  }

  // HTTP API for creating a poll
  async onRequest(req: Party.Request) {
    // POST = create new poll
    if (req.method === "POST") {
      // you can only create a poll once per room id
      if (this.poll)
        return new Response("Poll already exists", { status: 400 });
      // initialize the room state
      this.poll = {
        options: JSON.parse(await req.json()),
        results: {},
      };

      await this.party.storage.put("poll", this.poll);
    }

    // GET = get poll options for server rendering
    if (req.method === "GET") {
      if (!this.poll) {
        return new Response(JSON.stringify({ error: "Poll doesn't exist" }), {
          status: 400,
        });
      }
      return new Response(JSON.stringify(this.poll), {});
    }

    return new Response(null, { status: 200 });
  }

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // if poll isn't created, don't allow WebSocket connections to it
    if (!this.poll) {
      conn.close();
      return;
    }

    // initialize the connection state
    const user = new URL(conn.uri).searchParams.get("user");
    const vote = await this.party.storage.get("vote:" + user);
    conn.setState({ user, vote });

    // send poll options to client on connection
    conn.send(JSON.stringify({ options: this.poll.options }));
  }

  async onMessage(
    message: string,
    sender: Party.Connection<{ user: string; vote?: string }>
  ) {
    const { option } = JSON.parse(message) as Vote;

    if (!option) return; // error
    if (!this.poll) return; // error
    if (!this.poll.options[option]) return; // error
    if (sender.state?.vote) return; // error

    // update poll
    this.poll.results[option] = (this.poll.results[option] ?? 0) + 1;

    // mark the client as having voted
    sender.setState({ user: sender.state!.user, vote: option });
    await this.party.storage.put("vote:" + sender.id, option);

    // send updated results to all clients who have voted
    const update = JSON.stringify(this.poll);
    for (const conn of this.party.getConnections<{ voted: boolean }>()) {
      if (conn.state?.voted) {
        conn.send(update);
      }
    }

    // save poll
    await this.party.storage.put("poll", this.poll);
  }
}

```