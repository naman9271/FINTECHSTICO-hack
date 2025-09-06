
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const dotenv = require('dotenv');
const {
  predictSpoilage,
  getFoodInfo,
  getRescueOptions,
  getHelpMenu,
  getWelcomeMessage,
  getDefaultResponse,
  getWhatsNewMessage
} = require('./handlers');

dotenv.config();

const app = express();
const PORT = process.env.BOT_PORT || 3001;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// --- Feature 2: Dead Stock Marketplace ---
// Enhanced dead stock management and discount/liquidation scenarios
function getDeadStockMarketplaceMenu() {
  return `🏪 *DEAD STOCK MARKETPLACE*
━━━━━━━━━━━━━━━━━━━━━━━━━━

Transform slow-moving inventory into profitable opportunities!

📋 *Available Actions:*
• *deadstock define [item] [criteria]* — Set custom dead stock rules
• *deadstock resell [item]* — Find buyers for slow inventory
• *deadstock simulate [item] [action]* — Test discount scenarios
• *deadstock marketplace* — Browse available inventory from other sellers

💡 *Smart Features:*
• AI-powered pricing recommendations
• Buyer matching based on location & needs
• Real-time market demand analysis
• Automated transfer coordination

━━━━━━━━━━━━━━━━━━━━━━━━━━
Type a command or *help* for more options.`;
}

function handleDeadStockDefine(item, criteria) {
  return `✅ *DEAD STOCK CRITERIA SET*
━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 *Item:* ${item || 'All inventory'}
📊 *Criteria:* ${criteria || 'Default: 90 days unsold'}

🔔 *Automated Alerts Enabled:*
• WhatsApp notifications when items meet criteria
• Weekly dead stock reports
• Price reduction suggestions
• Marketplace listing recommendations

Your inventory is now being monitored!`;
}

function handleDeadStockResell(item) {
  const buyers = [
    { name: 'Metro Food Corp', distance: '2.5 miles', rating: '4.8⭐', specialty: 'Bulk groceries' },
    { name: 'Community Kitchen Alliance', distance: '1.2 miles', rating: '4.9⭐', specialty: 'Fresh produce' },
    { name: 'Discount Food Outlet', distance: '0.8 miles', rating: '4.6⭐', specialty: 'Near-expiry items' }
  ];
  
  let response = `🔄 *RESELL OPTIONS FOR ${(item || 'INVENTORY').toUpperCase()}*
━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 *Nearby Buyers:*

`;
  
  buyers.forEach((buyer, index) => {
    response += `${index + 1}. *${buyer.name}*
   📍 ${buyer.distance} away
   ⭐ ${buyer.rating}
   🎯 Specializes in: ${buyer.specialty}
   
`;
  });
  
  response += `💰 *Estimated Value Recovery:* 60-85% of original price

📞 *Next Steps:*
• Contact buyers directly for quotes
• Schedule pickup/delivery
• Complete transfer documentation

Type *deadstock simulate* to see profit scenarios!`;
  
  return response;
}

function handleDeadStockSimulate(item, action) {
  const scenarios = {
    discount: {
      name: 'Discount Sale',
      recovery: '70%',
      timeframe: '2-3 weeks',
      pros: 'Quick cash flow, maintain customer base',
      cons: 'Lower margins, brand perception risk'
    },
    bundle: {
      name: 'Bundle with Popular Items',
      recovery: '85%',
      timeframe: '1-2 weeks',
      pros: 'Higher recovery, increase basket size',
      cons: 'Requires popular item inventory'
    },
    liquidate: {
      name: 'Wholesale Liquidation',
      recovery: '45%',
      timeframe: '3-5 days',
      pros: 'Immediate cash, zero storage costs',
      cons: 'Lowest recovery rate'
    }
  };
  
  const scenario = scenarios[action] || scenarios.discount;
  
  return `📊 *SCENARIO ANALYSIS: ${scenario.name.toUpperCase()}*
━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 *Item:* ${item || 'Sample inventory'}
💰 *Expected Recovery:* ${scenario.recovery} of original value
⏰ *Timeline:* ${scenario.timeframe}

✅ *Advantages:*
${scenario.pros}

⚠️ *Considerations:*
${scenario.cons}

📈 *Financial Impact:*
• Storage cost savings: $200/month
• Cash flow improvement: Immediate
• Tax benefits: Potential write-offs

Ready to proceed? Contact our marketplace team!`;
}

