import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE
  ? `${process.env.REACT_APP_API_BASE.replace(/\/$/, '')}/api`
  : 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

export const aiService = {
  // Get financial advice
  getFinancialAdvice: async (familyData, goals, investments) => {
    try {
      console.log('🔄 Requesting AI advice...');

      const response = await api.post('/ai/financial-advice', {
        familyData,
        goals,
        currentInvestments: investments
      });

      console.log('✅ AI response received:', response.data);

      // Handle both real and mock responses
      if (response.data.success) {
        return response.data.advice;
      } else {
        throw new Error(response.data.error || 'AI service error');
      }

    } catch (error) {
      console.error('❌ AI advice error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Check AI service status
  checkAIStatus: async () => {
    try {
      const response = await api.get('/ai/status');
      console.log('📊 AI Status response:', response.data);

      // Map backend response to expected format
      return {
        aiEnabled: response.data.status === 'Available' && response.data.apiKey !== 'Not set',
        status: response.data.status,
        service: response.data.service
      };
    } catch (error) {
      console.error('❌ AI status check failed:', error.message);
      return {
        aiEnabled: false,
        status: 'Unavailable',
        error: error.message
      };
    }
  },

  // Optimize Financial Goals
  optimizeGoals: async (goals, monthlyIncome, timeHorizon) => {
    try {
      console.log('⚖️ Optimizing goals...');
      const response = await api.post('/ai/optimize-allocations', {
        goals,
        monthlyIncome,
        timeHorizon
      });

      if (response.data.success) {
        return response.data.advice;
      } else {
        throw new Error(response.data.error || 'Optimization failed');
      }
    } catch (error) {
      console.error('❌ Optimization error:', error);
      // Return safe fallback if API fails
      return "Unable to generate optimization advice at this moment. Please check your connection.";
    }
  },

  // Copilot Chat message
  sendChatMessage: async (messages, context) => {
    try {
      const response = await api.post('/ai/chat', {
        messages,
        context
      });
      if (response.data.success) {
        return response.data.reply;
      } else {
        throw new Error(response.data.error || 'Chat failed');
      }
    } catch (error) {
      console.error('❌ Chat error:', error);
      throw error;
    }
  }
};

// Keep backward compatibility
export const geminiService = aiService;