const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
    // 使用最新的 Gemini 3 Flash 预览版，速度极快且推理能力远超旧版
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const { message } = JSON.parse(event.body);

    const systemInstruction = `你是一位精通子平命理的大师。你现在运行在 Gemini 3 架构上，拥有极强的古籍逻辑推演能力。
    请基于《渊海子平》、《子平真诠》、《穷通宝鉴》的逻辑，对用户的问题进行深度拆解。
    回答要求：
    1. 结构化：先排八字，再论格局，后看调候。
    2. 深度：不仅给结论，要给出古籍中的推导逻辑。
    3. 风格：专业、严谨、古雅。`;

    const result = await model.generateContent(`${systemInstruction}\n\n用户咨询：${message}`);
    const response = await result.response;
    
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: response.text() }),
    };
  } catch (error) {
    console.error("Gemini 3 运行异常:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: "大师推演受阻（G3-Error）：" + error.message }),
    };
  }
};
