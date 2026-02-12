import express from 'express';
import Delivery from '../models/Delivery.js';
import { sendDeliveryNotification } from '../services/discord.js';
import { verifyAdmin } from './auth.js';

const router = express.Router();

/**
 * POST /api/delivery/create
 * Create a new delivery (Admin only)
 */
router.post('/create', verifyAdmin, async (req, res) => {
    try {
        const { username, platform, package: packageName } = req.body;

        // Validation
        if (!username || !platform || !packageName) {
            return res.status(400).json({
                error: 'Missing required fields: username, platform, package',
            });
        }

        if (!['java', 'bedrock'].includes(platform)) {
            return res.status(400).json({
                error: 'Invalid platform. Must be "java" or "bedrock"',
            });
        }

        // Create delivery
        const delivery = new Delivery({
            username,
            platform,
            package: packageName,
            status: 'pending',
        });

        await delivery.save();

        // Send Discord notification
        const webhookSent = await sendDeliveryNotification(delivery);
        if (webhookSent) {
            delivery.discordWebhookSent = true;
            await delivery.save();
        }

        console.log(`📦 New delivery created: ${delivery._id} for ${username}`);

        res.status(201).json({
            success: true,
            delivery: {
                id: delivery._id,
                username: delivery.username,
                platform: delivery.platform,
                package: delivery.package,
                status: delivery.status,
                createdAt: delivery.createdAt,
            },
            message: 'Delivery created successfully',
        });
    } catch (error) {
        console.error('Error creating delivery:', error);
        res.status(500).json({
            error: 'Failed to create delivery',
            details: error.message,
        });
    }
});

/**
 * GET /api/delivery/history
 * Get all deliveries (Admin only)
 */
router.get('/history', verifyAdmin, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const deliveries = await Delivery.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);

        const total = await Delivery.countDocuments();

        res.json({
            success: true,
            deliveries,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching delivery history:', error);
        res.status(500).json({
            error: 'Failed to fetch delivery history',
            details: error.message,
        });
    }
});

/**
 * GET /api/delivery/pending
 * Get pending deliveries count (Admin only)
 */
router.get('/pending', verifyAdmin, async (req, res) => {
    try {
        const count = await Delivery.countDocuments({ status: 'pending' });

        res.json({
            success: true,
            count,
        });
    } catch (error) {
        console.error('Error fetching pending deliveries:', error);
        res.status(500).json({
            error: 'Failed to fetch pending deliveries',
            details: error.message,
        });
    }
});

export default router;
