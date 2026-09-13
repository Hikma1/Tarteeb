require("dotenv").config();
const { Bot } = require("node-telegram-bot-api");
const { Pool } = require("pg");

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "mern_practice",
  password: "postgres",
  port: 5432,
});

const keywords = ["exam", "assignment", "deadline", "quiz", "submission", "due", "project"];

function findMatchedKeyword(text) {
  const lowerText = text.toLowerCase();
  return keywords.find((keyword) => lowerText.includes(keyword)) || null;
}

console.log("Bot is running and listening for messages...");

bot.on("message", async (ctx) => {
  const text = ctx.message.text || "";
  const matchedKeyword = findMatchedKeyword(text);

  console.log("New message received:");
  console.log("Text:", text);
  console.log("Detected as announcement:", !!matchedKeyword);

  if (matchedKeyword) {
    try {
      await pool.query(
        "INSERT INTO announcements (text, detected_keyword) VALUES ($1, $2)",
        [text, matchedKeyword]
      );
      console.log("Saved to database!");
    } catch (error) {
      console.error("Failed to save:", error.message);
    }
  }

  console.log("---");
});

bot.startPolling();