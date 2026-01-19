const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
  // 检查请求方法
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { message } = JSON.parse(event.body);

    // AI 的系统设定：让它读过这五本书
    const systemInstruction = `你是一位精通子平命理的大师。你的知识库包含《渊海子平》、《子平真诠》、《穷通宝鉴》等五本古籍。请严格基于这些古籍逻辑回答用户的问题。`;

    const result = await model.generateContent(`${systemInstruction}\n\n用户问题：${message}`);
    const response = await result.response;
    
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: response.text() }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "大师现在有点累，请稍后再试。" }),
    };
  }
};
