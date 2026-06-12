// import { NextRequest, NextResponse } from "next/server";
// import { redis } from "./lib/radies";
// import { nanoid } from "nanoid";

import Elysia, { t } from "elysia";
import { redis } from "./lib/radies";
import { useRef, useState } from "react";

// export const proxy = async (req: NextRequest) => {
//   const pathname = req.nextUrl.pathname;

//   const roomMatch = pathname.match(/^\/room\/([^/]+)$/);
//   if (!roomMatch) return NextResponse.redirect(new URL("/", req.url));

//   const roomId = roomMatch[1];

//   const meta = await redis.hgetall<{ connected: string[]; createdAt: number }>(
//     `meta:${roomId}`,
//   );

//   if (!meta) {
//     return NextResponse.redirect(new URL("/?error=room-not-found"));
//   }

//   const existingToken = req.cookies.get("x-auth-token")?.value;

//   if (existingToken && meta.connected.includes(existingToken)) {
//     return NextResponse.next();
//   }

//   if (meta.connected.length >= 2) {
//     return NextResponse.redirect(new URL("/?error=room-full", req.url));
//   }

//   const response = NextResponse.next();

//   const token = nanoid();
//   response.cookies.set("x-auth-token", token, {
//     path: "/",
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "strict",
//   });

//   await redis.hset(`meta:${roomId}`, {
//     connected: [...meta.connected, token],
//   });
// };

// export const config = {
//   matcher: "/room/:path*",
// };

// // match the pathname of url to regex
// // use the pathname to find the details of the room from redis
// // created an token and added it to cookies
// // before that check that token is already exist and room is already filled
// // added the token to connected string of meta

// // created a config file -- next default

class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "Auth";
  }
}

export const authMiddleware = new Elysia({
  name: "auth",
})
  .error({ AuthError })
  .onError(({ code, set }) => {
    if (code === "AuthError") {
      set.status = 401;
      return { error: "Unauthorized" };
    }
  })
  .derive({ as: "scoped" }, async ({ query, cookie }) => {
    const roomId = query.roomId;
    const token = cookie["x-auth-token"].value as string | undefined;

    if (!roomId || !token) {
      throw new AuthError("Missing roomId or toke");
    }

    const connected = await redis.hget<string[]>(`meta.${roomId}`, "connected");

    if (!connected?.includes(token)) {
      throw new AuthError("Invalid token");
    }

    return { auth: { roomId, token, connected } };
  });

function formatTimeRemaining(seconds: number) {
  const min = Math.floor(seconds / 60); // value before decimal
  const sec = seconds % 60; // value after the decimal (remainder value)

  return `${min}:${sec.toString().padStart(2, "0")}`;
}

// 121 ---> 2:01

// 121 / 60 = 2
// 121 % 60 = 1

//  return `${min}:${sec.toString().padStart(2, "0")}`;
// the format will be in 2 digit and if it is 1 digit than first digit will be 0.

const [copyStatus, setCopyStatus] = useState("COPY");
const copyLink = () => {
  const url = window.location.href; // get the url
  navigator.clipboard.writeText(url); // copy the url
  setCopyStatus("COPIED!");

  setTimeout(() => setCopyStatus("COPY"), 2000);
};

const inputRef = useRef<HTMLInputElement>(null);
const [input, setInput] = useState("");

function page() {
  return (
    <div>
      <input
        type="text"
        autoFocus
        value={input}
        ref={inputRef}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && input.trim()) {
            // TODO: SEND MESSAGE
            inputRef.current?.focus;
          }
        }}
      />
    </div>
  );
}

const app = new Elysia().post("/submit", ({ body }: any) => {
  const { username, email, password } = body;
  console.log(body);
  return { status: "success", body: { body } };
});

new Elysia().post(
  "/register",
  ({ body }: any) => {
    return {
      message: `User ${body.name} registed successfully`,
      email: body.email,
    };
  },
  {
    body: t.Object({
      name: t.String({ minLength: 10 }),
      email: t.String({ format: "email" }),
    }),
  },
);
