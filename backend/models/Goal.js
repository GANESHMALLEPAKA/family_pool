import mongoose from 'mongoose';

const contributionSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  memberName: String,
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  note: String,
  type: {
    type: String,
    enum: ['one-time', 'monthly'],
    default: 'one-time'
  }
});

const milestoneSchema = new mongoose.Schema({
  title: String,
  targetAmount: Number,
  deadline: Date,
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date
});

const goalSchema = new mongoose.Schema({
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['education', 'wedding', 'house_purchase', 'retirement', 'vacation', 'emergency', 'vehicle', 'other'],
    required: true
  },
  targetAmount: {
    type: Number,
    required: true
  },
  currentAmount: {
    type: Number,
    default: 0
  },
  deadline: Date,
  startDate: {
    type: Date,
    default: Date.now
  },
  beneficiary: {
    name: String,
    memberId: mongoose.Schema.Types.ObjectId
  },
  contributors: [contributionSchema],
  milestones: [milestoneSchema],
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  icon: String,
  color: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Update current amount when contributions are added
goalSchema.methods.updateCurrentAmount = function() {
  this.currentAmount = this.contributors.reduce((total, contribution) => total + contribution.amount, 0);
  
  // Update status if target is reached
  if (this.currentAmount >= this.targetAmount && this.status !== 'completed') {
    this.status = 'completed';
  }
  
  return this.save();
};

// Calculate progress percentage
goalSchema.virtual('progress').get(function() {
  return (this.currentAmount / this.targetAmount) * 100;
});

export default mongoose.model('Goal', goalSchema);