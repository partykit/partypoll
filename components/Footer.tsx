export default function Footer() {
  return (
    <div className="text-white flex flex-col items-center space-y-2">
      <div className="font-medium">Built with PartyKit and Next.js</div>
      <div>
        <a
          className="underline"
          href="https://docs.partykit.io"
          target="_blank"
        >
          Docs
        </a>{" "}
        |{" "}
        <a
          className="underline"
          href="https://github.com/partykit/partypoll"
          target="_blank"
        >
          GitHub
        </a>{" "}
        |{" "}
        <a
          className="underline"
          href="https://docs.partykit.io/tutorials/add-partykit-to-a-nextjs-app"
          target="_blank"
        >
          Tutorial
        </a>
      </div>
    </div>
  );
}