// --- Feature 3: Democratizing Data with NL2SQL ---
// Enhanced natural language to SQL query translation
async function handleNL2SQL(message) {
  const nlQueries = [
    {
      pattern: /show me items unsold in (\d+) days/,
      sql: (days) => `SELECT * FROM inventory WHERE sold = 0 AND DATEDIFF(day, last_sold_date, GETDATE()) >= ${days}`,
      description: (days) => `Items unsold for ${days}+ days`
    },
    {
      pattern: /what are my top selling items/,
      sql: () => `SELECT product_name, SUM(quantity_sold) as total_sold FROM sales GROUP BY product_name ORDER BY total_sold DESC LIMIT 10`,
      description: () => 'Top 10 best-selling products'
    },
    {
      pattern: /show me inventory worth more than (\d+)/,
      sql: (amount) => `SELECT * FROM inventory WHERE value > ${amount}`,
      description: (amount) => `Inventory items valued over $${amount}`
    },
    {
      pattern: /items expiring in (\d+) days/,
      sql: (days) => `SELECT * FROM inventory WHERE DATEDIFF(day, GETDATE(), expiry_date) <= ${days}`,
      description: (days) => `Items expiring within ${days} days`
    }
  ];
  
  const msg = message.toLowerCase();
  
  for (const query of nlQueries) {
    const match = msg.match(query.pattern);
    if (match) {
      const param = match[1];
      return `🗄️ *NL2SQL QUERY TRANSLATION*
━━━━━━━━━━━━━━━━━━━━━━━━━━

🎤 *Your Request:* "${message}"
📋 *Description:* ${query.description(param)}

💻 *Generated SQL:*
\`\`\`sql
${query.sql(param)}
\`\`\`

📊 *Results:* [Simulated data - would show actual inventory]

🎙️ *Voice Search:* Say your query aloud for hands-free operation!
🔄 *Try more queries:* "What are my top selling items" or "Items expiring in 7 days"`;
    }
  }
  
  return `❓ *NL2SQL QUERY ASSISTANT*
━━━━━━━━━━━━━━━━━━━━━━━━━━

Ask me about your inventory in plain English!

💡 *Example Queries:*
• "Show me items unsold in 90 days"
• "What are my top selling items"
• "Show me inventory worth more than 1000"
• "Items expiring in 7 days"

🎙️ *Voice-Enabled:* Speak your questions for faster results
🔄 *Auto-Translation:* Your words become SQL instantly`;
}

// --- Feature 4: Financial Command Center ---
// Enhanced financial insights and scenario analysis
function getFinancialCommandCenterMenu() {
  return `💰 *FINANCIAL COMMAND CENTER*
━━━━━━━━━━━━━━━━━━━━━━━━━━

Real-time financial insights for smarter inventory decisions!

📊 *Live Dashboard:*
• *finance view* — Current P&L summary
• *finance deadstock* — Dead stock financial impact
• *finance flow* — Cash flow analysis
• *finance forecast* — Predictive financial modeling

🎯 *Scenario Planning:*
• *finance scenario discount* — Impact of price reductions
• *finance scenario bundle* — Bundling strategy outcomes
• *finance scenario liquidate* — Liquidation financial analysis

📈 *Advanced Analytics:*
• Storage cost per item tracking
• Profit margin optimization
• ROI calculation for different strategies

━━━━━━━━━━━━━━━━━━━━━━━━━━
Transform data into profitable decisions!`;
}

function getFinancialPLView() {
  return `💰 *LIVE PROFIT & LOSS SUMMARY*
━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 *Current Month Performance:*

💵 *Revenue:* $45,320
💸 *Cost of Goods:* $28,650
📦 *Storage Costs:* $3,240
🏢 *Operating Expenses:* $8,920

✅ *Gross Profit:* $16,670 (36.8%)
🎯 *Net Profit:* $4,510 (9.9%)

⚠️ *Dead Stock Impact:*
• Tied-up Capital: $12,400
• Storage Waste: $890/month
• Opportunity Cost: $2,200

📈 *Recommendations:*
• Focus on high-margin items
• Liquidate items unsold >60 days
• Optimize storage allocation

Type *finance deadstock* for detailed dead stock analysis!`;
}

