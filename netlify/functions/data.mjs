import { getStore } from "@netlify/blobs";

const ALLOWED_KEYS = ["customers", "orders"];

export default async (req) => {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");

  const headers = {
    "content-type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (!key || !ALLOWED_KEYS.includes(key)) {
    return new Response(JSON.stringify({ error: "invalid key" }), { status: 400, headers });
  }

  const store = getStore("lemox-data");

  try {
    if (req.method === "GET") {
      const value = await store.get(key, { type: "json" });
      return new Response(JSON.stringify({ value: value || [] }), { status: 200, headers });
    }

    if (req.method === "POST") {
      const body = await req.json();
      await store.setJSON(key, body.value || []);
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }

    return new Response(JSON.stringify({ error: "method not allowed" }), { status: 405, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers });
  }
};

export const config = { path: "/api/data" };
