require("dotenv").config();
const { Bot } = require("node-telegram-bot-api");
const { Pool } = require("pg");

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes("render.com")
    ? { rejectUnauthorized: false }
    : false,
});

// REPLACE THIS with your actual id number from:
// SELECT id, email FROM users;
const MY_USER_ID = 1;

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
        "INSERT INTO announcements (text, detected_keyword, user_id) VALUES ($1, $2, $3)",
        [text, matchedKeyword, MY_USER_ID]
      );
      console.log("Saved to database!");
    } catch (error) {
      console.error("Failed to save:", error.message);
    }
  }

  console.log("---");
});

bot.startPolling();