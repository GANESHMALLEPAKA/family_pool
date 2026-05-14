import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['financial_summary', 'goal_progress', 'contribution_analysis', 'wealth_growth'],
    required: true
  },
  period: {
    startDate: Date,
    endDate: Date
  },
  data: mongoose.Schema.Types.Mixed,
  generatedBy: {
    name: String
  },
  isShared: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Report', reportSchema);