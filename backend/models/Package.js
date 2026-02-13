import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    server: {
        type: String,
        required: true,
        enum: ['survival', 'lifesteal'],
    },
    commands: {
        type: [String],
        required: true,
        default: [],
    },
}, {
    timestamps: true,
});

// Index for faster queries
packageSchema.index({ server: 1 });

const Package = mongoose.model('Package', packageSchema);

export default Package;
