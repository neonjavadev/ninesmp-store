import express from 'express';
import Delivery from '../models/Delivery.js';
import { sendCompletionNotification, sendFailureNotification } from '../services/discord.js';

const router = express.Router();

// Simple API key authentication for Minecraft plugin
const verifyPlugin = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const expectedKey = process.env.PLUGIN_API_KEY || 'ninesmp-plugin-key-change-this';

    if (apiKey !== expectedKey) {
        return res.status(401).json({ error: 'Unauthorized - Invalid API key' });
    }

    next();
};

/**
 * GET /api/plugin/pending
 * Fetch pending commands for Minecraft plugin
 */
router.get('/pending', verifyPlugin, async (req, res) => {
    try {
        const pendingDeliveries = await Delivery.find({ status: 'pending' })
            .sort({ createdAt: 1 }) // Oldest first
            .limit(10); // Process max 10 at a time

        const commands = pendingDeliveries.map(delivery => ({
            id: delivery._id.toString(),
            username: delivery.username,
            platform: delivery.platform,
            package: delivery.package,
            createdAt: delivery.createdAt,
        }));

        res.json({
            success: true,
            commands,
            count: commands.length,
        });
    } catch (error) {
        console.error('Error fetching pending commands:', error);
        res.status(500).json({
            error: 'Failed to fetch pending commands',
            details: error.message,
        });
    }
});

/**
 * POST /api/plugin/complete
 * Mark a delivery as completed
 */
router.post('/complete', verifyPlugin, async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Missing delivery ID' });
        }

        const delivery = await Delivery.findById(id);

        if (!delivery) {
            return res.status(404).json({ error: 'Delivery not found' });
        }

        if (delivery.status !== 'pending') {
            return res.status(400).json({
                error: 'Delivery is not pending',
                currentStatus: delivery.status,
            });
        }

        delivery.status = 'completed';
        delivery.executedAt = new Date();
        await delivery.save();

        // Send Discord completion notification
        await sendCompletionNotification(delivery);

        console.log(`✅ Delivery completed: ${delivery._id} for ${delivery.username}`);

        res.json({
            success: true,
            message: 'Delivery marked as completed',
            delivery: {
                id: delivery._id,
                username: delivery.username,
                package: delivery.package,
                status: delivery.status,
                executedAt: delivery.executedAt,
            },
        });
    } catch (error) {
        console.error('Error marking delivery as complete:', error);
        res.status(500).json({
            error: 'Failed to mark delivery as complete',
            details: error.message,
        });
    }
});

/**
 * POST /api/plugin/failed
 * Mark a delivery as failed
 */
router.post('/failed', verifyPlugin, async (req, res) => {
    try {
        const { id, error: errorMessage } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Missing delivery ID' });
        }

        const delivery = await Delivery.findById(id);

        if (!delivery) {
            return res.status(404).json({ error: 'Delivery not found' });
        }

        delivery.status = 'failed';
        delivery.errorMessage = errorMessage || 'Unknown error';
        delivery.executedAt = new Date();
        await delivery.save();

        // Send Discord failure notification
        await sendFailureNotification(delivery);

        console.log(`❌ Delivery failed: ${delivery._id} - ${errorMessage}`);

        res.json({
            success: true,
            message: 'Delivery marked as failed',
            delivery: {
                id: delivery._id,
                username: delivery.username,
                package: delivery.package,
                status: delivery.status,
                errorMessage: delivery.errorMessage,
            },
        });
    } catch (error) {
        console.error('Error marking delivery as failed:', error);
        res.status(500).json({
            error: 'Failed to mark delivery as failed',
            details: error.message,
        });
    }
});

export default router;
