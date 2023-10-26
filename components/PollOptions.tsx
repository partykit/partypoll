"use client";

export default function PollOptions({
  options,
  votes,
  vote,
  setVote,
}: {
  options: string[];
  votes: number[];
  vote: number | null;
  setVote: (option: number) => void;
}) {
  const totalVotes = votes.reduce((a, b) => a + b, 0);
  const mostVotes = Math.max(...votes);

  return (
    <ul className="flex flex-col space-y-4">
      {options.map((option, i) => (
        <li key={i}>
          <div className="relative w-full min-h-[40px] border rounded-md  border-black flex">
            <div
              className={`absolute top-0 left-0 bottom-0 w-full rounded-md transition-all duration-500 z-10 ${
                votes[i] === mostVotes
                  ? "vote-bg-winning"
                  : vote === i
                  ? "vote-bg-own"
                  : "vote-bg"
              }`}
              style={{
                width:
                  vote === null
                    ? 0
                    : `${((votes[i] ?? 0) / totalVotes) * 100}%`,
              }}
            ></div>

            <div className="select-none w-full flex items-center justify-between px-4 z-20">
              <button
                onClick={() => setVote(i)}
                className={`flex flex-1 text-left py-2 ${
                  vote === null ? "cursor-pointer" : "cursor-default"
                } ${
                  vote === null ? "" : votes[i] === mostVotes ? "font-bold" : ""
                }`}
              >
                <span>
                  {vote === i && <span className="relative">🎈 </span>}
                  {option}
                </span>
              </button>

              {vote === null ? null : <span>{votes[i] ?? 0}</span>}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
