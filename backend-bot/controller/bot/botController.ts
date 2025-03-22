import Groq from "groq-sdk";
import TeleUser from "../../model/User";
import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import cron from 'node-cron';
dotenv.config()
import axios from "axios";

const DAILY_CHECKIN_TIME = process.env.DAILY_CHECKIN_TIME || "30 14 * * *";
const MISSED_CHECKIN_TIME = process.env.MISSED_CHECKIN_TIME || "29 18 * * *";


const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN as string, { webHook: true });

// Set webhook for Telegram updates
const WEBHOOK_URL = `${process.env.BACKEND_URL}/webhook`;

// Function to check and update webhook
const updateWebhook = async () => {
    try {
        const { data } = await axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getWebhookInfo`);

        if (!data.ok || data.result.url !== WEBHOOK_URL) {
            await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebhook`, { url: WEBHOOK_URL });
            console.log("Webhook set to:", WEBHOOK_URL);
        }
    } catch (error: any) {
        console.error("Webhook update failed:", error.response?.data || error.message);
    }
};


// Update webhook when bot starts
updateWebhook();

interface SaveResponseData {
    chatId?: number;
    userId?: number;
    name?: string;
    chatType: 'private' | 'group' | 'supergroup' | 'channel';
    groupId?: number;
    question: string;
    answer: string;
}

