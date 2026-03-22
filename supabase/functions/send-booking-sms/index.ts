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
    const { type, mobile_number, reservation_date, time_slot, party_size, table_number, occasion } = await req.json();

    const apiKey = Deno.env.get("TEXTBEE_API_KEY");
    const deviceId = Deno.env.get("TEXTBEE_DEVICE_ID");

    if (!apiKey || !deviceId) {
      return new Response(JSON.stringify({ error: "TextBee API key or Device ID not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sendSms = async (recipient: string, message: string) => {
      const res = await fetch(`https://api.textbee.dev/api/v1/gateway/devices/${deviceId}/send-sms`, {
        method: "POST",
        headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ recipients: [recipient], message }),
      });
      return res.json();
    };

    if (type === "admin-alert") {
      // Only notify admin about new booking
      const adminNumber = "+918590994644";
      const adminMessage = `New booking request: ${party_size} seat(s), Table: ${table_number}, Date: ${reservation_date}, Time: ${time_slot}. Please review in admin dashboard.`;
      const result = await sendSms(adminNumber, adminMessage);
      console.log("Admin alert SMS:", JSON.stringify(result));
      return new Response(JSON.stringify({ success: true, admin_sms_result: result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "user-confirmation") {
      if (!mobile_number) {
        return new Response(JSON.stringify({ error: "Missing mobile_number" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const number = mobile_number.startsWith("+") ? mobile_number : `+91${mobile_number.replace(/^\+?91/, "")}`;
      const occasionText = occasion && occasion !== "none" ? ` Occasion: ${occasion}.` : "";
      const message = `Your reservation is confirmed! Date: ${reservation_date}, Time: ${time_slot}, Table: ${table_number}, Guests: ${party_size}.${occasionText} See you soon! - EasyDine`;
      const result = await sendSms(number, message);
      console.log("User confirmation SMS:", JSON.stringify(result));
      return new Response(JSON.stringify({ success: true, sms_result: result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "user-rejection") {
      if (!mobile_number) {
        return new Response(JSON.stringify({ error: "Missing mobile_number" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const number = mobile_number.startsWith("+") ? mobile_number : `+91${mobile_number.replace(/^\+?91/, "")}`;
      const message = `We're sorry, your reservation for ${reservation_date} at ${time_slot} (Table ${table_number}, ${party_size} guests) could not be confirmed. Please try booking a different time or table. - EasyDine`;
      const result = await sendSms(number, message);
      console.log("User rejection SMS:", JSON.stringify(result));
      return new Response(JSON.stringify({ success: true, sms_result: result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid type. Use 'admin-alert', 'user-confirmation', or 'user-rejection'" }), {
      status: 400,
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
