import type * as Party from "partykit/server";

export type User = {
  username: string;
  name?: string;
  email?: string;
  image?: string;
  expires?: string;
};

export const createSessionHandler = async (
  proxiedRequest: Party.Request,
  lobby: Party.FetchLobby
) => {
  const url = new URL(proxiedRequest.url);
  console.log("createSessionHandler", url.pathname);
  if (url.pathname === "/session") {
    const user = await getNextAuthSession(proxiedRequest);
    console.log("createSessionHandler:user", user);
    if (user?.email) {
      const id = makeSessionId(user);
      return lobby.parties.session.get(id).fetch("/session", {
        method: "POST",
        body: JSON.stringify(user),
      });
    }
  }
  return new Response("Not found", { status: 404 });
};

export const makeSessionId = (session: User) => {
  return btoa(session.email);
};

/** Check that the user exists, and isn't expired */
export const isSessionValid = (session?: User | null): session is User => {
  return Boolean(
    session && (!session.expires || session.expires > new Date().toISOString())
  );
};

/**
 * Authenticate the user against the NextAuth API of the server that proxied the request
 */
export const getNextAuthSession = async (
  proxiedRequest: Party.Request
): Promise<User | null> => {
  const headers = proxiedRequest.headers;
  const origin = headers.get("origin") ?? "";
  const cookie = headers.get("cookie") ?? "";

  const url = `${origin}/api/auth/session`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      Cookie: cookie,
    },
  });

  if (res.ok) {
    const session = await res.json();
    if (isSessionValid(session.user)) {
      return { ...session.user, expires: session.expires };
    }
  } else {
    console.error("Failed to authenticate user", await res.text());
  }

  return null;
};
