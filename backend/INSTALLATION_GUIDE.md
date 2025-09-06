# 🚀 Installation Guide for ResQCart WhatsApp Bot

## Prerequisites Installation

### 1. Install Node.js

**Download and install Node.js (required):**
1. Go to https://nodejs.org/
2. Download the LTS version (recommended)
3. Run the installer and follow the setup wizard
4. Restart your command prompt/PowerShell after installation

**Verify installation:**
```bash
node --version
npm --version
```

### 2. Install Dependencies

**Navigate to the backend directory:**
```bash
cd "d:\Hackathon Nsut\FINTECHSTICO-hack-1\backend"
```

**Install all required packages:**
```bash
npm install
```

This will install:
- `twilio` - WhatsApp integration
- `body-parser` - Request parsing
- `express` - Web server
- `axios` - HTTP requests
- `dotenv` - Environment variables
- All other existing dependencies

### 3. Set Up Twilio Account

**Create a Twilio account:**
1. Go to https://www.twilio.com/
2. Sign up for a free account
3. Go to Console Dashboard
4. Find your Account SID and Auth Token

**Set up WhatsApp Sandbox:**
1. Navigate to Messaging > Try it out > Send a WhatsApp message
2. Follow the instructions to join the sandbox
3. Note your sandbox phone number (+14155238886)
4. Note your unique sandbox code

### 4. Configure Environment Variables

**Create environment file:**
```bash
cd whatsapp_bot
copy .env.example .env
```

**Edit .env file with your credentials:**
```env
TWILIO_ACCOUNT_SID=your_account_sid_from_twilio_console
TWILIO_AUTH_TOKEN=your_auth_token_from_twilio_console
BOT_PORT=3001
AIML_SERVICE_URL=http://localhost:8000
```

### 5. Test Twilio Configuration

**Run the setup script:**
```bash
npm run bot:setup
```

This will verify your Twilio connection and show next steps.

### 6. Start the WhatsApp Bot

**Start the bot server:**
```bash
npm run bot
```

**For development with auto-reload:**
```bash
npm run bot:dev
```

You should see output like:
```
🤖 WhatsApp Bot running on port 3001
📡 Webhook URL: http://localhost:3001/webhook
🏥 Health check: http://localhost:3001/health

🌟 RESQCART FEATURES AVAILABLE:
📦 AI-Powered Predictions
🏪 Dead Stock Marketplace  
🗄️ NL2SQL Data Queries
💰 Financial Command Center
🚀 Ready to transform inventory management!
```

### 7. Set Up Webhook (for testing)

**For local testing, use ngrok:**
1. Download ngrok from https://ngrok.com/
2. Install and authenticate ngrok
3. Run: `ngrok http 3001`
4. Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
5. In Twilio Console, set webhook URL to: `https://abc123.ngrok.io/webhook`

**For production:**
- Deploy to a cloud service (Heroku, AWS, etc.)
- Use the production domain for webhook URL

### 8. Test Your Bot

**Send a WhatsApp message to your sandbox number:**
1. Text: "hello" - Get welcome message
2. Text: "help" - See all available commands
3. Text: "predict milk" - Test AI predictions
4. Text: "deadstock" - Access marketplace features
5. Text: "Show me items unsold in 90 days" - Test NL2SQL
6. Text: "finance" - View financial dashboard

## 🔧 Troubleshooting

### Common Issues:

**"npm not found" error:**
- Restart your terminal after installing Node.js
- Make sure Node.js installation completed successfully

**Twilio authentication error:**
- Double-check Account SID and Auth Token in .env file
- Ensure no extra spaces in environment variables

**Webhook not receiving messages:**
- Verify ngrok is running and URL is set in Twilio
- Check that bot server is running on correct port
- Ensure webhook URL ends with /webhook

**"Cannot find module" errors:**
- Run `npm install` in the backend directory
- Delete node_modules folder and run `npm install` again

### Getting Help:

1. Check the logs in your terminal for error messages
2. Verify your .env file has correct credentials
3. Test the health endpoint: http://localhost:3001/health
4. Check Twilio Console for webhook delivery logs

## 🎉 Success!

Once everything is set up, you'll have a fully functional WhatsApp bot with all four features:

1. **AI-Powered Predictive Alerts** - Smart spoilage predictions
2. **Dead Stock Marketplace** - Turn inventory into profits  
3. **NL2SQL Data Queries** - Ask questions in plain English
4. **Financial Command Center** - Real-time financial insights

Start chatting with your bot and explore all the features! 🚀