export const getAIResponse = async (userMessage: string, context?: string): Promise<string> => {
    try {
        // Handle goodbye messages
        const endPhrases = ["bye", "goodbye", "see you", "talk later", "thanks", "thank you", "take care", "peace out", "catch you later", "adios", "adieu", "ciao", "later"];
        if (endPhrases.some(phrase => userMessage.toLowerCase().includes(phrase))) {
            const goodbyeMessages = ["Alright! Keep up the great work! 🚀 See you soon! 👋", "Have a wonderful day! 😊", "Take care and keep learning! 📚", "Until next time! 👋", "Wishing you all the best! 🌟", "Stay positive and keep pushing forward! 💪", "Have a productive day! 💼", "Enjoy your time! 😊", "Take care and stay safe! 🌈", "Best wishes! 🍀"];
            const randomIndex = Math.floor(Math.random() * goodbyeMessages.length);
            return goodbyeMessages[randomIndex];
        }

        // Detect when the user reports no progress
        const noProgressPhrases = [
            "nothing", "no", "didn't do anything", "not today", "nah", "none", "zero",
            "nope", "not really", "was busy", "had no time", "didn't get to it", "not much",
            "wasn't able to", "couldn't", "skipped", "took a break", "lazy day", "procrastinated",
            "was tired", "too tired", "too busy", "had other things", "forgot", "got distracted",
            "wasn't feeling it", "didn't feel like it", "no motivation", "lost motivation", "burnt out",
            "nothing interesting", "same as before", "not in the mood", "meh", "not today, maybe later",
            "nothing new", "nothing at all", "blank day", "zero progress", "stuck", "no updates",
            "just chilling", "break day", "no improvement", "no energy"
        ];
        const userSaidNoProgress = noProgressPhrases.some(phrase => userMessage.toLowerCase().includes(phrase));


        let messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
            {
                role: "system",
                content: `You are an enthusiastic and insightful learning coach focused on helping users maximize their daily progress, particularly in creative fields like animation and game development. Your primary goal is to gather information about their daily activities and learning experiences.
        
                - **Proactive Questioning:** Your main objective is to ask engaging and relevant questions to understand what the user has accomplished or learned.
                - **Dynamic Responses:** Avoid repeating the same questions. Instead, adapt your responses to the user's input and the flow of the conversation.
                - **Adaptive Motivation:** If the user didn’t make progress, generate a **context-aware motivational message** based on their response (e.g., if they say "I was too busy with work," acknowledge their workload and encourage them accordingly).
                - **Creative Prompts:** Use humor, emojis, and engaging language to keep the conversation lively and fun. 😄
                - **Tool Specific Inquiries:** If the user mentions tools like Blender, DaVinci Resolve, Unreal Engine, or NVIDIA tools, Animations, Coding, Python, or JavaScript, ask specific follow-up questions related to their use (e.g., "Did you focus on modeling, animation, or texturing in Blender today? 🎨").
                - **Learning Focus:** If the user mentions learning something new without specifying, ask "What was the most exciting thing you learned today? 🤔".
                - **Gentle Redirection:** If the user deviates from the topic, gently steer them back by relating their current topic to animation or game development or coding . Use creative transitions like, "That's interesting! Speaking of creativity, did you work on any projects today?".
                - **Encouragement and Engagement:** If the user reports no progress, offer encouragement and suggest ways to get started. "No worries! Tomorrow is another chance to create something amazing! 🚀".
                - **Concise Responses:** Keep responses under 25 words for quick, snappy conversations.
                - **Friendly Farewell:** If the conversation is ending, offer a friendly goodbye and encouragement.
                - **Situational Awareness:** Avoid repeating questions they've already answered. Adapt your responses to the user's current context.
                - **Situational Awareness of reponses:** Do not ask about progress if the user already stated they did nothing.
                - **No Question Dodging:** If the user avoids answering a question, playfully call them out like "Dodging my question? You're being mysterious today! 🕵️‍♂️ or I thing you are good at chainging topic".
                - **Topic Shifting:** If the user is disengaged or unresponsive, change the topic with a question like, "Did anything exciting happen today outside of work? 🎉".`
            }
        ];

        if (context && context.trim()) {
            messages.push({
                role: "user",
                content: `Here’s our last conversation for context:\n\n${context}`
            });
        }

        messages.push({ role: "user", content: userMessage });

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: messages,
            response_format: { type: "text" },
            temperature: 0.8,
            max_tokens: 50,
        });

        let aiResponse = response.choices?.[0]?.message?.content?.trim() || "I'm unable to process this right now. 😕";
        // If the AI response still asks the same question, manually override it
        if (userSaidNoProgress && /what.*(learn|work|do|today)/i.test(aiResponse)) {
            const alternativeReplies = [
                "No worries! 🚀 Tomorrow is another chance to create something amazing! 😄",
                "Everyone needs a break sometimes! What’s something fun you did today? 🎉",
                "That’s okay! What’s something you're looking forward to this week? 🌟",
                "Taking a break is important too! What’s on your mind? 🤔",
                "No worries! Do you have any ideas for your next project? 🎨"
            ];
            return alternativeReplies[Math.floor(Math.random() * alternativeReplies.length)];
        }
        return aiResponse;

    } catch (error) {
        // console.error("AI API Error:", error);
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

        // If no responses exist in the range
        if (filteredResponses.length === 0) {
            return `📭 *No responses found between ${startDate} and ${endDate}.*\n\nTry engaging more in conversations! 😊`;
        }

        // If user has only one recorded day
        if (filteredResponses.length === 1) {
            return `📊 *Performance Evaluation* 📊\n\n🗓️ *Date Range:* ${startDate} to ${endDate}\n\n🔹 *Looks like you've just started!* 🚀\nIt's too soon to judge, but keep up the momentum! 💪`;
        }

        // Organize responses in date order
        let userMessage = `📊 *Performance Evaluation* 📊\n\n🗓️ *Date Range:* ${startDate} to ${endDate}\n\n`;

        let missedDays = 0;
        let totalResponses = 0;
        filteredResponses.forEach(day => {
            userMessage += `📅 *Date:* ${day.date}\n`;
            day.responses.forEach(r => {
                userMessage += `❓ *${r.question}*\n➡️ ${r.answer || "No response"}\n\n`;
            });

            totalResponses += day.responses.length;

            // Count missed days
            if (day.responses.some(r => r.answer === "No response")) missedDays++;
        });

        // If the user has very few responses
        if (totalResponses < 3) {
            return `📊 *Performance Evaluation* 📊\n\n🗓️ *Date Range:* ${startDate} to ${endDate}\n\n🔹 *Not much data yet!* 🧐\nLet's have more conversations to get meaningful feedback! 🚀`;
        }

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
            max_tokens: 200,
        });

        let aiResponse = response.choices?.[0]?.message?.content?.trim() || "I'm unable to process this right now. 😕";

        // Ensure proper spacing & formatting for Telegram
        const formattedResponse = `🔹 *Performance Summary* 🔹\n\n${aiResponse}\n\n📌 Keep up the effort! 💪`;

        return formattedResponse;
    } catch (error) {
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

    const dailyQuestions = [
        "Hey there! What did you learn today? 🤔",
        "Yo! Any cool skills or knowledge gained today? 🚀",
        "What’s one new thing you explored today? 🧠✨",
        "Tell me something interesting you discovered today! 👀",
        "Learning anything exciting today? Spill the beans! 😃",
        "How was your day? Did you pick up a new skill? 🎓",
        "What’s a fun fact or lesson you came across today? 🔥",
        "Did you try something new today? Share your experience! 🤩",
        "What’s one takeaway from today that made you smarter? 📚",
        "If today was a class, what would the lesson be? 🎯",
        "What’s a small win or progress you made today? 🏆",
        "Anything mind-blowing you learned today? 💥",
        "What’s a cool insight or idea you came across today? 💡",
        "If you could teach me one thing from today, what would it be? 🎤",
        "Looking back at today, what’s something valuable you learned? 🔎"
    ];

    // const saturdayMessages = [
    //     "I know even the government takes a break today, but not us! 😭 Keep grinding! 💪",
    //     "Ah, Saturday! The official ‘I'll do it tomorrow’ day. But hey, let’s do something today! 🚀",
    //     "It’s the weekend, but success doesn’t take naps… unfortunately. 😂 Let’s get to it! 🔥",
    //     "Weekend warriors unite! (Or at least try to move from the couch 😆) What’s the plan today?",
    //     "Saturday feels like a cheat day, but let’s sneak in some progress before Monday catches us! 😜"
    // ];
    
    // const sundayMessages = [
    //     "Sunday Funday? More like ‘preparing-for-Monday’ day. 😭 What’s one thing you’re wrapping up today?",
    //     "Even my alarm takes a break today, but here I am... checking in on you! 😅 What’s up?",
    //     "Sunday: The final boss before Monday. Let’s make it count! 🎮",
    //     "It’s Sunday! Time to reflect, relax, and realize we have work tomorrow. 😆 What’s your Sunday vibe?",
    //     "I was going to give you the day off… but then I remembered, we don’t do that here. 😂 What’s today’s win?"
    // ];
    
    const saturdayMessages = [
        "I know even the government takes a break today, but not us! 😭 Keep grinding! 💪",
        "Ah, Saturday! The official ‘I'll do it tomorrow’ day. But hey, let’s do something today! 🚀",
        "It’s the weekend, but success doesn’t take naps… unfortunately. 😂 Let’s get to it! 🔥",
        "Weekend warriors unite! (Or at least try to move from the couch 😆)",
        "Saturday feels like a cheat day, but let’s sneak in some progress before Monday catches us! 😜"
    ];
    
    const sundayMessages = [
        "Sunday Funday? More like ‘preparing-for-Monday’ day. 😭",
        "Even my alarm takes a break today, but here I am... checking in on you! 😅 What’s up?",
        "Sunday: The final boss before Monday. Let’s make it count! 🎮",
        "It’s Sunday! Time to reflect, relax, and realize we have work tomorrow. 😆 What’s your Sunday vibe?",
        "I was going to give you the day off… but then I remembered, we don’t do that here. 😂"
    ];
    const today = new Date().getDay();
    const isSaturday = today === 6;
    const isSunday = today === 0;

    for (const user of users) {
        // Pick a random question
        const firstQuestion = dailyQuestions[Math.floor(Math.random() * dailyQuestions.length)];

        // Send message
        bot.sendMessage(user.userId, firstQuestion);

        // Save question in the database
        await saveResponse({
            chatId: user.chatId,
            userId: user.userId,
            name: user.name,
            chatType: user.chatType,
            groupId: user.groupId,
            question: firstQuestion,
            answer: "",
        });
        if (isSaturday || isSunday) {
            const weekendMessage = isSaturday
                ? saturdayMessages[Math.floor(Math.random() * saturdayMessages.length)]
                : sundayMessages[Math.floor(Math.random() * sundayMessages.length)];

            bot.sendMessage(user.userId, weekendMessage);
        }
    }
};



