import { ImageResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  let title =
    searchParams.get("title") ?? "A live poll created using PartyKit!";

  let cta = searchParams.get("cta");

  if (title.length > 150) {
    title = title.substring(0, 150) + "...";
  }

  let size: string;
  if (title.length > 100) {
    size = "text-6xl";
  } else if (title.length > 50) {
    size = "text-7xl";
  } else if (title.length > 25) {
    size = "text-8xl";
  } else {
    size = "text-9xl";
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          background:
            "linear-gradient(43deg,#4158d0 0%,#c850c0 46%,#ffcc70 100%)",
        }}
      >
        <div tw="flex h-full w-full px-18 pt-10 pb-24 flex-col justify-between">
          <h1 tw={`text-white font-serif font-bold ${size}`}>{title}</h1>
          {cta && (
            <div tw="flex">
              <div tw="flex bg-white shadow-xl rounded-md p-4 items-center justify-center text-5xl text-blue-700">
                {cta}
              </div>
            </div>
          )}
        </div>

        <span tw="absolute bottom-10 right-10">
          <Balloon />
        </span>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

function Balloon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="128"
      height="128"
      viewBox="0 0 128 128"
      style={{
        height: "200px",
        width: "200px",
      }}
    >
      <path
        fill="none"
        stroke="#64B5F6"
        stroke-miterlimit="10"
        stroke-width="3"
        d="M75.87 102.1c3 4.9-2.38 10.12 1.85 13.91c7.84 7 17.44-12.05 29.49 7.49"
      />
      <path
        fill="#F44336"
        d="m74.5 106.88l5.63-1a2.86 2.86 0 0 0 2.07-4.1a34.64 34.64 0 0 0-7.2-9.62c-.44 2.89-2.16 7.38-3.62 10.8a2.85 2.85 0 0 0 3.12 3.92z"
      />
      <path
        fill="#F44336"
        d="M25.56 51.54C33.14 83.3 64.22 97.75 75.68 95s32.1-32 25.08-61.43C95.79 12.8 74.93 0 54.16 4.97s-33.57 25.83-28.6 46.6v-.03z"
      />
      <path
        fill="#C62828"
        d="m73.43 98.11l5.16-1.23c1.63-.39 2.64-2.02 2.25-3.65s-2.02-2.64-3.65-2.25L72 92.21c-1.63.39-2.64 2.02-2.25 3.65s2.02 2.64 3.65 2.25h.03z"
      />
      <path
        fill="#FF847A"
        d="M78.28 13.44c-4.07-2.48-9.9-4.13-13.2.55c-1.76 2.49-.1 7.15 3.53 8.2c6.14 1.79 7.21 4 8.46 5.79c1.51 2.1 2.94 4.73 5.49 5.14s4-1.51 3.89-5.21c-.02-5.92-3.11-11.4-8.17-14.47z"
      />
    </svg>
  );
}
