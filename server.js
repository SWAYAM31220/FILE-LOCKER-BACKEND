const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.get("/verify", async (req, res) => {
  const { uid, code } = req.query;

  if (!uid || !code) {
    return res.send("Invalid request");
  }

  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await supabase
    .from("users")
    .update({
      verified: true,
      expiry: expiry.toISOString()
    })
    .eq("user_id", uid);

  return res.redirect(
    `https://t.me/${process.env.BOT_USERNAME}?start=${code}`
  );
});

app.get("/", (req, res) => {
  res.send("Backend running");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
