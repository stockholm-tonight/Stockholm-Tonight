exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { messages, location } = JSON.parse(event.body);

    const now = new Date();
    const time = now.toLocaleTimeString("en-SE", { hour: "2-digit", minute: "2-digit" });
    const day = now.toLocaleDateString("en-SE", { weekday: "long" });
    const locStr = location ? `User's current location: ${location}.` : "User is near Slussen, Södermalm.";

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        system: `You are a warm, knowledgeable Stockholm local guide working nights at a hotel near Slussen, Södermalm. Current time: ${time} on ${day}. ${locStr}

RULES:
- Always respond in the SAME LANGUAGE the user writes in
- Be warm and friendly like a local friend — not a robot
- Give PRACTICAL, SPECIFIC answers with real Stockholm place names
- Keep answers to 3-5 sentences unless asked for more
- Mention if places might be closed at the current time
- Use 1-2 relevant emojis naturally
- For restaurants mention price range and if reservation is needed
- For transport always include approximate cost and time
- Never give generic tourist advice — be specific and local`,
        messages: messages
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong. Please try again." })
    };
  }
};
