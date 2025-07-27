
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config'; 
import Product from '../models/Product.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

export const chatWithBot = async (req, res) => {
  try {
   
    const { messages } = req.body;
    const lastMessage = messages?.[messages.length - 1]?.content || req.body.message || "";

    if (!lastMessage) {
        return res.status(400).json({ error: "Message content is required." });
    }
    

    
    const products = await Product.find({}, 'name price unit -_id');
    const productListString = products.map(p => `${p.name} (₹${p.price}/${p.unit})`).join(", ");
    

    
    const today = new Date(); 
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    

    const deliveryDate = tomorrow.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    
    const systemInstruction = `
You are Apna Mandi's helpful assistant. You are speaking to a customer in India.
- If a user asks for prices or a price list, reply with this exact list: "${productListString}".
- If a user asks for product availability, reply: "All products you see in the app are available and in stock."
- If a user asks about delivery, reply: "Orders placed before 10 PM are delivered by 7 AM the next morning. For example, an order placed now would be delivered tomorrow, ${deliveryDate}."
- If a user asks about their order status, reply: "You can check your order status in the 'My Orders' section of the app."
- Always reply in simple, friendly, and helpful language.
`;


    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: lastMessage }] }],
        systemInstruction: {
          role: "model",
          parts: [{ text: systemInstruction }]
        }
    });
   

    const response = result.response;
    const text = response.text();

    res.json({ reply: text });

  } catch (err) {

    if (err instanceof ReferenceError) {
        return res.status(500).json({ error: "Server configuration error.", details: err.message });
    }
    res.status(500).json({ error: "Gemini API error", details: err.message });
  }
};