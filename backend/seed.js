import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Package from './models/Package.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ninemc-store';

const initialPackages = [
    // Survival Ranks & Keys
    { name: "VIP", server: "survival", commands: ["lp user {username} parent addtemp vip 30d", "crate givekey {username} Crimson 5"] },
    { name: "MVP", server: "survival", commands: ["lp user {username} parent add mvp 30d", "crate givekey {username} Crimson 10"] },
    { name: "STAR", server: "survival", commands: ["lp user {username} parent add star 30d", "crate givekey {username} Crimson 10"] },
    { name: "GOD", server: "survival", commands: ["lp user {username} parent add god 30d", "crate givekey {username} Crimson 10", "crate givekey {username} gold 5"] },
    { name: "EPIC_KEY", server: "survival", commands: ["crate give {username} epic 1"] },
    { name: "MYTHIC_KEY", server: "survival", commands: ["crate give {username} mythic 1"] },
    { name: "AMYTHEST_KEY_S", server: "survival", commands: ["crate give {username} amythest 1"] },

    // Lifesteal Ranks & Keys
    { name: "VIP", server: "lifesteal", commands: ["lp user {username} parent addtemp vip 30d", "crate givekey {username} Crimson 5"] },
    { name: "MVP", server: "lifesteal", commands: ["lp user {username} parent add mvp 30d", "crate givekey {username} Crimson 10"] },
    { name: "STAR", server: "lifesteal", commands: ["lp user {username} parent add star 30d", "crate givekey {username} Crimson 10"] },
    { name: "GOD", server: "lifesteal", commands: ["lp user {username} parent add god 30d", "crate givekey {username} Crimson 10", "crate givekey {username} gold 5"] },
    { name: "ELITE_KEY", server: "lifesteal", commands: ["crate give {username} elite 1"] },
    { name: "SPAWNER_KEY", server: "lifesteal", commands: ["crate give {username} spawner 1"] },
    { name: "AMYTHEST_KEY_L", server: "lifesteal", commands: ["crate give {username} amythest_ls 1"] },
    { name: "PRIME_KEY", server: "lifesteal", commands: ["crate give {username} prime 1"] },
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        for (const pkgData of initialPackages) {
            const exists = await Package.findOne({ name: pkgData.name, server: pkgData.server });
            if (!exists) {
                await Package.create(pkgData);
                console.log(`Created package: ${pkgData.name} (${pkgData.server})`);
            } else {
                console.log(`Package already exists: ${pkgData.name} (${pkgData.server})`);
            }
        }

        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
