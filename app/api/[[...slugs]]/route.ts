import { redis } from "@/lib/radies";
import { Elysia } from "elysia";
import { nanoid } from "nanoid";
import { authMiddleware } from "./auth";
import { z } from "zod";
import { Athiti } from "next/font/google";
import { Message, realtime } from "@/lib/realtime";

const ROOM_TTL_SECONDS = 60 * 10;

export const rooms = new Elysia({ prefix: "/room" }).post(
  "/create",
  async () => {
    // console.log("CREATE A NEW ROOM");
    const roomId = nanoid();

    await redis.hset(`meta:${roomId}`, {
      connected: [],
      createdAt: Date.now(),
    });

    await redis.expire(`meta:${roomId}`, ROOM_TTL_SECONDS);

    return { roomId };
  },
);

export const messages = new Elysia({ prefix: "/messages" })
  .use(authMiddleware)
  .post(
    "/",
    async ({ body, auth }) => {
      console.log("message endpoint hit");
      const { sender, text } = body;

      const { roomId } = auth;

      const roomExists = await redis.exists(`meta:${roomId}`);

      if (!roomExists) {
        throw new Error("Room does not exist");
      }

      const message: Message = {
        id: nanoid(),
        sender,
        text,
        timestamp: Date.now(),
        roomId,
      };

      // add message to history (after reconection)
      await redis.rpush(`messages:${roomId}`, {
        ...message,
        token: auth.token,
      }); // push messages as list in redis

      await realtime.channel(roomId).emit("chat.message", message);

      // housekeeping
      const remaining = await redis.ttl(`meta:${roomId}`);
      await redis.expire(`messages:${roomId}`, remaining);
      await redis.expire(roomId, remaining);
    },
    {
      query: z.object({ roomId: z.string() }),
      body: z.object({
        sender: z.string().max(100),
        text: z.string().max(1000),
      }),
    },
  );

export const app = new Elysia({ prefix: "/api" }).use(rooms).use(messages);

export const GET = app.fetch;
export const POST = app.fetch;

export type App = typeof app;
