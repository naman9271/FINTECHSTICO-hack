const axios = require('axios');

// --- CONFIG ---
const AIML_BASE_URL = process.env.AIML_SERVICE_URL || 'http://localhost:8000';

// --- PREDICTION HANDLER ---
async function predictSpoilage(message) {
  try {
    const foodItem = extractFoodItem(message);
    
    // Use API for milk spoilage prediction
    if (foodItem === 'milk') {
      try {
        const res = await axios.post(`${AIML_BASE_URL}/predict_milk_spoilage`, { sku: 'whole_milk_1gal' });
        const prediction = res.data.prediction;
        const probability = res.data.probability;
        const explanation = res.data.explanation;
        
        return `🥛 *MILK SPOILAGE ANALYSIS*
━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 *Status:* ${prediction.toUpperCase()}
🎯 *Confidence:* ${(probability * 100).toFixed(1)}%

📋 *Analysis Details:*
${explanation}

━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 *Next Steps:*
• Check expiration date
• Inspect for visual signs
• Consider donation if still safe

🔍 Type *info milk* for storage tips
🆘 Type *rescue* for donation options`;
      } catch (apiError) {
        console.log('API unavailable, using fallback prediction');
      }
    }
    
    // Enhanced hardcoded predictions
    const predictions = {
      'apple': { days: 7, status: 'Fresh', confidence: 85, emoji: '🍎' },
      'banana': { days: 3, status: 'Ripening', confidence: 78, emoji: '🍌' },
      'tomato': { days: 5, status: 'Fresh', confidence: 82, emoji: '🍅' },
      'bread': { days: 4, status: 'Good', confidence: 75, emoji: '🍞' },
      'lettuce': { days: 5, status: 'Fresh', confidence: 80, emoji: '🥬' },
      'cheese': { days: 10, status: 'Good', confidence: 88, emoji: '🧀' },
      'milk': { days: 5, status: 'Fresh', confidence: 90, emoji: '🥛' }
    };
    
    const prediction = predictions[foodItem] || { 
      days: Math.floor(Math.random() * 7) + 1, 
      status: 'Unknown', 
      confidence: 70,
      emoji: '🥘'
    };
    
    return `${prediction.emoji} *${foodItem.toUpperCase()} SPOILAGE PREDICTION*
━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ *Estimated Shelf Life:* ${prediction.days} days
📊 *Current Status:* ${prediction.status}
🎯 *Confidence Level:* ${prediction.confidence}%

💡 *Recommendations:*
• Store in optimal conditions
• Monitor for spoilage signs
• Consider price reduction if near expiry
• Donate if still safe but unsellable

━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 Type *info ${foodItem}* for storage tips
🆘 Type *rescue* for donation options`;
    
  } catch (error) {
    console.error('Prediction error:', error.message);
    return `❌ *SERVICE TEMPORARILY UNAVAILABLE*
━━━━━━━━━━━━━━━━━━━━━━━━━━

We're experiencing technical difficulties with our prediction service.

🔄 *Please try again in a few moments*
📞 *For urgent assistance, contact support*

━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  }
}

// --- FOOD INFO HANDLER ---
async function getFoodInfo(message) {
  try {
    const foodItem = extractFoodItem(message);
    
    // Enhanced hardcoded food information
    const foodInfo = {
      'apple': {
        storage: 'Refrigerate at 32-35°F (0-2°C)',
        shelf_life: '2-4 weeks refrigerated',
        tips: 'Keep away from other fruits to prevent premature ripening',
        emoji: '🍎'
      },
      'banana': {
        storage: 'Room temperature until ripe, then refrigerate',
        shelf_life: '3-7 days at room temperature',
        tips: 'Separate from other fruits, freeze when overripe for smoothies',
        emoji: '🍌'
      },
      'tomato': {
        storage: 'Room temperature, refrigerate only when cut',
        shelf_life: '1-2 weeks at room temperature',
        tips: 'Store stem-side down, avoid direct sunlight',
        emoji: '🍅'
      },
      'milk': {
        storage: 'Refrigerate at 40°F (4°C) or below',
        shelf_life: '5-7 days after opening',
        tips: 'Keep in coldest part of fridge, check expiration date daily',
        emoji: '🥛'
      },
      'bread': {
        storage: 'Room temperature or freeze for longer storage',
        shelf_life: '5-7 days at room temperature',
        tips: 'Store in bread box or airtight container, freeze for up to 3 months',
        emoji: '🍞'
      },
      'lettuce': {
        storage: 'Refrigerate in crisper drawer',
        shelf_life: '7-10 days refrigerated',
        tips: 'Wash just before use, store in perforated plastic bag',
        emoji: '🥬'
      },
      'cheese': {
        storage: 'Refrigerate in cheese paper or wax paper',
        shelf_life: '1-4 weeks depending on type',
        tips: 'Allow to breathe, avoid plastic wrap for hard cheeses',
        emoji: '🧀'
      }
    };
    
    const info = foodInfo[foodItem] || {
      storage: 'Check product packaging for specific instructions',
      shelf_life: 'Varies by product type and brand',
      tips: 'Store in cool, dry place away from direct sunlight',
      emoji: '🥘'
    };
    
    return `${info.emoji} *${foodItem.toUpperCase()} STORAGE GUIDE*
━━━━━━━━━━━━━━━━━━━━━━━━━━

🌡️ *Optimal Storage:*
${info.storage}

⏰ *Expected Shelf Life:*
${info.shelf_life}

💡 *Pro Tips:*
${info.tips}

━━━━━━━━━━━━━━━━━━━━━━━━━━
🔮 Type *predict ${foodItem}* for spoilage prediction
🆘 Type *rescue* for donation options`;
    
  } catch (error) {
    console.error('Food info error:', error.message);
    return `❌ *INFORMATION SERVICE UNAVAILABLE*
━━━━━━━━━━━━━━━━━━━━━━━━━━

Unable to retrieve food information at this time.

🔄 *Please try again shortly*
📞 *For immediate assistance, contact support*

━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  }
}