// Schedule message every day at 8:00 PM (UTC)
cron.schedule(DAILY_CHECKIN_TIME, sendDailyCheckIn);

// Handle user responses
bot.on("message", async (msg) => {
    try {
        const chatId = msg.chat.id;
        const userId = msg.from?.id;
        const name = msg.from?.first_name || "Unknown";
        const chatType = msg.chat.type;
        const groupId = chatType === "group" ? chatId : undefined;
        const userResponse = msg.text?.trim();

        if (!userId || !userResponse) return;  // Ignore empty messages

        if (chatType === "group") return;  // Ignore group messages

        let user = await TeleUser.findOne({ userId });

        if (!user) {
            // New user setup
            user = await TeleUser.create({
                userId, chatId, name, chatType, groupId, dailyResponses: [],
            });

            bot.sendMessage(chatId, `Hey ${name}! 👋 Welcome aboard!`);

            setTimeout(() => {
                bot.sendMessage(chatId, "I’m here to help you track your daily learnings. 📚💡");
            }, 1000);

            setTimeout(() => {
                bot.sendMessage(chatId, "So, tell me... what did you learn today? 🤔");
            }, 2000);

            await saveResponse({ chatId, userId, name, chatType, groupId, question: "What did you learn today?", answer: "" });
            return;
        }


        // ✅ Handle "perf 10-3 to 20-4"
        const performanceRegex = /^perf\s+(\d{1,2})(?:-(\d{1,2}))?(?:\s+to\s+(\d{1,2})(?:-(\d{1,2}))?)?$/i;
        const match = userResponse.match(performanceRegex);

        if (match) {
            try {
                const currentDate = new Date();
                const year = currentDate.getFullYear();
                const appStartDate = new Date("2025-03-21"); // Application start date

                let startDay = match[1].padStart(2, "0");
                let startMonth = match[2] ? match[2].padStart(2, "0") : (currentDate.getMonth() + 1).toString().padStart(2, "0");

                let endDay = match[3]?.padStart(2, "0") || startDay;
                let endMonth = match[4] ? match[4].padStart(2, "0") : startMonth;

                const startDate = `${year}-${startMonth}-${startDay}`;
                let endDate = `${year}-${endMonth}-${endDay}`;

                let start = new Date(startDate);
                const end = new Date(endDate);

                if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                    bot.sendMessage(chatId, "⚠️ Invalid date format! Use `perf DD-MM to DD-MM` (Example: `perf 10-3 to 20-4`).");
                    return;
                }

                // Ensure that requests don't go before the application start date
                if (start < appStartDate) {
                    bot.sendMessage(chatId, `⚠️ Sorry, I can only fetch performance data from *${appStartDate.toISOString().split("T")[0]}* onwards.`);
                    return;
                }

                // Adjust start date if no range is given (last 7 days, but not before app start date)
                if (!match[3]) {
                    let tempStart = new Date(start);
                    tempStart.setDate(tempStart.getDate() - 6);

                    // Ensure we do not fetch before app start date
                    start = tempStart < appStartDate ? appStartDate : tempStart;
                }

                const formattedStart = start.toISOString().split("T")[0];
                const formattedEnd = end.toISOString().split("T")[0];

                bot.sendMessage(chatId, `⏳ Fetching performance from *${formattedStart}* to *${formattedEnd}*...`);

                const performanceResult = await evaluateUserPerformance(userId, formattedStart, formattedEnd);
                bot.sendMessage(chatId, performanceResult);
            } catch (err) {
                bot.sendMessage(chatId, "⚠️ Sorry, I couldn't fetch performance data right now. Please try again later.");
            }
            return;
        }


        const today = new Date().toISOString().split("T")[0];
        let dailyResponse = user.dailyResponses.find(d => d.date === today);

        if (!dailyResponse) {
            dailyResponse = { date: today, responses: [] };
            user.dailyResponses.push(dailyResponse);
        }

        // Fetch last conversation history
        let lastConversations: { question: string; answer: string }[] = [];
        const responses = dailyResponse.responses.filter(r => r.answer.trim() !== "");

        if (responses.length > 0) lastConversations.push(responses[responses.length - 1]);
        if (responses.length > 1) lastConversations.push(responses[responses.length - 2]);

        let context = lastConversations.map(conv => `Q: ${conv.question}\nA: ${conv.answer}`).join("\n\n");

        // ✅ Ensure response is always sent
        let botReply = "Hmm... I'm not sure what to say. Can you clarify? 🤔";

        try {
            botReply = await getAIResponse(userResponse, context);
        } catch (err) {
            // console.error("AI Response Error:", err);
            botReply = "🚧 Our AI system is currently experiencing issues. Please try again later!";
        }

        bot.sendMessage(chatId, botReply);

        // Save response
        await saveResponse({
            chatId,
            userId,
            name,
            chatType,
            groupId,
            question: userResponse,
            answer: botReply,
        });

    } catch (error) {
        bot.sendMessage(msg.chat.id, "⚠️ Oops! Something went wrong. Please try again later.");
    }
});


cron.schedule(MISSED_CHECKIN_TIME, async () => {  // Runs at 11:59 PM IST
    try {
        const today = new Date().toISOString().split("T")[0];

        const users = await TeleUser.find({ "dailyResponses.date": today });

        for (const user of users) {
            const dailyResponse = user.dailyResponses.find(d => d.date === today);

            if (dailyResponse) {
                const hasValidResponse = dailyResponse.responses.some(
                    r => r.question && r.answer && r.answer.trim() !== ""
                );

                if (!hasValidResponse) {
                    dailyResponse.responses.push({
                        question: "Missed",
                        answer: "No response",
                        timestamp: new Date()
                    });

                    if (user.chatId) {
                        bot.sendMessage(user.chatId, "You missed today's check-in! Make sure to answer tomorrow. ✅");
                    }

                    await user.save();
                }
            }
        }
    } catch (error: any) {
        // console.error("Error in missed check-in cron job:", error);
    }
});

export { bot };

