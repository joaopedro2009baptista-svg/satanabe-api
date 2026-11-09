
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, apikey, Authorization"
  );
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      valid: false,
      success: false,
      reason: "method_not_allowed"
    });
  }

  try {
    const body =
      typeof req.body === "string"
        ? req.body
        : JSON.stringify(req.body ?? {});

    const headers = {
      "Content-Type": "application/json"
    };

    if (process.env.SUPABASE_ANON_KEY) {
      headers.apikey = process.env.SUPABASE_ANON_KEY;
      headers.Authorization =
        `Bearer ${process.env.SUPABASE_ANON_KEY}`;
    }

    const response = await fetch(
      "https://agkjutuvfjcahckhjkra.supabase.co/functions/v1/validate-license-legacy",
      {
        method: "POST",
        headers,
        body
      }
    );

    const responseText = await response.text();

    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = {
        valid: false,
        success: false,
        reason: "invalid_upstream_response"
      };
    }

    return res.status(response.status).json(responseData);

  } catch (error) {
    console.error("Satanabe API error:", error);

    return res.status(502).json({
      valid: false,
      success: false,
      reason: "upstream_unavailable"
    });
  }
}
