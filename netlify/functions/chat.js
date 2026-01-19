const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
    // 关键：将模型名改为你看到的 2.5 系列
    // 如果你看到的具体名字不同，请修改下方引号里的内容
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const { message } = JSON.parse(event.body);

    const systemInstruction = `你是一位精通子平命理的大师。你的知识库包含《渊海子平》、《子平真诠》、《穷通宝鉴》等五本古籍。请严格基于这些古籍逻辑回答用户的问题。回答时请先列出八字排盘，再进行古法分析。`;

    const result = await model.generateContent(`${systemInstruction}\n\n用户问题：${message}`);
    const response = await result.response;
    
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: response.text() }),
    };
  } catch (error) {
    console.error("Detailed Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: "大师推演受阻，原因：" + error.message }),
    };
  }
};
