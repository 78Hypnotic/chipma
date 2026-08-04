import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
      IMAGES: {
        input() {
          throw new Error("Image binding is not used by this test.");
        },
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
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
  assert.match(html, /Anfrage sicher senden/);
  assert.match(html, /Material &amp; Verfahren/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/i);
});

test("exposes the product metadata in the server-rendered document", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(
    html,
    /<title>ChipMa – individuelle Pfandchips ab 25 Stück \| ChipMa<\/title>/i,
  );
  assert.match(html, /name="description"/i);
  assert.match(html, /og:title/i);
  assert.match(html, /og:image[^>]+\/og\.png/i);
  assert.match(html, /de_DE/i);
});
