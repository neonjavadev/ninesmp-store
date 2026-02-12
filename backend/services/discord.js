import axios from 'axios';

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

/**
 * Send Discord webhook notification for new delivery
 */
export const sendDeliveryNotification = async (delivery) => {
    if (!DISCORD_WEBHOOK_URL) {
        console.warn('⚠️  Discord webhook URL not configured');
        return false;
    }

    const embed = {
        embeds: [{
            title: '🎁 New Rank Delivery',
            description: 'A new delivery has been created and is pending execution.',
            color: 0x00ff00, // Green
            fields: [
                {
                    name: '👤 Username',
                    value: delivery.username,
                    inline: true,
                },
                {
                    name: '🖥️ Platform',
                    value: delivery.platform.toUpperCase(),
                    inline: true,
                },
                {
                    name: '📦 Package',
                    value: delivery.package,
                    inline: true,
                },
                {
                    name: '⏰ Created At',
                    value: new Date(delivery.createdAt).toLocaleString('en-US', {
                        timeZone: 'Asia/Kolkata',
                    }),
                    inline: false,
                },
            ],
            footer: {
                text: 'NineSMP Delivery System',
            },
            timestamp: new Date().toISOString(),
        }],
    };

    try {
        await axios.post(DISCORD_WEBHOOK_URL, embed);
        console.log(`✅ Discord notification sent for delivery: ${delivery._id}`);
        return true;
    } catch (error) {
        console.error('❌ Failed to send Discord webhook:', error.message);
        return false;
    }
};

/**
 * Send completion notification
 */
export const sendCompletionNotification = async (delivery) => {
    if (!DISCORD_WEBHOOK_URL) return false;

    const embed = {
        embeds: [{
            title: '✅ Delivery Completed',
            description: 'A rank delivery has been successfully executed.',
            color: 0x00d4ff, // Cyan
            fields: [
                {
                    name: '👤 Username',
                    value: delivery.username,
                    inline: true,
                },
                {
                    name: '📦 Package',
                    value: delivery.package,
                    inline: true,
                },
                {
                    name: '⏰ Executed At',
                    value: new Date(delivery.executedAt).toLocaleString('en-US', {
                        timeZone: 'Asia/Kolkata',
                    }),
                    inline: false,
                },
            ],
            footer: {
                text: 'NineSMP Delivery System',
            },
            timestamp: new Date().toISOString(),
        }],
    };

    try {
        await axios.post(DISCORD_WEBHOOK_URL, embed);
        console.log(`✅ Completion notification sent for delivery: ${delivery._id}`);
        return true;
    } catch (error) {
        console.error('❌ Failed to send completion webhook:', error.message);
        return false;
    }
};

/**
 * Send failure notification
 */
export const sendFailureNotification = async (delivery) => {
    if (!DISCORD_WEBHOOK_URL) return false;

    const embed = {
        embeds: [{
            title: '❌ Delivery Failed',
            description: 'A rank delivery has failed to execute.',
            color: 0xff0000, // Red
            fields: [
                {
                    name: '👤 Username',
                    value: delivery.username,
                    inline: true,
                },
                {
                    name: '📦 Package',
                    value: delivery.package,
                    inline: true,
                },
                {
                    name: '❌ Error',
                    value: delivery.errorMessage || 'Unknown error',
                    inline: false,
                },
            ],
            footer: {
                text: 'NineSMP Delivery System',
            },
            timestamp: new Date().toISOString(),
        }],
    };

    try {
        await axios.post(DISCORD_WEBHOOK_URL, embed);
        console.log(`✅ Failure notification sent for delivery: ${delivery._id}`);
        return true;
    } catch (error) {
        console.error('❌ Failed to send failure webhook:', error.message);
        return false;
    }
};
