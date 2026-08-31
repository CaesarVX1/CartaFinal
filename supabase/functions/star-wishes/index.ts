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

  if (!supabaseUrl || !serviceRoleKey || !adminPassword) {
    return jsonResponse({ error: "Server configuration is incomplete" }, 500);
  }

  let payload: Record<string, unknown>;

  try {
    payload = await request.json();
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

  if (payload.action === "list") {
    const password = typeof payload.password === "string" ? payload.password : "";

    if (!safeEqual(password, adminPassword)) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const { data, error } = await supabase
      .from("star_wishes")
      .select("id, wish, created_at")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      return jsonResponse({ error: "The archive could not be loaded" }, 500);
    }

    return jsonResponse({ wishes: data });
  }

  return jsonResponse({ error: "Unknown action" }, 400);
});
