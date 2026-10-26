import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const response = (body: Record<string, unknown>, status = 200) => new Response(
  JSON.stringify(body),
  { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== "POST") return response({ error: "Method not allowed" }, 405);

  try {
    const authorization = req.headers.get("Authorization");
    if (!authorization) return response({ error: "Not authorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !anonKey || !serviceRoleKey) return response({ error: "Service unavailable" }, 503);

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    const actor = userData.user;
    const isSuperAdmin = actor && (actor.email?.toLowerCase() === "super@gmail.com" || actor.app_metadata?.role === "super");
    if (userError || !actor || !isSuperAdmin) return response({ error: "Not authorized" }, 403);

    const body = await req.json() as { email?: unknown; password?: unknown };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email && !password) return response({ error: "Enter an email or password" }, 400);
    if (email && (!email.includes("@") || email.length > 254)) return response({ error: "Enter a valid email" }, 400);
    if (password && password.length < 8) return response({ error: "Password must be at least 8 characters" }, 400);

    const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: usersData, error: usersError } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (usersError) return response({ error: "Could not load the staff account" }, 500);

    const target = usersData.users.find((user) => user.app_metadata?.role === "admin" || user.email?.toLowerCase() === "admin@gmail.com");
    if (!target) return response({ error: "Admin account not found" }, 404);

    const update: { email?: string; password?: string; email_confirm?: boolean; app_metadata: Record<string, unknown> } = {
      app_metadata: { ...target.app_metadata, role: "admin" },
    };
    if (email) {
      update.email = email;
      update.email_confirm = true;
    }
    if (password) update.password = password;

    const { error: updateError } = await adminClient.auth.admin.updateUserById(target.id, update);
    if (updateError) {
      const message = updateError.message.toLowerCase();
      if (message.includes("password") && message.includes("8")) return response({ error: "The password must be at least 8 characters." }, 400);
      if (message.includes("already registered") || message.includes("already exists")) return response({ error: "That email address is already in use." }, 400);
      return response({ error: updateError.message }, 400);
    }
    return response({ email: email || target.email });
  } catch {
    return response({ error: "Could not update the Admin account" }, 500);
  }
});
