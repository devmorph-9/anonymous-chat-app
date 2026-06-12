"use client";

import { useUsername } from "@/hooks/use-username";
import { client } from "@/lib/client";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";

function formatTimeRemaining(seconds: number) {
  const min = Math.floor(seconds / 60); // the value before decimals
  const secs = seconds % 60; // the remainder or the value after decimals

  return `${min}:${secs.toString().padStart(2, "0")}`;
}

const Page = () => {
  const params = useParams();
  const roomId = params.roomId as string;

  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const [copyStatus, setCopyStatus] = useState("COPY");

  const { username } = useUsername();

  const [timeRemaining, setTimeRemaing] = useState<number | null>(1000);

  const copyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopyStatus("COPIED!");

    setTimeout(() => setCopyStatus("COPY"), 2000);
  };

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async ({ text }: { text: string }) => {
      await client.messages.post(
        { sender: username, text },
        { query: { roomId } },
      );
    },
  });

  return (
    <main className="felx flex-col h-screen max-h-screen overflow-hidden">
      <header className="border-b border-zinc-800 p-4 flex items-center justify-between bg-zinc-900/30">
        <div className="flex gap-4 items-center">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-500 uppercase">Room Id</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-green-500">{roomId}</span>
              <button
                onClick={copyLink}
                className="text-[10px] bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 rounded text-zinc-400 hover:text-zinc-200 transition-colors">
                {copyStatus}
              </button>
            </div>
          </div>

          <div className="h-8 w-px bg-zinc-800"></div>

          <div className="flex flex-col">
            <span className="text-xs text-zinc-500 uppercase">
              Self-Destruct
              <span
                className={`text-sm font-bold flex items-center gap-2 ${
                  timeRemaining !== null && timeRemaining < 60 ?
                    "text-red-500"
                  : "text-amber-500"
                }`}>
                {timeRemaining !== null ?
                  formatTimeRemaining(timeRemaining)
                : "--:--"}
              </span>
            </span>
          </div>
        </div>

        <button className="text-xs bg-zinc-800 hover:bg-red-600 px-3 py-1.5 rounded text-zinc-400 hover:text-white font-bold transition-all group flex items-center gap-2 disabled:opacity-50">
          <span className="gropu-hover:animate-pulse">💣</span>
          DESTROY NOW
        </button>
      </header>

      <div className="flex-1 fixed bottom-0 min-w-full overflow-y-auto p-4 space-y-4 scrollbar-thin">
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
          <div className="flex gap-4">
            <div className="flex-1 relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 animate-pulse">
                {">"}
              </span>

              <input
                type="text"
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && input.trim()) {
                    sendMessage({ text: input });
                    inputRef.current?.focus;
                  }
                }}
                placeholder="Type message..."
                className="w-full bg-black border border-zinc-800 foucs:border-zinc-700 foucs:outline-none transition-colors text-zinc-100 placeholder-zinc-700 py-3 pl-8 pr-4 text-sm"
              />
            </div>

            <button
              onClick={() => {
                sendMessage({ text: input });
                inputRef.current?.focus();
              }}
              disabled={!input.trim() || isPending}
              className="bg-zinc-80 text-zinc-400 px-6 text-sm font-bold hover:text-zinc-200 transition-all disable:opacity-50 bg-zinc-800 disabled:cursor-not-allowed cursor-pointer">
              SEND
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Page;
