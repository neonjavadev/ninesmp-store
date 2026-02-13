import express from 'express';
import Package from '../models/Package.js';
import { verifyAdmin } from './auth.js';

const router = express.Router();

/**
 * GET /api/package
 * Get all packages
 */
router.get('/', async (req, res) => {
    try {
        const packages = await Package.find().sort({ name: 1 });
        res.json({ success: true, packages });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch packages', details: error.message });
    }
});

/**
 * POST /api/package/create
 * Create a new package (Admin only)
 */
router.post('/create', verifyAdmin, async (req, res) => {
    try {
        const { name, server, commands } = req.body;

        if (!name || !server || !commands || !Array.isArray(commands)) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const pkg = new Package({ name, server, commands });
        await pkg.save();

        res.status(201).json({ success: true, package: pkg });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create package', details: error.message });
    }
});

/**
 * PUT /api/package/:id
 * Update a package (Admin only)
 */
router.put('/:id', verifyAdmin, async (req, res) => {
    try {
        const { name, server, commands } = req.body;
        const pkg = await Package.findByIdAndUpdate(
            req.params.id,
            { name, server, commands },
            { new: true }
        );

        if (!pkg) return res.status(404).json({ error: 'Package not found' });
        res.json({ success: true, package: pkg });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update package', details: error.message });
    }
});

/**
 * DELETE /api/package/:id
 * Delete a package (Admin only)
 */
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const pkg = await Package.findByIdAndDelete(req.params.id);
        if (!pkg) return res.status(404).json({ error: 'Package not found' });
        res.json({ success: true, message: 'Package deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete package', details: error.message });
    }
});

export default router;
