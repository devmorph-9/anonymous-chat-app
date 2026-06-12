"use client";

import { useUsername } from "@/hooks/use-username";
import { client } from "@/lib/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function Home() {
  const list = ["create", "join", "setting", "profile"];
  const router = useRouter();

  const { username } = useUsername();

  // works as fetch api

  const { mutate: createRoom } = useMutation({
    mutationFn: async () => {
      const res = await client.room.create.post();

      if (res.status === 200) {
        router.push(`/room/${res.data?.roomId}`);
      }
    },
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#161515]">
      <nav className="top-0 left-0 fixed p-1 border border-zinc-800 bg-zinc-900 min-w-full">
        <li className="flex gap-30 justify-around">
          {list.map((items) => (
            <ol
              key={items}
              className="cursor-pointer hover:text-olive-300 hover:bg-zinc-800 p-1 rounded-sm duration-150 transition">
              {items}
            </ol>
          ))}
        </li>
      </nav>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2 cursor-none">
          <h1 className="text-2xl font-bold tracking-tight text-green-500">
            {">"} Private_Chat
          </h1>
          <p className="text-zinc-500 text-sm">
            A private, self-distructing chat room
          </p>
        </div>
        <div className="border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-md">
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-zinc-500 felx items-center">
                Your Identity
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-zinc-950 border border-zinc-800 p-3 text-sm text-zinc0400 font-mono">
                  {username}
                </div>
              </div>
            </div>

            <button
              onClick={() => createRoom()}
              className="w-full bg-zinc-100 text-black p-3 text-sm font-bold hover:bg-zinc-200 hover:text-black transition-colors mt-2  cursor-pointer disabled:opacity-50 ">
              CREATE SECURE ROOM
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
