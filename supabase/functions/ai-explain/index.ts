import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { myProfile, otherProfile, score } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `You are a roommate compatibility advisor. Given two people's profiles, explain why they are ${score >= 70 ? "highly" : score >= 50 ? "moderately" : "somewhat"} compatible (${score}% match).

Person 1: ${myProfile.name}, budget $${myProfile.budget}/mo, ${myProfile.sleep_schedule} sleeper, cleanliness: ${myProfile.cleanliness}, ${myProfile.smoking ? "smokes" : "non-smoker"}, ${myProfile.drinking ? "drinks" : "non-drinker"}, interests: ${myProfile.interests?.map((i: any) => i.interest_name).join(", ") || "none listed"}

Person 2: ${otherProfile.name}, budget $${otherProfile.budget}/mo, ${otherProfile.sleep_schedule} sleeper, cleanliness: ${otherProfile.cleanliness}, ${otherProfile.smoking ? "smokes" : "non-smoker"}, ${otherProfile.drinking ? "drinks" : "non-drinker"}, interests: ${otherProfile.interests?.map((i: any) => i.interest_name).join(", ") || "none listed"}

Write a friendly 2-3 sentence explanation of their compatibility. Be specific about what they share and where they differ.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a roommate compatibility advisor. Keep responses concise and friendly." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const explanation = data.choices?.[0]?.message?.content || "You two share compatible lifestyles!";

    return new Response(JSON.stringify({ explanation }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-explain error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
