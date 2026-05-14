import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Try to import Groq SDK
let groq = null;
try {
  const Groq = (await import('groq-sdk')).default;
  if (GROQ_API_KEY) {
    groq = new Groq({ apiKey: GROQ_API_KEY });
    console.log('✅ Groq AI initialized successfully');
  }
} catch (error) {
  console.log('⚠️ Groq SDK not available, using fallback');
}

// Generate smart fallback advice based on data
const generateFallbackAdvice = (familyData, goals) => {
  const wealth = familyData?.totalWealth || 0;
  const income = familyData?.monthlyIncome || 0;
  const memberCount = familyData?.members?.length || 1;

  let advice = `## 🎯 Personalized Financial Advice for Your Family\n\n`;

  // Investment Strategy
  advice += `### 1. Investment Strategy\n`;
  if (wealth < 500000) {
    advice += `• Start with **SIP of ₹5,000-10,000/month** in index funds\n`;
    advice += `• Build emergency fund of **6 months expenses** first\n`;
    advice += `• Consider **PPF** for tax-free long-term returns\n\n`;
  } else if (wealth < 2500000) {
    advice += `• Diversify with **60% equity, 30% debt, 10% gold**\n`;
    advice += `• Increase SIP to **₹15,000-25,000/month**\n`;
    advice += `• Explore **ELSS funds** for tax savings + growth\n\n`;
  } else {
    advice += `• Consider **portfolio rebalancing** quarterly\n`;
    advice += `• Add **international funds** (10-15% allocation)\n`;
    advice += `• Look into **REITs** for real estate exposure\n\n`;
  }

  // Goal Progress
  advice += `### 2. Goal Achievement Tips\n`;
  if (goals && goals.length > 0) {
    goals.forEach(goal => {
      const progress = goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0;
      const remaining = goal.target - goal.current;
      advice += `• **${goal.name}**: ${progress}% complete. `;
      if (progress < 25) {
        advice += `Increase monthly contribution by 20%\n`;
      } else if (progress < 75) {
        advice += `On track! Maintain consistency\n`;
      } else {
        advice += `Almost there! 🎉 Consider increasing target\n`;
      }
    });
  } else {
    advice += `• Set 3-5 **SMART financial goals** (Specific, Measurable, Achievable, Relevant, Time-bound)\n`;
  }

  // Tax Savings
  advice += `\n### 3. Tax Saving Opportunities\n`;
  advice += `• **Section 80C**: Invest ₹1.5L in ELSS/PPF/NPS\n`;
  advice += `• **Section 80D**: Health insurance premium (₹25K-50K)\n`;
  advice += `• **NPS**: Additional ₹50K deduction under 80CCD(1B)\n\n`;

  // Risk Management
  advice += `### 4. Protection & Safety Net\n`;
  advice += `• Life insurance cover: **10-15x annual income**\n`;
  advice += `• Health insurance: **₹10-20L family floater**\n`;
  advice += `• Emergency fund: **₹${(income * 6).toLocaleString()}** (6 months expenses)\n`;

  return advice;
};

// AI Financial Advice endpoint
router.post('/financial-advice', async (req, res) => {
  try {
    const { familyData, goals, currentInvestments } = req.body;

    console.log('📨 Received AI request:', {
      wealth: familyData?.totalWealth,
      income: familyData?.monthlyIncome,
      members: familyData?.members?.length,
      goals: goals?.length
    });

    // Try Groq API first
    if (groq && GROQ_API_KEY) {
      try {
        const prompt = `
You are a financial advisor for Indian families. Provide practical, actionable advice.

FAMILY FINANCIAL SNAPSHOT:
- Total Family Wealth: ₹${familyData?.totalWealth?.toLocaleString() || '0'}
- Monthly Family Income: ₹${familyData?.monthlyIncome?.toLocaleString() || '0'} 
- Family Size: ${familyData?.members?.length || 1} members
- Financial Goals: ${goals?.length || 0} active goals
- Current Investments: ${currentInvestments || "Starting fresh"}

FINANCIAL GOALS:
${goals?.map((goal, index) => `${index + 1}. ${goal.name}: ₹${goal.current?.toLocaleString() || '0'} saved of ₹${goal.target?.toLocaleString() || '0'} target`).join('\n') || 'No specific goals set yet'}

Please provide focused advice in these areas for the Indian context:

1. INVESTMENT STRATEGY:
   - Where to invest based on their wealth level
   - Recommended asset allocation

2. GOAL ACHIEVEMENT:
   - Practical steps to reach their goals
   - Timeline suggestions

3. TAX SAVINGS:
   - Relevant tax-saving instruments (Section 80C, etc.)

4. RISK MANAGEMENT:
   - Insurance and emergency fund advice

Keep it concise (150-200 words), practical, and focused on actionable steps.
`;

        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "You are an expert financial advisor specializing in Indian family finances. Provide practical, actionable advice with specific numbers and recommendations."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.7,
          max_tokens: 1024,
        });

        const advice = chatCompletion.choices[0]?.message?.content;

        console.log('✅ Groq AI Response received!');

        return res.json({
          success: true,
          advice: advice,
          source: 'groq-ai'
        });
      } catch (groqError) {
        console.log('⚠️ Groq API error, using fallback:', groqError.message);
      }
    }

    // Fallback: Generate smart advice based on data
    console.log('📝 Using smart fallback advice generator');
    const fallbackAdvice = generateFallbackAdvice(familyData, goals);

    res.json({
      success: true,
      advice: fallbackAdvice,
      source: 'smart-advisor'
    });

  } catch (error) {
    console.error('❌ AI Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      solution: 'Please check your Groq API key configuration'
    });
  }
});

