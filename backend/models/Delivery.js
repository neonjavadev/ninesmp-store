import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
    },
    platform: {
        type: String,
        required: true,
        enum: ['java', 'bedrock'],
    },
    package: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    executedAt: {
        type: Date,
    },
    errorMessage: {
        type: String,
    },
    discordWebhookSent: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

// Index for faster queries
deliverySchema.index({ status: 1, createdAt: -1 });
deliverySchema.index({ username: 1 });

const Delivery = mongoose.model('Delivery', deliverySchema);

export default Delivery;
