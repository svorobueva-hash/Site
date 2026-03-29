const express = require("express");
const cors = require("cors");
const QRCode = require("qrcode");
const nodemailer = require("nodemailer");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

app.post("/order", async (req, res) => {
  try {
    const { name, phone, address, email, note, cart } = req.body;
    const total = cart.reduce((sum, i) => sum + Number(i.price) * i.qty, 0);

    const paymentLink = `https://pay.example.com?amount=${total}`;
    const qrCode = await QRCode.toDataURL(paymentLink);

    const { error } = await supabase.from("orders").insert([
    { name, phone, address, email, note, cart, total }
    ]);
    if (error) throw error;

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Ваш заказ — оплата",
      html: `
        <h2>Спасибо за заказ, ${name}</h2>
        <p>Сумма: ${total} ₽</p>
        <img src="${qrCode}" />
      `
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка" });
  }
});

module.exports = app;