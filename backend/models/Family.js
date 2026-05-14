import mongoose from 'mongoose';

const familyMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
    // Not required — manually added members won't have accounts
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['patriarch', 'matriarch', 'son', 'daughter', 'spouse', 'grandchild', 'parent', 'member'],
    required: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfBirth: Date,
  avatar: String,
  monthlyIncome: {
    type: Number,
    default: 0,
    min: 0
  },
  monthlyContribution: {
    type: Number,
    default: 0,
    min: 0
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const familySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  familyCode: {
    type: String,
    unique: true
  },
  patriarch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [familyMemberSchema],
  totalWealth: {
    type: Number,
    default: 0
  },
  monthlyIncome: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  avatar: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate unique family code
familySchema.pre('save', function(next) {
  if (!this.familyCode) {
    this.familyCode = 'FAM' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

// Update total wealth and income from members
familySchema.methods.updateTotalWealth = function() {
  this.monthlyIncome = this.members.reduce((total, member) => total + (member.monthlyIncome || 0), 0);
  this.totalWealth = this.members.reduce((total, member) => total + (member.monthlyContribution || 0), 0);
  return this.save();
};

export default mongoose.model('Family', familySchema);