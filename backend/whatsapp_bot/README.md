# ResQCart WhatsApp Bot 🤖

A powerful WhatsApp chatbot for inventory management and food waste reduction with AI-powered features.

## 🌟 Features

### 1. AI-Powered Predictive Alerts 🤖
- **Real-time spoilage predictions** with AI analysis
- **WhatsApp notifications** for at-risk inventory
- **Early-warning trends** to prevent sales drops
- **Smart recommendations** for inventory actions

### 2. Dead Stock Marketplace 🏪
- **Define custom criteria** for dead stock (days, quantity, value)
- **Find buyers** and resell/transfer options
- **Simulate scenarios** before discounting or liquidating
- **Marketplace browser** to view available inventory from other sellers

### 3. Democratizing Data with NL2SQL 🗄️
- **Natural language queries** - ask in plain English
- **Auto-translates** to SQL queries instantly
- **Voice-enabled search** for hands-free operation
- **Database insights** without technical knowledge

### 4. Financial Command Center 💰
- **Live P&L dashboard** with real-time inventory financials
- **Storage costs** and cash flow impact analysis
- **Scenario planning** for different strategies
- **Predictive financial modeling** for better decisions

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Twilio account with WhatsApp sandbox
- Environment variables configured

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp whatsapp_bot/.env.example whatsapp_bot/.env
   # Edit .env with your Twilio credentials
   ```

3. **Setup Twilio webhook:**
   ```bash
   npm run bot:setup
   ```

4. **Start the bot:**
   ```bash
   npm run bot
   # For development with auto-reload:
   npm run bot:dev
   ```

### Environment Variables

Create a `.env` file in the `whatsapp_bot` directory:

```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
BOT_PORT=3001
AIML_SERVICE_URL=http://localhost:8000
```

## 📱 Usage

### Basic Commands

- **help** - Show all available commands
- **hello** - Welcome message with feature overview
- **contact** - Get support information

### AI Predictions
- **predict milk** - Get AI-powered spoilage prediction
- **info apple** - Storage tips and shelf life information

### Dead Stock Management
- **deadstock** - Access marketplace menu
- **deadstock define bread 30** - Set item as dead after 30 days
- **deadstock resell tomatoes** - Find buyers for slow-moving inventory
- **deadstock simulate cheese discount** - Test discount scenarios

### Smart Data Queries
- **Show me items unsold in 90 days** - Natural language database query
- **What are my top selling items** - Get insights in plain English
- **Items expiring in 7 days** - Monitor upcoming expirations

### Financial Insights
- **finance** - View live P&L dashboard
- **finance deadstock** - See dead stock financial impact
- **finance scenario bundle** - Compare bundling strategy outcomes

### Food Rescue
- **rescue** or **donate** - Find local food donation organizations

## 🛠️ Technical Details

### Architecture
- **Express.js** server with Twilio webhook integration
- **Modular command system** for easy feature expansion
- **Async/await** pattern for API integrations
- **Error handling** with graceful fallbacks

### File Structure
```
whatsapp_bot/
├── bot.js          # Main bot server and command routing
├── handlers.js     # Feature handlers and response logic  
├── setup.js        # Twilio configuration and setup
├── .env.example    # Environment variables template
└── README.md       # This documentation
```

### API Integrations
- **Twilio** for WhatsApp messaging
- **AI/ML services** for spoilage predictions (configurable)
- **Database queries** via NL2SQL translation
- **External APIs** for rescue organizations

## 🔧 Development

### Adding New Features

1. **Add command handler** in `handlers.js`
2. **Update command router** in `bot.js`
3. **Add help text** to menu system
4. **Test with WhatsApp** sandbox

### Testing

Use Twilio's WhatsApp sandbox for testing:
1. Send "join [sandbox-code]" to +14155238886
2. Use ngrok for local webhook: `ngrok http 3001`
3. Set webhook URL in Twilio console

### Deployment

For production deployment:
1. Use a cloud service (Heroku, AWS, etc.)
2. Set up proper domain with HTTPS
3. Configure Twilio webhook URL
4. Set environment variables in production

## 📊 Sample Interactions

```
User: predict milk
Bot: 🥛 MILK SPOILAGE ANALYSIS
     Status: FRESH
     Confidence: 90.5%
     [Analysis details...]

User: Show me items unsold in 90 days  
Bot: 🗄️ NL2SQL QUERY TRANSLATION
     Your Request: "Show me items unsold in 90 days"
     Generated SQL: SELECT * FROM inventory WHERE...
     [Query results...]

User: deadstock simulate bread discount
Bot: 📊 SCENARIO ANALYSIS: PRICE DISCOUNT STRATEGY
     Expected Recovery: 70% of original value
     Timeline: 2-3 weeks
     [Detailed analysis...]

User: finance
Bot: 💰 LIVE PROFIT & LOSS SUMMARY
     Revenue: $45,320
     Net Profit: $4,510 (9.9%)
     [Financial details...]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support or questions:
- Email: support@resqcart.com
- Phone: (555) RESQCART
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)

---

**Built with ❤️ for sustainable inventory management**
