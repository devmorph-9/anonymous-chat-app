import { nanoid } from "nanoid";
import { useEffect, useState } from "react";

export const useUsername = () => {
  const [username, setUsername] = useState("");

  const ANIMAL = ["wolf", "hawk", "bear", "shark"];
  const STORAGE_KEY = "chat_username";

  const generateUsername = () => {
    const word = ANIMAL[Math.floor(Math.random() * ANIMAL.length)];
    return `anonymous-${word}-${nanoid(5)}`;
  };

  useEffect(() => {
    const main = () => {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        setUsername(stored);
        return;
      }

      const generate = generateUsername();
      localStorage.setItem(STORAGE_KEY, generate);
      // localStorageWithExpiry(STORAGE_KEY, generate, 60 * 60 * 1000);
      setUsername(generate);
    };

    main();
  }, []);

  return { username };
};

// const localStorageWithExpiry = (
//   key: string,
//   value: string,
//   expiryTime: number,
// ) => {
//   const now = new Date();
//   const item = {
//     value: value,
//     expiry: now.getTime() - expiryTime,
//   };

//   localStorage.setItem(key, JSON.stringify(item));
// };
