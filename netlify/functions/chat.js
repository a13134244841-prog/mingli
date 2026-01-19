const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // 1. 初始化，注意我们这次换用最稳妥的模型名
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
    // 尝试使用 gemini-pro，这是谷歌最通用的模型名
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const { message } = JSON.parse(event.body);

    const systemInstruction = `你是一位精通子平命理的大师。你的知识库包含《渊海子平》、《子平真诠》、《穷通宝鉴》等五本古籍。请严格基于这些古籍逻辑回答用户的问题。`;

    // 2. 发送请求
    const result = await model.generateContent(`${systemInstruction}\n\n用户问题：${message}`);
    const response = await result.response;
    const text = response.text();
    
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: text }),
    };
  } catch (error) {
    console.error("Detailed Error:", error);
    // 如果报错，把具体的报错信息传回网页，方便我们直接在网页上看到原因
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: "大师推演受阻，原因：" + error.message }),
    };
  }
};
