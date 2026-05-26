import { describe, expect, test } from "bun:test";
import { Elysia } from "elysia";

describe("debug: ws.raw inspection", () => {
  test("check what ws.raw actually is in Elysia WS events", async () => {
    const openRaw: { type: string; value: any }[] = [];
    const msgRaw: { type: string; value: any }[] = [];
    const closeRaw: { type: string; value: any }[] = [];

    const app = new Elysia().ws("/ws", {
      open(ws) {
        const raw = (ws as any).raw;
        openRaw.push({ type: typeof raw, value: raw });
        console.log("OPEN ws.raw type:", typeof raw, "is null:", raw === null, "is undefined:", raw === undefined);
        console.log("OPEN ws.raw:", raw);
        console.log("OPEN ws keys:", Object.getOwnPropertyNames(ws));
      },
      message(ws, msg) {
        const raw = (ws as any).raw;
        msgRaw.push({ type: typeof raw, value: raw });
        console.log("MSG ws.raw type:", typeof raw, "is null:", raw === null, "is undefined:", raw === undefined);
        console.log("MSG ws keys:", Object.getOwnPropertyNames(ws));
      },
      close(ws) {
        const raw = (ws as any).raw;
        closeRaw.push({ type: typeof raw, value: raw });
        console.log("CLOSE ws.raw type:", typeof raw, "is null:", raw === null, "is undefined:", raw === undefined);
      },
    });

    const server = app.listen(0);
    const port = (server.server as any).port;

    const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);
    await new Promise<void>((r) => ws.addEventListener("open", () => r(), { once: true }));
    ws.send("hello");
    await new Promise((r) => setTimeout(r, 100));
    ws.close();
    await new Promise((r) => setTimeout(r, 100));
    server.stop();

    // Check what we got
    console.log("openRaw count:", openRaw.length, "type:", openRaw[0]?.type);
    console.log("msgRaw count:", msgRaw.length, "type:", msgRaw[0]?.type);
    console.log("closeRaw count:", closeRaw.length, "type:", closeRaw[0]?.type);

    // Check if open and msg have the same ws.raw
    if (openRaw[0]?.value && msgRaw[0]?.value) {
      console.log("open === msg:", openRaw[0].value === msgRaw[0].value);
      expect(openRaw[0].value).toBe(msgRaw[0].value);
    } else {
      console.log("RAW VALUES ARE MISSING - ws.raw doesn't exist on ElysiaWS!");
    }

    expect(openRaw.length).toBe(1);
    expect(msgRaw.length).toBe(1);
  });
});
