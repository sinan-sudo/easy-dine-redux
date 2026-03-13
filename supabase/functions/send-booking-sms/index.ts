import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mobile_number, reservation_date, time_slot, party_size, table_number, occasion } = await req.json();

    if (!mobile_number || !reservation_date || !time_slot) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Strip +91 prefix for Fast2SMS (expects 10-digit number)
    const number = mobile_number.replace(/^\+91/, "");

    const occasionText = occasion && occasion !== "none" ? ` Occasion: ${occasion}.` : "";
    const message = `Your table is booked! Date: ${reservation_date}, Time: ${time_slot}, Table: ${table_number}, Guests: ${party_size}.${occasionText} See you soon! - EasyDine`;

    const apiKey = Deno.env.get("FAST2SMS_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "SMS API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const smsResponse = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        route: "q",
        message,
        language: "english",
        numbers: number,
      }),
    });

    const smsResult = await smsResponse.json();
    console.log("Fast2SMS response:", JSON.stringify(smsResult));

    return new Response(JSON.stringify({ success: true, sms_result: smsResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending SMS:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
