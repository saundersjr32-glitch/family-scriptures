import { getStore } from "@netlify/blobs";

/* Keys that require the family PIN to write or delete. Reading is always
   open (everyone needs to see the scripture list and hear recordings),
   only changing them is gated. */
const PROTECTED_EXACT = ["scriptures", "recording_index"];
const PROTECTED_PREFIXES = ["recording:"];

function isProtectedKey(key) {
  if (PROTECTED_EXACT.indexOf(key) !== -1) return true;
  return PROTECTED_PREFIXES.some(function (p) { return key.indexOf(p) === 0; });
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status,
    headers: { "Content-Type": "application/json" }
  });
}

export default async (req, context) => {
  const store = getStore("family-scriptures");
  const url = new URL(req.url);

  try {
    if (req.method === "GET") {
      const key = url.searchParams.get("key");
      if (!key) return json({ error: "key is required" }, 400);

      /* Never expose the actual PIN, only whether one has been set. */
      if (key === "admin_pin") {
        const pin = await store.get("admin_pin");
        return json({ value: !!pin }, 200);
      }

      const value = await store.get(key);
      return json({ value: value }, 200);
    }

    if (req.method === "POST") {
      const body = await req.json();
      const key = body.key;
      if (!key) return json({ error: "key is required" }, 400);

      /* Check a PIN without writing anything. */
      if (key === "__verify_pin__") {
        const pin = await store.get("admin_pin");
        const ok = pin ? pin === body.value : true;
        return json({ ok: ok }, 200);
      }

      /* Set or change the PIN. If one already exists, the correct
         current PIN must be supplied to change it. */
      if (key === "admin_pin") {
        const existingPin = await store.get("admin_pin");
        if (existingPin && existingPin !== body.currentPin) {
          return json({ error: "incorrect current pin" }, 401);
        }
        await store.set("admin_pin", String(body.value || ""));
        return json({ ok: true }, 200);
      }

      if (isProtectedKey(key)) {
        const existingPin = await store.get("admin_pin");
        const providedPin = req.headers.get("x-family-pin") || "";
        if (existingPin && existingPin !== providedPin) {
          return json({ error: "locked" }, 401);
        }
      }

      await store.set(key, body.value);
      return json({ ok: true }, 200);
    }

    if (req.method === "DELETE") {
      const key = url.searchParams.get("key");
      if (!key) return json({ error: "key is required" }, 400);

      if (isProtectedKey(key)) {
        const existingPin = await store.get("admin_pin");
        const providedPin = req.headers.get("x-family-pin") || "";
        if (existingPin && existingPin !== providedPin) {
          return json({ error: "locked" }, 401);
        }
      }

      await store.delete(key);
      return json({ ok: true }, 200);
    }

    return json({ error: "method not allowed" }, 405);
  } catch (err) {
    return json({ error: String(err && err.message ? err.message : err) }, 500);
  }
};

export const config = {
  path: "/.netlify/functions/storage"
};
