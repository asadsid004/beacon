import { spawn } from "node:child_process";
import { once } from "node:events";

import { test as base } from "@playwright/test";

export const test = base.extend<{ coldAppURL: string }>({
  coldAppURL: async ({ baseURL }, provide) => {
    const server = spawn(
      process.execPath,
      [
        "node_modules/next/dist/bin/next",
        "start",
        "--hostname",
        "127.0.0.1",
        "--port",
        "0",
      ],
      {
        env: {
          ...process.env,
          BETTER_AUTH_URL: baseURL,
          PGAPPNAME: "beacon-playwright",
        },
        stdio: ["ignore", "pipe", "pipe"],
      }
    );
    try {
      const { promise, resolve, reject } = Promise.withResolvers<string>();
      let output = "";
      const timeout = setTimeout(
        () => reject(new Error(`Cold app did not start: ${output}`)),
        20_000
      );
      const receive = (chunk: Buffer) => {
        output += chunk.toString();
        const appURL = /http:\/\/127\.0\.0\.1:\d+/u.exec(output)?.[0];
        if (appURL && output.includes("Ready")) {
          clearTimeout(timeout);
          resolve(appURL);
        }
      };
      server.stdout.on("data", receive);
      server.stderr.on("data", receive);
      server.once("error", (error) => {
        clearTimeout(timeout);
        reject(error);
      });
      server.once("exit", () => {
        clearTimeout(timeout);
        reject(new Error(`Cold app exited: ${output}`));
      });
      const url = await promise;
      await provide(url);
    } finally {
      if (server.exitCode === null && server.signalCode === null) {
        const exited = once(server, "exit");
        server.kill("SIGTERM");
        await exited;
      }
    }
  },
});
