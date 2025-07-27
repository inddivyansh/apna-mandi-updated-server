import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config'; 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });


const products = [
  { name: "Potatoes (Aloo)", price: 1200, unit: "50kg sack" },
  { name: "Onions (Pyaaz)", price: 1500, unit: "50kg sack" },
  { name: "Gram Flour (Besan)", price: 90, unit: "kg" },
  { name: "Cooking Oil", price: 1650, unit: "15 litre tin" },
];
const productListString = products.map(p => `${p.name} (₹${p.price}/${p.unit})`).join(", ");


const systemInstruction = `
You are Apna Mandi's helpful assistant. 
- If user asks for prices, reply with: "${productListString}".
- If user asks for product availability, reply: "All products are available."
- If user asks about delivery, reply: "Orders placed before 10 PM are delivered by 7 AM next day, July 28th, 2025."
- If user asks about order status, reply: "You can check your order status in the app."
Always reply in simple, friendly language.
`;


export const chatWithBot = async (req, res) => {
  try {
   
    const { messages } = req.body;
    const lastMessage = messages?.[messages.length - 1]?.content || req.body.message || "";

    if (!lastMessage) {
        return res.status(400).json({ error: "Message content is required." });
    }

    
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: lastMessage }] }],
        systemInstruction: systemInstruction,
    });

    const response = result.response;
    const text = response.text();


    res.json({ reply: text });

  } catch (err) {
    console.error("Chatbot SDK error:", err);
    res.status(500).json({ error: "Gemini API error", details: err.message });
  }
};