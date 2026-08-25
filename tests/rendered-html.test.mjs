import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import test, { after, before } from "node:test";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const nextCli = fileURLToPath(
  new URL("../node_modules/next/dist/bin/next", import.meta.url),
);
const port = 31_000 + (process.pid % 1_000);
const baseUrl = `http://127.0.0.1:${port}`;
let server;

before(async () => {
  server = spawn(
    process.execPath,
    [nextCli, "start", "--hostname", "127.0.0.1", "--port", String(port)],
    {
      cwd: projectRoot,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (server.exitCode !== null) {
      const stderr = await new Response(server.stderr).text();
      throw new Error(`Next.js test server exited early: ${stderr}`);
    }

    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // Server startup is still in progress.
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error("Next.js test server did not become ready.");
});

after(async () => {
  if (!server || server.exitCode !== null) return;
  server.kill();
  await once(server, "exit");
});

async function render(pathname = "/") {
  return fetch(`${baseUrl}${pathname}`, { headers: { accept: "text/html" } });
}

test("server-renders the finished ChipMa landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html[^>]*lang="de"/i);
  assert.match(html, /ChipMa/);
  assert.match(html, /Pfandchips, die niemand wegwirft/);
  assert.match(html, /Ihr ChipMa-Konfigurator/);
  assert.match(html, /Bestellung sicher senden/);
  assert.match(html, /Material &amp; Verfahren/);
  assert.match(html, /3D-Druck oder Spritzguss/);
  assert.match(html, /TV Ehingen e\.V\./);
  assert.match(html, /Stadtmusik Engen/);
  assert.match(html, /\/projects\/tv-ehingen\.webp/);
  assert.match(html, /Randenstr\. 8/);
  assert.match(html, /78234/);
  assert.match(html, /printmagbr@gmail\.com/);
  assert.match(html, /https:\/\/printma\.net\/policies\/legal-notice/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/i);
});

test("exposes the product metadata in the server-rendered document", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(
    html,
    /<title>ChipMa[^<]*individuelle Pfandchips ab 25[^<]*<\/title>/i,
  );
  assert.match(html, /name="description"/i);
  assert.match(html, /og:title/i);
  assert.match(html, /og:image[^>]+\/og\.png/i);
  assert.match(html, /de_DE/i);
});
