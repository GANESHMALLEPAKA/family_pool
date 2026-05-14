import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // There isn't a direct "list models" method on the instance easily accessible without looking up docs, 
        // but we can try a simple prompt with a different model if pro fails.
        // Actually, let's just try to generate content with a simple prompt to confirm.

        console.log("Using key:", process.env.GEMINI_API_KEY ? "Present" : "Missing");

        const result = await model.generateContent("Hello");
        console.log("Response:", result.response.text());
    } catch (error) {
        console.error("Error:", error.message);
    }
};

run();
