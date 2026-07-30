// Fetches pins from the business's public Pinterest boards and writes
// src/data/pinterest-pins.json for the "Need some furniture ideas?" grids.
// Re-run whenever the boards change:  node scripts/fetch-pins.mjs
import fs from "node:fs/promises";
import path from "node:path";

const BOARDS = [
  { key: "desks", username: "AgentMrBig", slug: "desk-and-table-designs", cap: 150 },
  { key: "finishes", username: "AgentMrBig", slug: "furniture-finishes", cap: 100 },
];

const HEADERS = {
  accept: "application/json",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
  "x-pinterest-pws-handler": "www/[username]/[slug].js",
};

const text = (v) => (typeof v === "string" ? v : v?.text ?? "");

async function resource(name, sourceUrl, options) {
  const data = encodeURIComponent(JSON.stringify({ options, context: {} }));
  const url = `https://www.pinterest.com/resource/${name}/get/?source_url=${encodeURIComponent(sourceUrl)}&data=${data}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`${name} -> HTTP ${res.status}`);
  return (await res.json())?.resource_response;
}

async function fetchBoard({ username, slug, cap }) {
  const sourceUrl = `/${username}/${slug}/`;
  const board = await resource("BoardResource", sourceUrl, {
    username,
    slug,
    field_set_key: "detailed",
  });
  const boardId = board?.data?.id;
  if (!boardId) throw new Error(`no board id for ${slug}`);

  const pins = [];
  let bookmark;
  while (pins.length < cap) {
    const feed = await resource("BoardFeedResource", sourceUrl, {
      board_id: boardId,
      board_url: sourceUrl,
      page_size: 50,
      ...(bookmark ? { bookmarks: [bookmark] } : {}),
    });
    const items = (feed?.data ?? []).filter((p) => p.images && p.id);
    pins.push(...items);
    bookmark = feed?.bookmark;
    if (!bookmark || bookmark === "-end-" || items.length === 0) break;
    await new Promise((r) => setTimeout(r, 500));
  }

  return pins.slice(0, cap).map((p) => {
    const img = p.images["564x"] ?? p.images["474x"] ?? p.images["236x"] ?? p.images.orig;
    return {
      id: p.id,
      title: (text(p.grid_title) || text(p.title) || text(p.description)).trim().slice(0, 120),
      img: img.url,
      w: img.width,
      h: img.height,
    };
  });
}

const out = {};
for (const b of BOARDS) {
  out[b.key] = await fetchBoard(b);
  console.log(`${b.slug}: ${out[b.key].length} pins`);
}

const dest = path.join(import.meta.dirname, "..", "src", "data", "pinterest-pins.json");
await fs.mkdir(path.dirname(dest), { recursive: true });
await fs.writeFile(dest, JSON.stringify(out, null, 2));
console.log(`wrote ${dest}`);
