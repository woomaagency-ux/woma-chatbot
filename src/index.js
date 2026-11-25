export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders()
      });
    }

    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        const { message } = await request.json();

        if (!message || typeof message !== "string") {
          return Response.json(
            { error: "Mensaje inválido" },
            { status: 400, headers: corsHeaders() }
          );
        }

        const response = await fetch(
          "https://api.anthropic.com/v1/messages",
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "x-api-key": env.ANTHROPIC_API_KEY,
              "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
              model: "claude-3-5-haiku-latest",
              max_tokens: 500,
              messages: [{ role: "user", content: message }]
            })
          }
        );

        const data = await response.json();

        return Response.json(
          { reply: data.content?.[0]?.text || "No pude responder." },
          { status: response.ok ? 200 : 502, headers: corsHeaders() }
        );
      } catch {
        return Response.json(
          { error: "Error al procesar el mensaje." },
          { status: 500, headers: corsHeaders() }
        );
      }
    }

    return new Response("WOMA Chatbot API funcionando", {
      headers: corsHeaders()
    });
  }
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}
