const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
    // 切换至逻辑更强大的 2.5 Pro 模型
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const { message } = JSON.parse(event.body);

    const systemInstruction = `你是一位精通子平古法命理的资深大师。
    请基于《渊海子平》《子平真诠》《穷通宝鉴》进行深度推演。
    针对复杂难题：
    1. 必须有明确的格局定位（成败救应）。
    2. 必须有准确的调候建议。
    3. 语言要古雅且直指核心，避免冗长描述以防系统超时。`;

    const result = await model.generateContent(`${systemInstruction}\n\n求测事项：${message}`);
    const response = await result.response;
    
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: response.text() }),
    };
  } catch (error) {
    console.error("Pro模型运行异常:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: "大师正在闭目沉思，请稍后重试（Pro-Error）：" + error.message }),
    };
  }
};
