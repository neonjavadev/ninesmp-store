package fun.ninemc.rankdelivery.commands;

import fun.ninemc.rankdelivery.RankDeliveryPlugin;
import fun.ninemc.rankdelivery.api.ApiClient;
import org.bukkit.Bukkit;

import java.util.List;
import java.util.logging.Level;

public class CommandExecutor {

    private final RankDeliveryPlugin plugin;

    public CommandExecutor(RankDeliveryPlugin plugin) {
        this.plugin = plugin;
    }

    /**
     * Process all pending deliveries
     */
    public void processPendingDeliveries() {
        ApiClient apiClient = plugin.getApiClient();
        List<ApiClient.PendingDelivery> deliveries = apiClient.getPendingDeliveries();

        if (deliveries.isEmpty()) {
            if (plugin.getConfig().getBoolean("debug", false)) {
                plugin.getLogger().info("No pending deliveries found");
            }
            return;
        }

        plugin.getLogger().info("Processing " + deliveries.size() + " pending deliveries...");

        for (ApiClient.PendingDelivery delivery : deliveries) {
            processDelivery(delivery);
        }
    }

    /**
     * Process a single delivery
     */
    private void processDelivery(ApiClient.PendingDelivery delivery) {
        String packageName = delivery.getPackageName();
        String username = delivery.getUsername();
        String platform = delivery.getPlatform();

        // Get commands from config
        List<String> commands = plugin.getConfig().getStringList("commands." + packageName);

        if (commands == null || commands.isEmpty()) {
            String error = "No commands configured for package: " + packageName;
            plugin.getLogger().warning(error);
            plugin.getApiClient().markFailed(delivery.getId(), error);
            return;
        }

        plugin.getLogger().info("Executing delivery for " + username + " (Package: " + packageName + ")");

        try {
            // Execute commands on main thread
            Bukkit.getScheduler().runTask(plugin, () -> {
                boolean success = true;

                for (String cmd : commands) {
                    // Replace placeholders
                    String processedCmd = cmd
                            .replace("{username}", username)
                            .replace("{platform}", platform);

                    try {
                        if (plugin.getConfig().getBoolean("debug", false)) {
                            plugin.getLogger().info("Executing: " + processedCmd);
                        }

                        Bukkit.dispatchCommand(Bukkit.getConsoleSender(), processedCmd);
                    } catch (Exception e) {
                        plugin.getLogger().log(Level.SEVERE, "Failed to execute command: " + processedCmd, e);
                        success = false;
                        break;
                    }
                }

                // Mark as completed or failed
                if (success) {
                    plugin.getApiClient().markCompleted(delivery.getId());
                    plugin.getLogger().info("✓ Successfully delivered " + packageName + " to " + username);

                    // Notify player if online
                    org.bukkit.entity.Player player = Bukkit.getPlayerExact(username);
                    if (player != null && player.isOnline()) {
                        player.sendMessage("§e━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                        player.sendMessage("§6§l🎁 RANK DELIVERY");
                        player.sendMessage("§7You have received: §e§l" + packageName);
                        player.sendMessage("§7Thank you for your purchase!");
                        player.sendMessage("§e━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                    }
                } else {
                    plugin.getApiClient().markFailed(delivery.getId(), "Command execution failed");
                }
            });
        } catch (Exception e) {
            plugin.getLogger().log(Level.SEVERE, "Error processing delivery", e);
            plugin.getApiClient().markFailed(delivery.getId(), e.getMessage());
        }
    }
}
