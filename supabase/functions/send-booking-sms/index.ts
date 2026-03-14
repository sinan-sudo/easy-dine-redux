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

    // Ensure number has +91 prefix for TextBee
    const number = mobile_number.startsWith("+") ? mobile_number : `+91${mobile_number.replace(/^\+?91/, "")}`;

    const occasionText = occasion && occasion !== "none" ? ` Occasion: ${occasion}.` : "";
    const message = `Your table is booked! Date: ${reservation_date}, Time: ${time_slot}, Table: ${table_number}, Guests: ${party_size}.${occasionText} See you soon! - EasyDine`;

    const apiKey = Deno.env.get("TEXTBEE_API_KEY");
    const deviceId = Deno.env.get("TEXTBEE_DEVICE_ID");

    if (!apiKey || !deviceId) {
      return new Response(JSON.stringify({ error: "TextBee API key or Device ID not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send SMS to user
    const smsResponse = await fetch(`https://api.textbee.dev/api/v1/gateway/devices/${deviceId}/send-sms`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipients: [number],
        message,
      }),
    });

    const smsResult = await smsResponse.json();
    console.log("TextBee user SMS response:", JSON.stringify(smsResult));

    // Send SMS to admin
    const adminNumber = "+918590994644";
    const adminMessage = `A user has booked ${party_size} seat(s). Table: ${table_number}, Date: ${reservation_date}, Time: ${time_slot}.`;

    const adminSmsResponse = await fetch(`https://api.textbee.dev/api/v1/gateway/devices/${deviceId}/send-sms`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipients: [adminNumber],
        message: adminMessage,
      }),
    });

    const adminSmsResult = await adminSmsResponse.json();
    console.log("TextBee admin SMS response:", JSON.stringify(adminSmsResult));

    return new Response(JSON.stringify({ success: true, sms_result: smsResult, admin_sms_result: adminSmsResult }), {
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
