import Groq from "groq-sdk";
import TeleUser from "../../model/User";
import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import cron from 'node-cron';
dotenv.config()

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN as string, { polling: true });

interface SaveResponseData {
    chatId?: number;
    userId?: number;
    name?: string;
    chatType: 'private' | 'group' | 'supergroup' | 'channel';
    groupId?: number;
    question: string;
    answer: string;
}

export const getAIResponse = async (userMessage: string): Promise<string> => {
    try {
        // Handle goodbye messages
        const endPhrases = ["bye", "goodbye", "see you", "talk later", "thanks", "thank you", "take care", "peace out", "catch you later", "adios", "adieu", "ciao", "later"];
        if (endPhrases.some(phrase => userMessage.toLowerCase().includes(phrase))) {
            const goodbyeMessages = ["Alright! Keep up the great work! 🚀 See you soon! 👋", "Have a wonderful day! 😊", "Take care and keep learning! 📚", "Until next time! 👋", "Wishing you all the best! 🌟", "Stay positive and keep pushing forward! 💪", "Have a productive day! 💼", "Enjoy your time! 😊", "Take care and stay safe! 🌈", "Best wishes! 🍀"];
            const randomIndex = Math.floor(Math.random() * goodbyeMessages.length);
            return goodbyeMessages[randomIndex];
        }

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `You are a friendly, engaging assistant that helps users reflect on their daily progress. 
                    - Make responses natural, fun, and engaging. Use humor and emoji to keep things lively! 😄  
                    - If they mention Blender, ask things like Modeling, animation, or texturing etc..? 🎨"  
                    - If they mention DaVinci, ask things like Editing, color grading, or transitions etc..? 🎬"  
                    - If they say they learned something but don’t specify, ask question like What was the coolest thing you learned today? 🤔"  
                    - If they did nothing, say: "No worries! Tomorrow is another shot at awesomeness! 🚀"  
                    - If they dodge the question, put jokes like "Avoiding my question again? You’re a mystery today! 🕵️‍♂️"  
                    - If they already answered, don’t repeat the same question.  
                    - If disengaged, shift topics: "Anything exciting happen today besides work? 🎉"  
                    - Keep responses under 25 words for quick, snappy convos.  
                    - If the conversation is ending, say a friendly goodbye with encouragement!`
                },
                { role: "user", content: userMessage },
            ],
            response_format: { type: "text" },
            temperature: 0.8,
            max_tokens: 50,
        });

        let aiResponse = response.choices?.[0]?.message?.content?.trim() || "I'm unable to process this right now. 😕";


        return aiResponse;
    } catch (error) {
        console.error("AI API Error:", error);
        return "Oops! Something went wrong. 🤖💥 Try again in a bit!";
    }
};


interface DailyResponse {
    date: string;
    responses: { question: string; answer: string; timestamp: Date }[];
}

