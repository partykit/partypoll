import { Poll } from "@/app/types";
import type * as Party from "partykit/server";

/**
 * The polls party's purpose is to keep track of all polls, so we want
 * every client to connect to the same room instance by sharing the same room id.
 */
export const SINGLETON_ROOM_ID = "list";

export type PollWithMetadata = Poll & {
  id: string;
  created?: number;
  updated?: number;
};

export type Room = {
  id: string;
  poll: PollWithMetadata;
};

export default class PollList implements Party.Server {
  options: Party.ServerOptions = { hibernate: true };

  constructor(public party: Party.Party) {}

  async onRequest(req: Party.Request) {
    if (req.headers.get("Authorization") !== this.party.env.PARTY_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (this.party.id === SINGLETON_ROOM_ID) {
      if (req.method === "POST") {
        const room = (await req.json()) as Room;
        if (room.id && room.poll) {
          // store data in a time-sortable key so we can get most recent first
          const ts = Date.now();
          const id = `poll:${ts}:${room.id}`;
          this.party.storage.put<PollWithMetadata>(id, {
            ...room.poll,
            id: room.id,
            created: ts,
            updated: ts,
          });

          // store the id so we can access by id if needed
          this.party.storage.put(room.id, id);

          return new Response(JSON.stringify({ id }), {
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      if (req.method === "PUT") {
        const room = (await req.json()) as Room;
        if (room.id && room.poll) {
          // store data in a time-sortable key so we can get most recent first

          // store the id so we can access by id if needed
          const ts = Date.now();
          const id = await this.party.storage.get<string>(room.id);
          if (id) {
            const poll = await this.party.storage.get<PollWithMetadata>(id);
            if (poll) {
              poll.votes = room.poll.votes;
              poll.updated = ts;
              await this.party.storage.put(id, poll);
            }

            return new Response(JSON.stringify({ id }), {
              headers: { "Content-Type": "application/json" },
            });
          }
        }
      }

      if (req.method === "GET") {
        const items = await this.party.storage.list({
          prefix: "poll:",
          limit: 1000,
          reverse: true,
        });

        const polls = Object.fromEntries(items.entries());
        return new Response(JSON.stringify(polls), {
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response("Not found", { status: 404 });
  }
}
