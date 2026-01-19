const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
  // 仅允许 POST 请求
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
    // 精确指定 Gemini 2.5 Pro 模型
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const { message } = JSON.parse(event.body);

    // 系统指令：由于 2.5 Pro 逻辑极强，我们可以要求它直接给出深度推演
    const systemInstruction = `你是一位精通子平命理的大师，擅长《渊海子平》、《子平真诠》和《穷通宝鉴》。
    针对用户的问题，请提供深度的逻辑分析，包括格局定性、用神选取及调候建议。
    注意：回答要直指核心，逻辑清晰，避免不必要的冗长描述。`;

    const result = await model.generateContent(`${systemInstruction}\n\n求测事项：${message}`);
    const response = await result.response;
    const text = response.text();
    
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: text }),
    };
  } catch (error) {
    console.error("Pro Model Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: "大师正在闭目沉思，请尝试稍后重试。报错详情：" + error.message }),
    };
  }
};