export const evaluateUserPerformance = async (
    chatId: number,
    startDate: string,
    endDate: string
): Promise<string> => {
    try {
        // Find user by chatId
        const user = await TeleUser.findOne({ chatId });

        if (!user) return "User not found. ❌";

        // Filter responses within the given date range
        const filteredResponses: DailyResponse[] = user.dailyResponses.filter(d =>
            d.date >= startDate && d.date <= endDate
        );

        if (filteredResponses.length === 0) return "No responses found in this date range. 📭";

        // Organize responses in date order
        let userMessage = `📊 *Performance Evaluation* 📊\n\n🗓️ *Date Range:* ${startDate} to ${endDate}\n\n`;

        let missedDays = 0;
        filteredResponses.forEach(day => {
            userMessage += `📅 *Date:* ${day.date}\n`;
            day.responses.forEach(r => {
                userMessage += `❓ *${r.question}*\n➡️ ${r.answer || "No response"}\n\n`;
            });

            // Count missed days
            if (day.responses.some(r => r.answer === "No response")) missedDays++;
        });

        // Send request to Groq API
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `You're an expert at evaluating business performance. Critically analyze the user's responses and provide:
                    - A **score out of 100**
                    - Key **areas for improvement**
                    - Positive feedback if applicable
                    - Mention if the user was **lazy or inconsistent**
                    - Mention the **number of missed days** in the range
                    - Format the response in a **well-spaced readable text format with emojis and engagement.**`,
                },
                { role: "user", content: userMessage },
            ],
            response_format: { type: "text" },
            temperature: 0.8,
            max_tokens: 150,
        });

        let aiResponse = response.choices?.[0]?.message?.content?.trim() || "I'm unable to process this right now. 😕";

        // Ensure proper spacing & formatting for Telegram
        const formattedResponse = `🔹 *Performance Summary* 🔹\n\n${aiResponse}\n\n📌 Keep up the effort! 💪`;

        return formattedResponse;
    } catch (error) {
        console.error("Error evaluating user performance:", error);
        return "There was an error processing the request. 🚨";
    }
};

const saveResponse = async (data: SaveResponseData) => {
    const today = new Date().toISOString().split("T")[0];

    if (!data.userId) return;

    let user = await TeleUser.findOne({ userId: data.userId });

    if (!user) {
        user = await TeleUser.create({
            userId: data.userId,
            chatId: data.chatId,
            name: data.name,
            chatType: data.chatType,
            groupId: data.groupId,
            dailyResponses: [],
        });
    }

    let dailyResponse = user.dailyResponses.find(d => d.date === today);

    if (!dailyResponse) {
        dailyResponse = { date: today, responses: [] };
        user.dailyResponses.push(dailyResponse);
    }

    // Check for duplicate questions before saving
    const existingQuestion = dailyResponse.responses.find(r => r.question === data.question);
    if (existingQuestion && data.answer === "") return; // Prevent duplicate unanswered questions

    // Only save if it's a new response or a valid answer
    if (!existingQuestion || data.answer.trim() !== "") {
        dailyResponse.responses.push({
            question: data.question,
            answer: data.answer,
            timestamp: new Date(),
        });

        await user.save();
    }
};


// Function to send daily check-in
export const sendDailyCheckIn = async () => {
    const users = await TeleUser.find();

    for (const user of users) {
        const firstQuestion = "Hello! What did you learn today?";
        bot.sendMessage(user.userId, firstQuestion);

        await saveResponse({
            chatId: user.chatId,
            userId: user.userId,
            name: user.name,
            chatType: user.chatType,
            groupId: user.groupId,
            question: firstQuestion,
            answer: "",
        });
    }
};


// Schedule message every day at 8:00 PM (UTC)
cron.schedule("30 14 * * *", sendDailyCheckIn);

