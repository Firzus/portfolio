import { spawn, type ChildProcess } from "node:child_process";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";

const entry = fileURLToPath(new URL("../.output/server/index.mjs", import.meta.url));

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      probe.close(() => {
        if (typeof address === "object" && address) resolve(address.port);
        else reject(new Error("No port assigned."));
      });
    });
  });
}

export interface RunningServer {
  origin: string;
  stop: () => void;
}

/** Starts the built Node server on a free local port and waits until it answers. */
export async function startServer(): Promise<RunningServer> {
  const port = await freePort();
  // NITRO_* variables (port, host, TLS, socket) would override where the server listens, and a
  // GITHUB_TOKEN would replace the saved GitHub calendar the tests compare against.
  const env = Object.fromEntries(
    Object.entries(process.env).filter(
      ([name]) => !name.startsWith("NITRO_") && name !== "GITHUB_TOKEN",
    ),
  );
  const child: ChildProcess = spawn(process.execPath, [entry], {
    env: { ...env, NODE_ENV: "production", PORT: String(port), HOST: "127.0.0.1" },
    stdio: "inherit",
  });
  let spawnError: Error | undefined;
  child.once("error", (error) => (spawnError = error));
  const origin = `http://127.0.0.1:${port}`;
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    if (spawnError) throw spawnError;
    if (child.exitCode !== null || child.signalCode !== null) {
      throw new Error(`Server exited (${child.exitCode ?? child.signalCode}).`);
    }
    try {
      await fetch(origin);
      return { origin, stop: () => child.kill() };
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  child.kill();
  throw new Error(`Server did not answer on ${origin}.`);
}