function getFinancialScenarioAnalysis(scenario) {
  const scenarios = {
    discount: {
      name: 'Price Discount Strategy',
      impact: 'Revenue: -15% | Volume: +40% | Profit: +8%',
      recommendation: 'Recommended for fast-moving items'
    },
    bundle: {
      name: 'Product Bundling Strategy', 
      impact: 'Revenue: +12% | Volume: +25% | Profit: +18%',
      recommendation: 'Highly recommended - best ROI'
    },
    liquidate: {
      name: 'Liquidation Strategy',
      impact: 'Revenue: -60% | Cash Flow: +immediate | Storage: -100%',
      recommendation: 'Use for items >90 days old'
    }
  };
  
  const analysis = scenarios[scenario] || scenarios.discount;
  
  return `📊 *SCENARIO ANALYSIS: ${analysis.name.toUpperCase()}*
━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 *Projected Impact:*
${analysis.impact}

💡 *Strategic Insight:*
${analysis.recommendation}

🎯 *Implementation Timeline:*
• Week 1: Strategy setup & communication
• Week 2-3: Monitor performance metrics  
• Week 4: Evaluate and optimize

📊 *Risk Assessment:*
• Low Risk: Bundling strategy
• Medium Risk: Discount strategy
• High Risk: Liquidation (but fast cash)

Ready to implement? Contact our strategy team!`;
}

// Centralized async command router
async function handleCommand(incomingMessage, fromNumber, location) {
  try {
    const msg = incomingMessage.trim().toLowerCase();
    
    // Basic commands
    if (msg === 'help' || msg === 'menu' || msg === '/help' || msg === '/menu') {
      return getHelpMenu();
    } else if (msg.startsWith('predict') || msg.includes('spoilage')) {
      return await predictSpoilage(incomingMessage);
    } else if (msg.startsWith('info') || msg.includes('food')) {
      return await getFoodInfo(incomingMessage);
    } else if (msg.startsWith('rescue') || msg.startsWith('donate')) {
      return await getRescueOptions(incomingMessage, location);
    } else if (msg === 'hello' || msg === 'hi' || msg === '/hello' || msg === '/hi') {
      return getWelcomeMessage();
    } else if (msg.startsWith('contact')) {
      return '📞 *Contact Support*\n━━━━━━━━━━━━━━━━━━━━━━━━━━\nFor support or feedback, email us at support@resqcart.com or call (555) RESQCART.';
    } else if (msg.startsWith("what's new") || msg.startsWith('whats new')) {
      return getWhatsNewMessage();
    }
    
    // Feature 2: Enhanced Dead Stock Marketplace
    else if (msg.startsWith('deadstock')) {
      const parts = msg.split(' ');
      if (msg.includes('define')) {
        const item = parts[2] || null;
        const criteria = parts.slice(3).join(' ') || null;
        return handleDeadStockDefine(item, criteria);
      } else if (msg.includes('resell')) {
        const item = parts[2] || null;
        return handleDeadStockResell(item);
      } else if (msg.includes('simulate')) {
        const item = parts[2] || null;
        const action = parts[3] || 'discount';
        return handleDeadStockSimulate(item, action);
      } else if (msg.includes('marketplace')) {
        return '🏪 *MARKETPLACE BROWSER*\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nBrowse available inventory from other sellers:\n• Fresh produce from Metro Farm\n• Packaged goods from City Wholesale\n• Beverages from Regional Distributors\n\nType *deadstock resell* to list your items!';
      } else {
        return getDeadStockMarketplaceMenu();
      }
    }
    
    // Feature 3: Enhanced NL2SQL
    else if (/show me items unsold in \d+ days/.test(msg) || 
             /what are my top selling items/.test(msg) ||
             /show me inventory worth more than \d+/.test(msg) ||
             /items expiring in \d+ days/.test(msg) ||
             msg.startsWith('nl2sql')) {
      return await handleNL2SQL(msg);
    }
    
    // Feature 4: Enhanced Financial Command Center  
    else if (msg.startsWith('finance')) {
      if (msg.includes('view') || msg === 'finance') {
        return getFinancialPLView();
      } else if (msg.includes('deadstock')) {
        return '� *DEAD STOCK FINANCIAL IMPACT*\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n💰 Capital Tied Up: $12,400\n📦 Storage Costs: $890/month\n⏰ Opportunity Cost: $2,200\n📉 Total Impact: -$15,490\n\nRecommendation: Liquidate items >90 days old';
      } else if (msg.includes('flow')) {
        return '💰 *CASH FLOW ANALYSIS*\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n📈 Inflow: $45,320/month\n📉 Outflow: $40,810/month\n✅ Net Flow: +$4,510/month\n⚠️ Dead Stock Impact: -$890/month\n\nOptimization potential: +$2,200/month';
      } else if (msg.includes('forecast')) {
        return '🔮 *FINANCIAL FORECAST*\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n📊 3-Month Projection:\n• Revenue: $142,000 (+5%)\n• Profit: $14,200 (+12%)\n• Dead Stock Reduction: -40%\n\nKey drivers: Improved inventory turnover';
      } else if (msg.includes('scenario')) {
        const scenarioType = msg.includes('discount') ? 'discount' : 
                           msg.includes('bundle') ? 'bundle' : 
                           msg.includes('liquidate') ? 'liquidate' : 'discount';
        return getFinancialScenarioAnalysis(scenarioType);
      } else {
        return getFinancialCommandCenterMenu();
      }
    }
    
    else {
      return getDefaultResponse();
    }
  } catch (err) {
    console.error('Command handler error:', err.message);
    return '❌ Sorry, something went wrong. Please try again later.';
  }
}

