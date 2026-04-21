import express from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.get("/", (req, res) => {
  res.send("Backend running");
});

app.get("/verify", async (req, res) => {
  const { uid, code } = req.query;

  if (!uid || !code) {
    return res.send("Invalid request");
  }

  const userId = parseInt(uid);

  if (isNaN(userId)) {
    return res.send("Invalid UID");
  }

  // 🔍 check code exists
  const { data: file } = await supabase
    .from("files")
    .select("*")
    .eq("code", code)
    .single();

  if (!file) {
    return res.send("Invalid code");
  }

  // ⏳ give 24hr access
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await supabase.from("users").upsert({
    user_id: userId,
    verified: true,
    expiry: expiry.toISOString(),
  });

  // ✅ redirect back to bot
  const botLink = `https://t.me/${process.env.BOT_USERNAME}?start=${code}`;

  return res.redirect(botLink);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Backend running");
});
