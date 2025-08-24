// File: app/api/chat/route.js

import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Define the structure of the invoice for the AI model
const invoiceTool = {
  type: "function",
  function: {
    name: "create_invoice",
    description: "Creates a structured invoice from user-provided details.",
    parameters: {
      type: "object",
      properties: {
        client_name: { type: "string", description: "The name of the client." },
        client_email: { type: "string", description: "The email address of the client." },
        due_date: { type: "string", description: "The invoice due date in YYYY-MM-DD format." },
        items: {
          type: "array",
          description: "A list of line items for the invoice.",
          items: {
            type: "object",
            properties: {
              description: { type: "string", description: "Description of the service or product." },
              quantity: { type: "number", description: "Quantity of the item." },
              rate: { type: "number", description: "The price per unit of the item." },
            },
            required: ["description", "quantity", "rate"],
          },
        },
      },
      required: ["client_name", "client_email", "due_date", "items"],
    },
  },
};

export async function POST(req) {
  try {
    const { message, conversationHistory } = await req.json();

    const systemMessage = `You are an expert invoice creation assistant. Your primary goal is to collect all necessary information to create an invoice by calling the 'create_invoice' function.

    The required fields are:
    1. Client Name
    2. Client Email
    3. Due Date
    4. At least one line item with a Description, Quantity, and Rate.

    **Crucially, do not assume or invent any details the user has not provided.** If the user's prompt is missing any of these details (like the rate or quantity for an item), your only job is to ask a clarifying question to get that specific missing information. Even after asking, if the user still does not provide the necessary details, keep them blank.

    Only when you have gathered *all* the required details should you call the 'create_invoice' function.`;

    const messages = [
        { role: "system", content: systemMessage },
        ...conversationHistory.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
        })),
        { role: "user", content: message }
    ];

    const response = await groq.chat.completions.create({
      model: "llama3-70b-8192", // A powerful model for better function calling
      messages: messages,
      tools: [invoiceTool],
      tool_choice: "auto",
    });

    const { finish_reason, message: response_message } = response.choices[0];

    if (finish_reason === "tool_calls" && response_message.tool_calls) {
      const toolCall = response_message.tool_calls[0];
      const invoiceData = JSON.parse(toolCall.function.arguments);
      
      // Calculate total amount
      const total = invoiceData.items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
      invoiceData.total = total;
      
      return NextResponse.json({
        type: "invoice",
        data: invoiceData,
      });
    } else {
      // The AI is asking a clarifying question
      return NextResponse.json({
        type: "clarification",
        message: response_message.content,
      });
    }
  } catch (error) {
    console.error("Groq API Error:", error);
    return NextResponse.json(
      { error: "Failed to communicate with AI service." },
      { status: 500 }
    );
  }
}