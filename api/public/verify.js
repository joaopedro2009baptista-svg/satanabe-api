
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
      status: "error",
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body || {};

    const payload = {
      key: body.key,
      hwid: body.hwid
    };

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
        body: JSON.stringify(payload)
      }
    );

    const result = await response.text();

    res.status(response.status);
    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") || "application/json"
    );

    return res.send(result);

  } catch (error) {
    console.error("Satanabe API:", error);

    return res.status(502).json({
      status: "error",
      success: false,
      message: "Server connection failed"
    });
  }
}
