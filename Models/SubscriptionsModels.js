
import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true
  },
  payerId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true
  },
  expiryDate: {
    type: Number,
    required: true
  }
});

const SubscriptionModels = mongoose.model('Subscription', subscriptionSchema);

export default SubscriptionModels;
