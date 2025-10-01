import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";

const app = express();
app.use(cors());
app.use(express.json({ limit: "25mb" })); // large enough for base64 PDF

// ✅ Set your SMTP creds (example: Gmail with App Password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,        // you@gmail.com
    pass: process.env.SMTP_PASS,        // app password
  },
});

app.post("/api/send-form", async (req, res) => {
  try {
    const { to, filename, filedata_base64 } = req.body;
    if (!to || !filename || !filedata_base64) {
      return res.status(400).send("Missing fields");
    }

    const mail = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: "Cabinet Selection Form",
      text: "Attached is the filled form.",
      attachments: [
        {
          filename,
          content: Buffer.from(filedata_base64, "base64"),
          contentType: "application/pdf",
        },
      ],
    });

    res.status(200).send(`OK: ${mail.messageId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Email send failed");
  }
});

const PORT = process.env.PORT || 5174;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
