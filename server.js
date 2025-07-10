const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ CORS Middleware (updated)
app.use(cors({
  origin: ['http://localhost:3000', 'https://www.inochiinternational.in', 'https://inochimain.vercel.app'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());

// ✅ Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.in',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  },
  debug: true
});

// Verify transporter connection
transporter.verify(function (error, success) {
  if (error) {
    console.log('Server connection error:', error);
  } else {
    console.log('Server is ready to send messages');
  }
});

// ✅ POST /api/send-email route
app.post('/api/send-email', async (req, res) => {
  const {
    from_name,
    from_email,
    company_name,
    phone_number,
    country,
    subject,
    message,
    inquiry_type
  } = req.body;

  try {
    await transporter.verify();

    const mailOptions = {
      from: `${from_name} <${process.env.EMAIL_USER}>`,
      to: 'vijayakumar@inochiinternational.in',
      replyTo: from_email,
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${from_name}</p>
        <p><strong>Company:</strong> ${company_name}</p>
        <p><strong>Email:</strong> ${from_email}</p>
        <p><strong>Phone:</strong> ${phone_number}</p>
        <p><strong>Country:</strong> ${country}</p>
        <p><strong>Inquiry Type:</strong> ${inquiry_type}</p>
        <h3>Message:</h3>
        <p>${message}</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    res.status(200).json({ message: 'Email sent successfully', info });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
});

// ✅ Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    console.log('Received chat message:', req.body);
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        reply: 'I apologize, but I did not receive your message. Please try again.' 
      });
    }

    // Convert message to lowercase for matching
    const lowerMessage = message.toLowerCase();

    // Define response patterns
    let reply = '';

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage === 'jjgg') {
      reply = 'Hello! How can I assist you with our spice products today?';
    }
    else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('rate')) {
      reply = 'For detailed pricing information of our spices, please email us at vijayakumar@inochiinternational.in or call us at +919535520948';
    }
    else if (lowerMessage.includes('product') || lowerMessage.includes('spice') || lowerMessage.includes('items')) {
      reply = 'We offer a wide range of premium spices including:\n- Black Pepper\n- Cardamom\n- Cinnamon\n- Cloves\n- Turmeric\nand many more. Which spice would you like to know more about?';
    }
    else if (lowerMessage.includes('contact') || lowerMessage.includes('reach') || lowerMessage.includes('call')) {
      reply = 'You can reach us through:\nEmail: vijayakumar@inochiinternational.in\nPhone: +919535520948\nWe typically respond within 24 hours.';
    }
    else if (lowerMessage.includes('location') || lowerMessage.includes('address') || lowerMessage.includes('where')) {
      reply = 'We are headquartered in India and serve customers globally. For our detailed address, please contact our team.';
    }
    else if (lowerMessage.includes('delivery') || lowerMessage.includes('shipping')) {
      reply = 'We offer worldwide shipping with various options:\n- Standard shipping\n- Express delivery\n- Bulk cargo shipping\nDelivery times vary by location. Please contact us for specific shipping details to your region.';
    }
    else if (lowerMessage.includes('quality') || lowerMessage.includes('standard') || lowerMessage.includes('certificate')) {
      reply = 'We maintain the highest quality standards with certifications including:\n- ISO Certification\n- FSSAI Registration\n- Export License\nAll our products undergo strict quality control measures.';
    }
    else {
      reply = 'Thank you for your message. For specific information about our spices or business inquiries, please contact our team at vijayakumar@inochiinternational.in or call +919535520948';
    }

    console.log('Sending reply:', reply);
    res.json({ reply });
  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({ 
      reply: 'I apologize, but I\'m having technical difficulties. Please try again later.' 
    });
  }
});

// ✅ Root route to prevent "Not Found" error
app.get('/', (req, res) => {
  res.send('Inochi Backend API is running 🚀');
});

// ✅ Start backend server on port 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