// WhatsApp webhook endpoint
app.post('/webhook', async (req, res) => {
  console.log('📱 WhatsApp message received:', req.body);

  const incomingMessage = req.body.Body ? req.body.Body.toLowerCase() : '';
  const fromNumber = req.body.From;
  // In future: parse location from message or user profile
  const location = undefined;

  console.log(`📨 From: ${fromNumber}`);
  console.log(`💬 Message: ${incomingMessage}`);

  const twiml = new twilio.twiml.MessagingResponse();
  let response = '';

  response = await handleCommand(incomingMessage, fromNumber, location);

  twiml.message(response);

  console.log(`📤 Sending response: ${response}`);
  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Bot is running!', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🤖 WhatsApp Bot running on port ${PORT}`);
  console.log(`📡 Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log('\n🌟 RESQCART FEATURES AVAILABLE:');
  console.log('\n📦 AI-Powered Predictions:');
  console.log('  - "predict [food item]" - Get AI spoilage predictions with alerts');
  console.log('  - "info [food item]" - Storage and shelf life information');
  
  console.log('\n🏪 Dead Stock Marketplace:');
  console.log('  - "deadstock" - Access marketplace menu');
  console.log('  - "deadstock define [item] [criteria]" - Set dead stock rules');
  console.log('  - "deadstock resell [item]" - Find buyers for inventory');
  console.log('  - "deadstock simulate [item] [action]" - Test scenarios');
  
  console.log('\n🗄️ NL2SQL Data Queries:');
  console.log('  - "Show me items unsold in 90 days" - Natural language queries');
  console.log('  - "What are my top selling items" - Database insights');
  console.log('  - "Items expiring in 7 days" - Expiry monitoring');
  
  console.log('\n💰 Financial Command Center:');
  console.log('  - "finance" - Live P&L dashboard');
  console.log('  - "finance scenario [action]" - Compare strategies');
  console.log('  - "finance deadstock" - Dead stock financial impact');
  
  console.log('\n🤝 Food Rescue & General:');
  console.log('  - "rescue" or "donate" - Find donation organizations');
  console.log('  - "hello" - Welcome message');
  console.log('  - "help" - Full command menu');
  
  console.log('\n🚀 Ready to transform inventory management!');
});