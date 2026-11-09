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
      reason: "method_not_allowed"
    });
  }

  try {
    const upstreamHeaders = {
      "Content-Type": "application/json"
    };

    if (process.env.SUPABASE_ANON_KEY) {
      upstreamHeaders.apikey = process.env.SUPABASE_ANON_KEY;
      upstreamHeaders.Authorization =
        `Bearer ${process.env.SUPABASE_ANON_KEY}`;
    }

    const response = await fetch(
      "https://agkjutuvfjcahckhjkra.supabase.co/functions/v1/validate-license",
      {
        method: "POST",
        headers: upstreamHeaders,
        body: JSON.stringify(req.body)
      }
    );

    const data = await response.text();

    res.status(response.status);
    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") || "application/json"
    );

    return res.send(data);
  } catch {
    return res.status(502).json({
      valid: false,
      reason: "upstream_unavailable"
    });
  }
}
