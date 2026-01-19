const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const { message } = JSON.parse(event.body);
  const systemInstruction = `你是一位精通子平命理的大师...`;

  // 尝试重试逻辑
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      const result = await model.generateContent(`${systemInstruction}\n\n用户问题：${message}`);
      const response = await result.response;
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: response.text() }),
      };
    } catch (error) {
      attempts++;
      if (error.message.includes("503") || error.message.includes("overloaded")) {
        console.log(`服务器拥挤，正在进行第 ${attempts} 次重试...`);
        // 等待 2 秒后重试
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        return {
          statusCode: 500,
          body: JSON.stringify({ reply: "大师推演受阻，原因：" + error.message }),
        };
      }
    }
  }

  return {
    statusCode: 503,
    body: JSON.stringify({ reply: "由于求测者众多，大师闭关静修中，请稍后再试（503 Overloaded）。" }),
  };
};
