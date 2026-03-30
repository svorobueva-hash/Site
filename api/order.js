// /api/order.js
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { name, phone, address, email, note, total } = req.body;

    // Проверка данных
    if (!name || !phone || !email || !address || !total) {
      return res.status(400).json({ error: "Неполные данные" });
    }

    // Вставка в Supabase
    const { data, error } = await supabase.from("orders").insert([{
      customer_name: String(name || ""),
      email: String(email || ""),
      phone: String(phone || ""),
      address: String(address || ""),
      comment: String(note || ""),
      total: Number(total || 0),
      status: "new",
      created_at: new Date().toISOString()
    }]);

    if (error) {
      console.error("Ошибка Supabase:", error);
      return res.status(500).json({ error: "Ошибка Supabase" });
    }

    // Отправка письма
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.yandex.com",
        port: 465,
        secure: true,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: "Ваш заказ — оплата",
        html: `<h2>Спасибо за заказ, ${name}</h2><p>Сумма: ${total} ₽</p>`
      });
    } catch (mailErr) {
      console.error("Ошибка отправки письма:", mailErr);
      // Не прерываем заказ, если письмо не отправилось
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Ошибка API /order:", err);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
}
