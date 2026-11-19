async function reviewCode(diff) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set');
  }

  const prompt = `
    Ты — опытный Senior Fullstack разработчик. Твоя задача — проверить следующий код (diff) и найти в нем ошибки, потенциальные баги, проблемы с безопасностью или плохие практики.
    
    Отвечай СТРОГО в формате JSON:
    {
      "summary": "Краткое общее резюме изменений",
      "issues": [
        { "line": 1, "severity": "high|medium|low", "comment": "Описание проблемы" }
      ]
    }
    
    Если проблем нет, верни пустой массив issues.
    
    Вот код:
    \`\`\`diff
    ${diff}
    \`\`\`
  `;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3001",
      "X-Title": "My AI Reviewer"
    },
    body: JSON.stringify({
      model: "openrouter/free", 
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  try {
    return JSON.parse(data.choices[0].message.content);
  } catch (e) {
    return { summary: "Failed to parse JSON", raw: data.choices[0].message.content };
  }
}

module.exports = { reviewCode };
