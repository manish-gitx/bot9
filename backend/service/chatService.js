const{User,Conversation,Booking}=require('../database/db');
const OpenAI = require('openai');
const{ getRooms,bookRoom}=require("./services")

require("dotenv").config();

const tools=[
  {
    name: "get_rooms",
    description: "Get available hotel rooms",
    parameters: {  }
  },
  {
    name: "book_room",
    description: "Book a hotel room",
    parameters: {
      type: "object",
      properties: {
        roomId: { type: "number" },
        fullName: { type: "string" },
        email: { type: "string" },
        nights: { type: "number" },
        checkInDate: { type: "string", description: "Check-in date in YYYY-MM-DD format" }
      },
      required: ["roomId", "fullName", "email", "nights", "checkInDate"]
    }
  }
]

const openai = new OpenAI({
    
  apiKey: process.env.OPEN_API_KEY
  });
  

async function chatService(req, res) {

    
    const { message, userId } = req.body;
  
    let user = await User.findOne({ where: { userId } });
    if (!user) {
      user = await User.create({ userId, lastInteraction: new Date() });
    } else {
      await user.update({ lastInteraction: new Date() });
    }
  
    let conversation = await Conversation.findOne({ where: { userId } });
    if (!conversation) {
      conversation = await Conversation.create({ userId, messages: '[]' });
    }
  
    let messages = JSON.parse(conversation.messages);
    messages.push({ role: 'user', content: message });
  
    const systemMessage = `You are a hotel booking assistant chatbot. Key points:
    1. If asked "Who are you?", explain that you're a hotel booking assistant chatbot.
    2. Guide users through the booking process: greeting, showing rooms, asking for check-in date, nights of stay, calculating price, and confirming booking.
    3. When a booking is confirmed, provide the booking ID, check-in date, and check-out date to the user.
    4. You can communicate in any language the user prefers.
    5. Pricing should be in Indian rupees.
    User details: ${JSON.stringify(user)}`;
  
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemMessage },
          ...messages
        ],
        functions:tools,
        function_call: "auto",
      });
  
      let assistantMessage = completion.choices[0].message;
      
  
      if (assistantMessage.function_call) {
        const functionName = assistantMessage.function_call.name;
        const functionArgs = JSON.parse(assistantMessage.function_call.arguments);
  
        let functionResult;
        if (functionName === 'get_rooms') {
          functionResult = await getRooms();
        } else if (functionName === 'book_room') {
          functionResult = await bookRoom(
            functionArgs.roomId,
            functionArgs.fullName,
            functionArgs.email,
            functionArgs.nights,
            functionArgs.checkInDate
          );
        }
  
        
        messages.push({
          role: "function",
          name: functionName,
          content: JSON.stringify(functionResult)
        });
  
        const secondCompletion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: messages
        });
  
        assistantMessage = secondCompletion.choices[0].message;
      }
  
      messages.push(assistantMessage);
  
      await conversation.update({ messages: JSON.stringify(messages) });
  
      res.json({ response: assistantMessage.content });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
  
  }

  module.exports = chatService