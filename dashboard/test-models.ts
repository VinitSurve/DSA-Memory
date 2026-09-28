import { GoogleGenAI } from '@google/genai';
async function testModel(modelName: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.generateContent({ model: modelName, contents: "hello" });
    console.log(`Model ${modelName}: SUCCESS`);
  } catch (e: any) {
    console.log(`Model ${modelName}: FAIL (${e.message})`);
  }
}
async function run() {
  await testModel('gemini-3.8-flash');
  await testModel('gemini-pro-latest');
}
run();
