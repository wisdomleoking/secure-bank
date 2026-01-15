
import { GoogleGenAI } from "@google/genai";
import { UserData } from "../types";

// Always initialize with API key from environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getAIResponse = async (userMessage: string, userData: UserData | null) => {
  try {
    const context = userData ? `
      User Name: ${userData.name}
      Security Score: ${userData.securityScore}%
      Carbon Footprint: ${userData.esgData.carbonFootprint} kg
      Accounts: ${userData.accounts.map(a => `${a.type} ($${a.balance})`).join(', ')}
      Recent Spending: ${userData.recentTransactions.filter(t => t.amount < 0).slice(0, 3).map(t => `${t.description} ($${t.amount})`).join(', ')}
      Savings Goals: ${userData.savingsGoals.map(g => `${g.name} (${Math.round((g.current / g.target) * 100)}% complete)`).join(', ')}
    ` : 'Guest access mode.';

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userMessage,
      config: {
        systemInstruction: `You are "Aura", the advanced AI financial consciousness of Helious Bank 2025.
        Your tone is professional yet futuristic and helpful. 
        Analyze the user's financial data to provide high-value, predictive insights. 
        Use markdown for formatting. Keep responses concise and focused on wealth optimization.
        Financial Context: ${context}`,
        temperature: 0.8,
      }
    });

    return response.text || "Neural connection interrupted. Please restate your query.";
  } catch (error) {
    console.error("Neural Error:", error);
    return "I've encountered a glitch in my financial models. Please wait while I recalibrate.";
  }
};
