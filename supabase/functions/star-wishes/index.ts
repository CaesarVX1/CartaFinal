import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });

const safeEqual = (received: string, expected: string) => {
  const encoder = new TextEncoder();
  const receivedBytes = encoder.encode(received);
  const expectedBytes = encoder.encode(expected);
  const comparisonLength = Math.max(receivedBytes.length, expectedBytes.length);
  let difference = receivedBytes.length ^ expectedBytes.length;

  for (let index = 0; index < comparisonLength; index += 1) {
    difference |= (receivedBytes[index] ?? 0) ^ (expectedBytes[index] ?? 0);
  }

  return difference === 0;
};

const getSupabaseSecretKey = () => {
  const legacyServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (legacyServiceRoleKey) {
    return legacyServiceRoleKey;
  }

  try {
    const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}");
    return typeof secretKeys.default === "string" ? secretKeys.default : null;
  } catch {
    return null;
  }
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = getSupabaseSecretKey();
  const adminPassword = Deno.env.get("WISHES_ADMIN_PASSWORD");
  const readerPassword = Deno.env.get("WISHES_READER_PASSWORD");

  if (!supabaseUrl || !serviceRoleKey || !adminPassword) {
    return jsonResponse({ error: "Server configuration is incomplete" }, 500);
  }

  let payload: Record<string, unknown>;

  try {
    payload = await request.json();
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Invalid payload");
  } catch {
    return jsonResponse({ error: "Invalid request body" }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (payload.action === "submit") {
    const wish = typeof payload.wish === "string" ? payload.wish.trim() : "";

    if (!wish || wish.length > 600) {
      return jsonResponse({ error: "Wish must contain between 1 and 600 characters" }, 400);
    }

    const { data, error } = await supabase
      .from("star_wishes")
      .insert({ wish })
      .select("created_at")
      .single();

    if (error) {
      return jsonResponse({ error: "The wish could not be stored" }, 500);
    }

    return jsonResponse({ ok: true, createdAt: data.created_at }, 201);
  }

  if (["gallery", "list", "update", "delete"].includes(String(payload.action))) {
    const password = typeof payload.password === "string" ? payload.password : "";
    const isAdmin = safeEqual(password, adminPassword);
    const isReader = !!readerPassword && safeEqual(password, readerPassword);

    if (payload.action !== "gallery" && !isAdmin && !isReader) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    if (payload.action === "update" || payload.action === "delete") {
      if (!isAdmin) return jsonResponse({ error: "Administrator access required" }, 403);
      const id = typeof payload.id === "string" || (typeof payload.id === "number" && Number.isSafeInteger(payload.id)) ? String(payload.id) : "";
      if (!/^[1-9]\d{0,18}$/.test(id) || BigInt(id) > 9223372036854775807n) {
        return jsonResponse({ error: "Invalid wish identifier" }, 400);
      }
      const previous = payload.previous as Record<string, unknown> | undefined;
      if (!previous || typeof previous.wish !== "string" || typeof previous.createdAt !== "string") {
        return jsonResponse({ error: "Original wish is required" }, 400);
      }
      const originalDate = new Date(previous.createdAt);
      if (!Number.isFinite(originalDate.getTime())) return jsonResponse({ error: "Invalid original date" }, 400);

      let query;
      if (payload.action === "update") {
        const wish = typeof payload.wish === "string" ? payload.wish.trim() : "";
        const createdAt = typeof payload.createdAt === "string" ? new Date(payload.createdAt) : new Date(NaN);
        if (!wish || wish.length > 600 || !Number.isFinite(createdAt.getTime())) {
          return jsonResponse({ error: "Invalid wish text or date" }, 400);
        }
        query = supabase.from("star_wishes").update({ wish, created_at: payload.createdAt === previous.createdAt ? previous.createdAt : createdAt.toISOString() });
      } else {
        query = supabase.from("star_wishes").delete();
      }
      const { data, error } = await query.eq("id", id).eq("wish", previous.wish)
        .eq("created_at", previous.createdAt).select("id, wish, created_at").maybeSingle();
      if (error) return jsonResponse({ error: "The wish could not be changed" }, 500);
      if (!data) return jsonResponse({ error: "The wish changed or no longer exists" }, 409);
      return jsonResponse({ ok: true, wish: data });
    }

    const page = payload.page ?? 0;
    if (typeof page !== "number" || !Number.isSafeInteger(page) || page < 0 || page > 10000) {
      return jsonResponse({ error: "Invalid page" }, 400);
    }

    const { data, error } = await supabase
      .from("star_wishes")
      .select("id, wish, created_at")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(page * 200, page * 200 + 199);

    if (error) {
      return jsonResponse({ error: "The archive could not be loaded" }, 500);
    }

    return jsonResponse({ wishes: data, hasMore: data.length === 200, role: payload.action === "gallery" ? "viewer" : isAdmin ? "admin" : "viewer" });
  }

  return jsonResponse({ error: "Unknown action" }, 400);
});
