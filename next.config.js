const PARTYKIT_HOST = process.env.NEXT_PUBLIC_PARTYKIT_HOST || "127.0.0.1:1999";
const PARTYKIT_PROTOCOL =
  PARTYKIT_HOST?.startsWith("localhost") ||
  PARTYKIT_HOST?.startsWith("127.0.0.1")
    ? "http"
    : "https";
const PARTYKIT_URL = `${PARTYKIT_PROTOCOL}://${PARTYKIT_HOST}`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  rewrites: async () => [
    {
      // forward room authentication request to partykit
      source: "/session",
      destination: PARTYKIT_URL + "/session",
    },
  ],
};

module.exports = nextConfig;
