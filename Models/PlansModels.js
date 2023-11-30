import mongoose from 'mongoose';

const PlansSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a plan name'],
        trim: true,
        maxlength: [50, 'Plan name cannot be more than 50 characters'],
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
    },
    duration: {
        type: Number,
        required: [true, 'Please add a duration'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const PlansModel = mongoose.model('Plans', PlansSchema);

export default PlansModel;