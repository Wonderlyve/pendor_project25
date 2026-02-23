import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHANNEL-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { channelId, channelName, price, currency, mode } = await req.json();
    if (!channelId || !price) throw new Error("Missing channelId or price");
    logStep("Request data", { channelId, channelName, price, currency, mode });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if Stripe customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }
    logStep("Customer lookup", { customerId: customerId || "new" });

    // Map currency
    const stripeCurrency = (currency || "EUR").toLowerCase();

    // Create checkout session with dynamic pricing
    const lineItem: any = {
      price_data: {
        currency: stripeCurrency,
        product_data: {
          name: `Canal: ${channelName || "VIP"}`,
          description: `Accès au canal ${channelName}`,
        },
        unit_amount: Math.round(price * 100), // Convert to cents
      },
      quantity: 1,
    };

    // Add recurring interval for subscription mode
    if (mode === "subscription") {
      lineItem.price_data.recurring = { interval: "month" };
    }

    const sessionMode = mode === "subscription" ? "subscription" : "payment";

    const origin = req.headers.get("origin") || "https://paris-sportif-buzz-arena.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [lineItem],
      mode: sessionMode,
      success_url: `${origin}/channels?payment=success&channel=${channelId}`,
      cancel_url: `${origin}/channel-subscription/${channelId}?payment=canceled`,
      metadata: {
        channel_id: channelId,
        user_id: user.id,
        payment_mode: mode || "payment",
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