// Optimization Algorithm Fallback
const generateOptimizationAdvice = (goals, monthlyIncome, timeHorizon) => {
  let advice = `## 🎯 Optimization Strategy for Your Goals\n\n`;

  advice += `### 1. Allocation Analysis\n`;
  const totalAllocated = goals.reduce((sum, g) => sum + g.allocated, 0);
  const monthlyNeed = totalAllocated / (timeHorizon * 12);

  if (monthlyNeed > monthlyIncome * 0.4) {
    advice += `• ⚠️ **Gap Alert**: Your goals require ₹${Math.round(monthlyNeed).toLocaleString()}/month, which is >40% of income.\n`;
    advice += `• Recommendation: Extend timeline by ${Math.ceil((monthlyNeed / (monthlyIncome * 0.3)) - timeHorizon)} years or prioritize top 2 goals.\n\n`;
  } else {
    advice += `• ✅ **Healthy Ratio**: Your goals are achievable with current income.\n`;
    advice += `• Recommendation: Automate investments to ensure consistency.\n\n`;
  }

  advice += `### 2. Smart Rebalancing\n`;
  goals.forEach(goal => {
    if (goal.progress < 20 && parseInt(goal.deadline) < 2028) {
      advice += `• 🚨 **${goal.category}**: Critical focus needed. Increase allocation by 15%.\n`;
    } else if (goal.progress > 80 && parseInt(goal.deadline) > 2030) {
      advice += `• 🟢 **${goal.category}**: Well funded. Consider redirecting surfactant to other goals.\n`;
    }
  });

  advice += `\n### 3. Investment Mix\n`;
  if (timeHorizon > 10) {
    advice += `• Aggressive: 70% Equity / 20% Debt / 10% Gold\n`;
  } else if (timeHorizon > 5) {
    advice += `• Balanced: 50% Equity / 40% Debt / 10% Gold\n`;
  } else {
    advice += `• Conservative: 30% Equity / 70% Debt\n`;
  }

  return advice;
};

// Optimize Allocations endpoint
router.post('/optimize-allocations', async (req, res) => {
  try {
    const { goals, monthlyIncome, timeHorizon } = req.body;

    console.log('⚖️ Received Optimization Request');

    // Try Groq first
    if (groq && GROQ_API_KEY) {
      try {
        const prompt = `
        Act as a portfolio manager. Optimize these financial goals:
        
        CONTEXT:
        - Monthly Income: ₹${monthlyIncome}
        - Time Horizon: ${timeHorizon} years
        
        GOALS:
        ${goals.map(g => `- ${g.category}: Target ₹${g.allocated}, Current ₹${g.used}, Deadline ${g.deadline}`).join('\n')}
        
        Provide 3 specific optimization strategies:
        1. Contribution adjustments
        2. Timeline feasibility check
        3. Risk adjustment based on timeline
        `;

        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "You are an expert portfolio manager specializing in Indian financial markets. Provide specific, actionable optimization strategies."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.7,
          max_tokens: 1024,
        });

        const advice = chatCompletion.choices[0]?.message?.content;

        return res.json({ success: true, advice });
      } catch (e) {
        console.log('⚠️ Groq optimization failed, using fallback');
      }
    }

    // Fallback
    const advice = generateOptimizationAdvice(goals, monthlyIncome, timeHorizon);
    res.json({ success: true, advice });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Chat endpoint for Financial Copilot
router.post('/chat', async (req, res) => {
  try {
    const { messages, context } = req.body;
    
    console.log('💬 Received Chat Request');

    if (groq && GROQ_API_KEY) {
      try {
        const systemPrompt = `You are a helpful Financial AI Copilot for a family.
        Here is the family's current financial context:
        - Monthly Income: ₹${context?.monthlyIncome || 'unknown'}
        - Total Wealth: ₹${context?.totalWealth || 'unknown'}
        - Number of Goals: ${context?.goals?.length || 0}
        
        Provide concise, helpful, and friendly advice based on this context. Answer any questions the user asks. Keep responses under 150 words.`;

        const groqMessages = [
          { role: 'system', content: systemPrompt },
          ...messages
        ];

        const chatCompletion = await groq.chat.completions.create({
          messages: groqMessages,
          model: "llama-3.3-70b-versatile",
          temperature: 0.7,
          max_tokens: 1024,
        });

        const reply = chatCompletion.choices[0]?.message?.content;
        return res.json({ success: true, reply });
      } catch (e) {
        console.log('⚠️ Groq chat failed', e);
        return res.status(500).json({ success: false, error: 'AI processing failed.' });
      }
    }

    res.json({ success: true, reply: "I'm currently unable to process complex queries, but it looks like you are on the right track! Ensure your Groq API key is valid." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
router.get('/status', (req, res) => {
  res.json({
    service: 'Family Pool AI Advisor',
    status: 'Available',
    apiKey: GROQ_API_KEY ? `Set (${GROQ_API_KEY.length} chars)` : 'Not set',
    groqAvailable: !!groq,
    model: 'llama-3.3-70b-versatile',
    fallbackAvailable: true,
    timestamp: new Date().toISOString()
  });
});

export default router;