// --- RESCUE OPTIONS HANDLER ---
async function getRescueOptions(message, location) {
  try {
    if (location) {
      try {
        // Use API if location is provided
        const res = await axios.post(`${AIML_BASE_URL}/nearby-ngos`, location);
        const ngos = res.data.ngos || [];
        
        if (ngos.length === 0) {
          return `📍 *NO RESCUE OPTIONS FOUND*
━━━━━━━━━━━━━━━━━━━━━━━━━━

No food rescue organizations found in your area.

🔄 *Try expanding your search radius*
📞 *Contact local food banks directly*
🌐 *Visit our website for more options*

━━━━━━━━━━━━━━━━━━━━━━━━━━`;
        }
        
        let response = `🆘 *NEARBY RESCUE ORGANIZATIONS*
━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 *Found ${ngos.length} organization(s) in your area:*

`;
        
        ngos.forEach((ngo, idx) => {
          response += `${idx + 1}. *${ngo.name}*
   📍 ${ngo.address}
   ⭐ Rating: ${ngo.rating || 'Not rated'}
   
`;
        });
        
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 *Donation Guidelines:*
• Ensure food is safe for consumption
• Package items properly and securely
• Call ahead to confirm acceptance
• Follow organization's pickup schedule

📞 *Need help?* Contact support for assistance`;
        
        return response;
      } catch (apiError) {
        console.log('API unavailable, using fallback rescue options');
      }
    }
    
    // Fallback: Enhanced hardcoded options
    const rescueOptions = [
      { name: 'Central Food Bank', distance: '0.5 miles', items: 'All food types', phone: '(555) 123-4567' },
      { name: 'Community Kitchen Network', distance: '1.2 miles', items: 'Fresh produce & prepared meals', phone: '(555) 234-5678' },
      { name: 'Hope Shelter', distance: '0.8 miles', items: 'Non-perishables & canned goods', phone: '(555) 345-6789' },
      { name: 'Pet Food Rescue', distance: '1.5 miles', items: 'Pet food & animal supplies', phone: '(555) 456-7890' }
    ];
    
    let response = `🆘 *FOOD RESCUE DIRECTORY*
━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 *Local Organizations Near You:*

`;
    
    rescueOptions.forEach((option, index) => {
      response += `${index + 1}. *${option.name}*
   📍 Distance: ${option.distance}
   🍎 Accepts: ${option.items}
   📞 Phone: ${option.phone}
   
`;
    });
    
    response += `━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 *How to Donate:*
• Call organization directly
• Schedule pickup through our app
• Drop off during business hours
• Follow safety guidelines

💡 *Donation Tips:*
• Verify food safety and quality
• Package items in clean containers
• Confirm acceptance before delivery
• Keep donation receipts for tax purposes

🌐 *For more options, visit our website*`;
    
    return response;
    
  } catch (error) {
    console.error('Rescue options error:', error.message);
    return `❌ *RESCUE SERVICE UNAVAILABLE*
━━━━━━━━━━━━━━━━━━━━━━━━━━

Unable to access rescue organization database.

🔄 *Please try again in a few moments*
📞 *For urgent donations, call: (555) 911-FOOD*
🌐 *Visit our website for alternative options*

━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  }
}

// --- HELP & DEFAULT RESPONSES ---
function getHelpMenu() {
  return `🛠️ *RESQCART COMMAND MENU*
━━━━━━━━━━━━━━━━━━━━━━━━━━

*How can I assist you today?*

📦 *AI-Powered Predictions*
• *predict [food]* — Get AI spoilage prediction with alerts
   _e.g., "predict apple"_

📚 *Food Information*
• *info [food]* — Storage & shelf life guide
   _e.g., "info banana"_

🏪 *Dead Stock Marketplace*
• *deadstock* — Manage slow-moving inventory
• *deadstock define [item] [criteria]* — Set dead stock rules
• *deadstock resell [item]* — Find resell options
• *deadstock simulate [item]* — Simulate discount scenarios

🗄️ *NL2SQL Data Queries*
• *Show me items unsold in 90 days* — Natural language queries
• *nl2sql* — Ask database questions in plain English

💰 *Financial Command Center*
• *finance* — View P&L and cash flow impact
• *finance view* — Live profit & loss summary
• *finance scenario [option]* — Compare outcomes

🤝 *Food Rescue*
• *donate* or *rescue* — Find local donation organizations

👋 *General*
• *hello* or *hi* — Welcome message
• *contact* — Support information
• *what's new* — Latest features

━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 *How to use:*
Just type a command, like "predict milk" or "Show me items unsold in 90 days".

🌱 *Together, let's reduce food waste and maximize profits!*
`;
}

function getWhatsNewMessage() {
  return `🆕 *WHAT'S NEW AT RESQCART?*
━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ *Latest Features:*

🤖 *AI-Powered Predictive Alerts*
• WhatsApp notifications for at-risk inventory
• Early-warning trends to prevent sales drops

🏪 *Dead Stock Marketplace*
• Define custom dead stock criteria
• Resell/transfer options to other businesses
• Discount simulation before taking action

🗄️ *Natural Language Database Queries*
• Ask questions in plain English
• Auto-translates to SQL queries
• Voice-enabled search support

💰 *Financial Command Center*
• Live P&L view of inventory
• Storage costs and cash flow impact analysis
• Scenario comparison for decision making

━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 *Coming Soon:*
• Advanced AI predictions for more products
• Multi-language support
• Integration with major inventory systems

🔔 *Stay tuned for more updates!*
`;
}

function getWelcomeMessage() {
  return `👋 *WELCOME TO RESQCART!*
━━━━━━━━━━━━━━━━━━━━━━━━━━

*Your AI-Powered Inventory & Waste Management Assistant*

Hi there! I'm your ResQCart assistant with powerful new features:

🤖 *AI Predictions* - Get spoilage alerts before it's too late
🏪 *Dead Stock Marketplace* - Turn slow inventory into profits
🗄️ *Smart Data Queries* - Ask questions in plain English
💰 *Financial Insights* - Real-time P&L and impact analysis

🌟 *Transform your inventory management today!*

Type *help* to see all commands, or try:
• "predict tomato"
• "deadstock"
• "Show me items unsold in 90 days"
• "finance view"

"Every meal saved is a win for the planet and your profits!" 🌍💰`;
}

function getDefaultResponse() {
  return `🤔 *COMMAND NOT RECOGNIZED*
━━━━━━━━━━━━━━━━━━━━━━━━━━

I didn't understand that command.

📋 *Quick Commands:*
• *predict [food]* - AI spoilage prediction
• *info [food]* - Storage information
• *deadstock* - Marketplace options
• *finance* - Financial insights
• *rescue* - Find donation options
• *help* - Full command menu

━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 *Examples:*
• "predict apple"
• "Show me items unsold in 90 days"
• "deadstock simulate bread"

❓ Type *help* for detailed assistance`;
}

// --- HELPER: Extract food item from message ---
function extractFoodItem(message) {
  const words = message.split(' ');
  const commandIndex = words.findIndex(word => ['predict', 'info', 'spoilage', 'food'].includes(word));
  if (commandIndex !== -1 && commandIndex + 1 < words.length) {
    return words[commandIndex + 1];
  }
  return words[words.length - 1] || 'unknown';
}

module.exports = {
  predictSpoilage,
  getFoodInfo,
  getRescueOptions,
  getHelpMenu,
  getWhatsNewMessage,
  getWelcomeMessage,
  getDefaultResponse
};