// Handle user responses
bot.on("message", async (msg) => {
    try {
        const chatId = msg.chat.id;
        const userId = msg.from?.id;
        const name = msg.from?.first_name || "Unknown";
        const chatType = msg.chat.type;
        const groupId = chatType === "group" ? chatId : undefined;
        const userResponse = msg.text?.trim();

        if (!userId || !userResponse) return;

        if (chatType === "group") return;
        // console.log(`Received message from ${name} (${userId}): ${userResponse}`);

        let user = await TeleUser.findOne({ userId });

        if (!user) {
            // New user setup
            user = await TeleUser.create({
                userId, chatId, name, chatType, groupId, dailyResponses: [],
            });
            // console.log(`Created new user: ${name} (${userId})`);

            const firstQuestion = "Hello! What did you learn today?";
            bot.sendMessage(chatId, firstQuestion);

            await saveResponse({ chatId, userId, name, chatType, groupId, question: firstQuestion, answer: "" });
            return;
        }

        // ✅ Support "perf 10-3 to 20-4" (March 10 to April 20)
        const performanceRegex = /^perf\s+(\d{1,2})(?:-(\d{1,2}))?(?:\s+to\s+(\d{1,2})(?:-(\d{1,2}))?)?$/i;
        const match = userResponse.match(performanceRegex);

        if (match) {
            const currentDate = new Date();
            const year = currentDate.getFullYear();

            let startDay = match[1].padStart(2, "0"); // Day (e.g., "10")
            let startMonth = match[2] ? match[2].padStart(2, "0") : (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Month

            let endDay = match[3]?.padStart(2, "0") || startDay; // End day (default = startDay)
            let endMonth = match[4] ? match[4].padStart(2, "0") : startMonth; // End month (default = start month)

            const startDate = `${year}-${startMonth}-${startDay}`;
            let endDate = `${year}-${endMonth}-${endDay}`;

            // Convert to Date objects for validation
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                bot.sendMessage(chatId, "⚠️ Invalid date! Use `perf DD-MM to DD-MM` (Example: `perf 10-3 to 20-4`)");
                return;
            }

            // If only one date is given, fetch last 7 days
            if (!match[3]) {
                start.setDate(start.getDate() - 6);
            }

            const formattedStart = start.toISOString().split("T")[0];
            const formattedEnd = end.toISOString().split("T")[0];

            bot.sendMessage(chatId, `⏳ Fetching performance from *${formattedStart}* to *${formattedEnd}*...`);

            const performanceResult = await evaluateUserPerformance(userId, formattedStart, formattedEnd);
            bot.sendMessage(chatId, performanceResult);
            return;
        }



        const today = new Date().toISOString().split("T")[0];
        let dailyResponse = user.dailyResponses.find(d => d.date === today);

        if (!dailyResponse) {
            dailyResponse = { date: today, responses: [] };
            user.dailyResponses.push(dailyResponse);
        }

        const lastResponse = dailyResponse.responses.length > 0 ? dailyResponse.responses[dailyResponse.responses.length - 1] : null;

        // If the user already answered the last question, fetch a new AI-generated question
        let followUpQuestion = "";
        if (lastResponse && lastResponse.answer.trim() !== "") {
            followUpQuestion = await getAIResponse(userResponse);

            // Prevent asking the same question again
            if (dailyResponse.responses.some(r => r.question === followUpQuestion)) {
                // console.log("Skipping duplicate question:", followUpQuestion);
                return;
            }
            bot.sendMessage(chatId, followUpQuestion);
            // console.log(`Sent response to ${name} (${userId}): ${followUpQuestion}`);

            await saveResponse({ chatId, userId, name, chatType, groupId, question: followUpQuestion, answer: "" });
        }

        // Save the user’s response
        await saveResponse({ chatId, userId, name, chatType, groupId, question: lastResponse?.question || "What did you learn today?", answer: userResponse });

    } catch (error) {
        // console.error("Error handling message:", error);
    }
});

cron.schedule("29 18 * * *", async () => {  // Runs at 11:59 PM IST
    try {
        const today = new Date().toISOString().split("T")[0];

        const users = await TeleUser.find({
            "dailyResponses.date": today,
            "dailyResponses.responses.answer": { $exists: true, $eq: "" } // Checks if answer is empty
        });

        // console.log(`Checking for missed responses. Users to update: ${users.length}`);

        for (const user of users) {
            const dailyResponse = user.dailyResponses.find(d => d.date === today);

            if (dailyResponse) {
                dailyResponse.responses.push({
                    question: "Missed",
                    answer: "No response",
                    timestamp: new Date()
                });
                if (user.chatId)
                    bot.sendMessage(user.chatId, "You missed today's check-in! Make sure to answer tomorrow. ✅");
                await user.save();
                // console.log(`Marked user ${user.userId} as "Missed"`);
            }
        }

        // console.log("Missed check-in process completed.");
    } catch (error) {
        // console.error("Error in missed check-in cron job:", error);
    }
});
export { bot };