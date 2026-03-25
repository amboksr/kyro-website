exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured.' }) };
  }
  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request.' }) }; }
  const groqMessages = [
    { role: 'system', content: 'You are Kyro, a brilliant and friendly AI assistant.' },
    ...(body.messages || [])
  ];
  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', max_tokens: 1000, messages: groqMessages })
  });
  const data = await groqRes.json();
  if (data.error) return { statusCode: 500, body: JSON.stringify({ error: data.error.message }) };
  return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reply: data.choices?.[0]?.message?.content || 'No response.' }) };
};