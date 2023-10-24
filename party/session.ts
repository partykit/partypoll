import type * as Party from "partykit/server";
import { User, isSessionValid } from "./utils/auth";

export type Vote = {
  pollId: string;
  option: number;
  timestamp: number;
};

export default class Session implements Party.Server {
  constructor(readonly party: Party.Party) {}

  static onBeforeRequest() {
    return new Response("Not allowed", { status: 401 });
  }

  async onRequest(req: Party.Request) {
    const url = new URL(req.url);
    console.log("onRequest", url.pathname);

    if (url.pathname.endsWith("/session")) {
      if (req.method === "POST") {
        const user = (await req.json()) as User;
        await this.party.storage.put<User>("user", user);
        return new Response(JSON.stringify({ id: this.party.id }));
      }
      if (req.method === "GET") {
        const user = await this.party.storage.get<User>("user");
        if (isSessionValid(user)) {
          return new Response(JSON.stringify(user));
        }
      }
    }

    if (url.pathname.includes("/vote/")) {
      const pollId = url.pathname.split("/vote/")[1];
      if (req.method === "POST") {
        const vote = (await req.json()) as Vote;
        await this.party.storage.put<Vote>(`poll:${pollId}`, vote);
        return new Response(JSON.stringify({ ok: true }));
      }

      if (req.method === "GET") {
        const vote =
          (await this.party.storage.get<Vote>(`poll:${pollId}`)) ?? null;
        return new Response(JSON.stringify(vote));
      }
    }

    return new Response("Not found", { status: 404 });
  }
}
