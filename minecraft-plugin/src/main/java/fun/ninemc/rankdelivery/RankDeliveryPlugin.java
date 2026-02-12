package fun.ninemc.rankdelivery;

import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;
import org.bukkit.plugin.java.JavaPlugin;
import fun.ninemc.rankdelivery.api.ApiClient;
import fun.ninemc.rankdelivery.commands.CommandExecutor;

import java.util.logging.Level;

public class RankDeliveryPlugin extends JavaPlugin {
    
    private ApiClient apiClient;
    private CommandExecutor commandExecutor;
    private int pollTaskId = -1;
    
    @Override
    public void onEnable() {
        // Save default config
        saveDefaultConfig();
        
        // Initialize API client
        String apiUrl = getConfig().getString("api.url");
        String apiKey = getConfig().getString("api.key");
        apiClient = new ApiClient(apiUrl, apiKey, this);
        
        // Initialize command executor
        commandExecutor = new CommandExecutor(this);
        
        // Start polling task if enabled
        if (getConfig().getBoolean("polling.enabled", true)) {
            startPolling();
        }
        
        getLogger().info("╔════════════════════════════════════════╗");
        getLogger().info("║   NineSMP Rank Delivery Plugin   ║");
        getLogger().info("║         Status: ✅ Enabled          ║");
        getLogger().info("╚════════════════════════════════════════╝");
    }
    
    @Override
    public void onDisable() {
        stopPolling();
        getLogger().info("NineSMP Rank Delivery Plugin disabled.");
    }
    
    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (command.getName().equalsIgnoreCase("rankdelivery")) {
            if (!sender.hasPermission("rankdelivery.admin")) {
                sender.sendMessage("§c❌ You don't have permission to use this command.");
                return true;
            }
            
            if (args.length == 0) {
                sender.sendMessage("§e━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                sender.sendMessage("§6§lNineSMP Rank Delivery");
                sender.sendMessage("§7Version: §f" + getDescription().getVersion());
                sender.sendMessage("§7Status: §a✓ Running");
                sender.sendMessage("§e━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                sender.sendMessage("§7Commands:");
                sender.sendMessage("§e  /rd reload §7- Reload configuration");
                sender.sendMessage("§e  /rd status §7- Check plugin status");
                sender.sendMessage("§e  /rd poll §7- Manually poll for deliveries");
                sender.sendMessage("§e━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                return true;
            }
            
            switch (args[0].toLowerCase()) {
                case "reload":
                    reloadConfig();
                    stopPolling();
                    if (getConfig().getBoolean("polling.enabled", true)) {
                        startPolling();
                    }
                    sender.sendMessage("§a✓ Configuration reloaded!");
                    return true;
                    
                case "status":
                    sender.sendMessage("§e━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                    sender.sendMessage("§6§lPlugin Status");
                    sender.sendMessage("§7API URL: §f" + getConfig().getString("api.url"));
                    sender.sendMessage("§7Polling: §f" + (getConfig().getBoolean("polling.enabled") ? "§aEnabled" : "§cDisabled"));
                    sender.sendMessage("§7Interval: §f" + getConfig().getInt("polling.interval") + "s");
                    sender.sendMessage("§e━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                    return true;
                    
                case "poll":
                    sender.sendMessage("§e⏳ Manually polling for pending deliveries...");
                    Bukkit.getScheduler().runTaskAsynchronously(this, () -> {
                        commandExecutor.processPendingDeliveries();
                        sender.sendMessage("§a✓ Poll complete!");
                    });
                    return true;
                    
                default:
                    sender.sendMessage("§cUnknown subcommand. Use /rd for help.");
                    return true;
            }
        }
        return false;
    }
    
    private void startPolling() {
        int interval = getConfig().getInt("polling.interval", 60) * 20; // Convert to ticks
        
        pollTaskId = Bukkit.getScheduler().scheduleSyncRepeatingTask(this, () -> {
            if (getConfig().getBoolean("debug", false)) {
                getLogger().info("Polling for pending deliveries...");
            }
            
            Bukkit.getScheduler().runTaskAsynchronously(this, () -> {
                try {
                    commandExecutor.processPendingDeliveries();
                } catch (Exception e) {
                    getLogger().log(Level.SEVERE, "Error processing deliveries", e);
                }
            });
        }, 100L, interval); // Start after 5 seconds, then repeat
        
        getLogger().info("✓ Started polling every " + getConfig().getInt("polling.interval", 60) + " seconds");
    }
    
    private void stopPolling() {
        if (pollTaskId != -1) {
            Bukkit.getScheduler().cancelTask(pollTaskId);
            pollTaskId = -1;
            getLogger().info("Stopped polling task");
        }
    }
    
    public ApiClient getApiClient() {
        return apiClient;
    }
    
    public CommandExecutor getCommandExecutor() {
        return commandExecutor;
    }
}
