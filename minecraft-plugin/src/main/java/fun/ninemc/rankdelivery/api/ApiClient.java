package fun.ninemc.rankdelivery.api;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import fun.ninemc.rankdelivery.RankDeliveryPlugin;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;

public class ApiClient {

    private final String apiUrl;
    private final String apiKey;
    private final RankDeliveryPlugin plugin;
    private final Gson gson;

    public ApiClient(String apiUrl, String apiKey, RankDeliveryPlugin plugin) {
        this.apiUrl = apiUrl.endsWith("/") ? apiUrl.substring(0, apiUrl.length() - 1) : apiUrl;
        this.apiKey = apiKey;
        this.plugin = plugin;
        this.gson = new Gson();
    }

    /**
     * Fetch pending deliveries from the backend
     */
    public List<PendingDelivery> getPendingDeliveries() {
        List<PendingDelivery> deliveries = new ArrayList<>();

        try {
            URL url = new URL(apiUrl + "/api/plugin/pending");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("X-API-Key", apiKey);
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(10000);

            int responseCode = conn.getResponseCode();

            if (responseCode == 200) {
                BufferedReader reader = new BufferedReader(
                        new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8));
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
                reader.close();

                JsonObject jsonResponse = gson.fromJson(response.toString(), JsonObject.class);
                JsonArray commands = jsonResponse.getAsJsonArray("commands");

                for (int i = 0; i < commands.size(); i++) {
                    JsonObject cmd = commands.get(i).getAsJsonObject();
                    deliveries.add(new PendingDelivery(
                            cmd.get("id").getAsString(),
                            cmd.get("username").getAsString(),
                            cmd.get("platform").getAsString(),
                            cmd.get("package").getAsString()));
                }

                if (plugin.getConfig().getBoolean("debug", false)) {
                    plugin.getLogger().info("Fetched " + deliveries.size() + " pending deliveries");
                }
            } else {
                plugin.getLogger().warning("Failed to fetch pending deliveries. Status: " + responseCode);
            }

            conn.disconnect();
        } catch (Exception e) {
            plugin.getLogger().log(Level.SEVERE, "Error fetching pending deliveries", e);
        }

        return deliveries;
    }

    /**
     * Mark a delivery as completed
     */
    public boolean markCompleted(String deliveryId) {
        try {
            URL url = new URL(apiUrl + "/api/plugin/complete");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("X-API-Key", apiKey);
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(10000);

            JsonObject requestBody = new JsonObject();
            requestBody.addProperty("id", deliveryId);

            OutputStream os = conn.getOutputStream();
            os.write(requestBody.toString().getBytes(StandardCharsets.UTF_8));
            os.flush();
            os.close();

            int responseCode = conn.getResponseCode();
            conn.disconnect();

            if (responseCode == 200) {
                plugin.getLogger().info("✓ Marked delivery " + deliveryId + " as completed");
                return true;
            } else {
                plugin.getLogger().warning("Failed to mark delivery as completed. Status: " + responseCode);
                return false;
            }
        } catch (Exception e) {
            plugin.getLogger().log(Level.SEVERE, "Error marking delivery as completed", e);
            return false;
        }
    }

    /**
     * Mark a delivery as failed
     */
    public boolean markFailed(String deliveryId, String errorMessage) {
        try {
            URL url = new URL(apiUrl + "/api/plugin/failed");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("X-API-Key", apiKey);
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(10000);

            JsonObject requestBody = new JsonObject();
            requestBody.addProperty("id", deliveryId);
            requestBody.addProperty("error", errorMessage);

            OutputStream os = conn.getOutputStream();
            os.write(requestBody.toString().getBytes(StandardCharsets.UTF_8));
            os.flush();
            os.close();

            int responseCode = conn.getResponseCode();
            conn.disconnect();

            if (responseCode == 200) {
                plugin.getLogger().warning("✗ Marked delivery " + deliveryId + " as failed: " + errorMessage);
                return true;
            } else {
                plugin.getLogger().warning("Failed to mark delivery as failed. Status: " + responseCode);
                return false;
            }
        } catch (Exception e) {
            plugin.getLogger().log(Level.SEVERE, "Error marking delivery as failed", e);
            return false;
        }
    }

    /**
     * Pending delivery data class
     */
    public static class PendingDelivery {
        private final String id;
        private final String username;
        private final String platform;
        private final String packageName;

        public PendingDelivery(String id, String username, String platform, String packageName) {
            this.id = id;
            this.username = username;
            this.platform = platform;
            this.packageName = packageName;
        }

        public String getId() {
            return id;
        }

        public String getUsername() {
            return username;
        }

        public String getPlatform() {
            return platform;
        }

        public String getPackageName() {
            return packageName;
        }
    }
}
