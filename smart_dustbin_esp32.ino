/*
 * ============================================================
 *  SMART DUSTBIN MONITORING SYSTEM
 *  ESP32 Firmware v1.0
 * ============================================================
 *  Hardware:
 *    - ESP32 Dev Board
 *    - HC-SR04 Ultrasonic Sensor  (fill level)
 *    - MQ2 Gas Sensor             (gas/smoke detection)
 *
 *  Data Flow:
 *    HC-SR04 + MQ2 → ESP32 → Firebase Realtime DB → React App
 *
 *  Libraries Required:
 *    - Firebase Arduino Client Library for ESP8266 and ESP32 (Mobizt)
 *    - ArduinoJson (Benoit Blanchon)
 * ============================================================
 */

#include <WiFi.h>
#include <FirebaseESP32.h>
#include <ArduinoJson.h>
#include <time.h>

// ─────────────────────────────────────────────────
//  TODO: FILL IN YOUR CREDENTIALS BELOW
// ─────────────────────────────────────────────────

#define WIFI_SSID        "YOUR_WIFI_NAME"
#define WIFI_PASSWORD    "YOUR_WIFI_PASSWORD"

// Firebase project credentials
#define API_KEY          "AIzaSyAW87IavwGT-rc9Z6GJvMeo2KWAQeS0F_I"
#define DATABASE_URL     "https://sdb-waste-management-system-default-rtdb.firebaseio.com"

// ─────────────────────────────────────────────────
//  TODO: CONFIGURE THIS BIN
//  Change these for each ESP32/bin unit
// ─────────────────────────────────────────────────

#define BIN_ID           "BIN-001"
#define BIN_LOCATION     "Bus Halt - Main Street"
#define BIN_SECTOR       "public"      // "public" or "industrial"
#define BIN_MAX_CM       30            // physical depth of the bin in cm (distance when EMPTY)
#define SEND_INTERVAL_MS 5000          // how often to send data (ms) — 5 seconds

// ─────────────────────────────────────────────────
//  PIN DEFINITIONS
// ─────────────────────────────────────────────────

// HC-SR04 Ultrasonic (Fill Level)
#define TRIG_PIN         5
#define ECHO_PIN         18

// MQ2 Gas Sensor
#define MQ2_ANALOG_PIN   34    // ADC pin (0–4095)
#define MQ2_DIGITAL_PIN  35    // Digital threshold output

// Built-in LED (blink on send)
#define LED_PIN          2

// ─────────────────────────────────────────────────
//  FIREBASE OBJECTS
// ─────────────────────────────────────────────────

FirebaseData   fbdo;
FirebaseAuth   auth;
FirebaseConfig config;

// ─────────────────────────────────────────────────
//  GLOBALS
// ─────────────────────────────────────────────────

unsigned long lastSendTime = 0;

// ─────────────────────────────────────────────────
//  HELPER: Measure distance with HC-SR04
//  Returns distance in cm
// ─────────────────────────────────────────────────
float measureDistanceCm() {
  // Send 10µs pulse
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // Read echo pulse duration (timeout: 30ms = ~5m max)
  long duration = pulseIn(ECHO_PIN, HIGH, 30000);

  if (duration == 0) {
    Serial.println("[WARN] HC-SR04 timeout — check wiring");
    return -1;
  }

  // Convert to cm: speed of sound = 0.034 cm/µs
  float distance = (duration * 0.034) / 2.0;
  return distance;
}

// ─────────────────────────────────────────────────
//  HELPER: Calculate fill level %
//  Full bin = object is CLOSE (small distance)
//  Empty bin = object is FAR (large distance ≈ BIN_MAX_CM)
// ─────────────────────────────────────────────────
float calculateFillLevel(float distanceCm) {
  if (distanceCm < 0) return 0;
  // Clamp distance
  if (distanceCm > BIN_MAX_CM) distanceCm = BIN_MAX_CM;
  if (distanceCm < 0)          distanceCm = 0;

  // Fill % = how much of the bin is OCCUPIED
  // When distance = BIN_MAX_CM → 0% full (empty)
  // When distance = 0          → 100% full
  float fillPct = ((BIN_MAX_CM - distanceCm) / (float)BIN_MAX_CM) * 100.0;
  return fillPct;
}

// ─────────────────────────────────────────────────
//  HELPER: Read gas level %
//  MQ2 analog 0–4095 mapped to 0–100%
// ─────────────────────────────────────────────────
float readGasLevel() {
  int rawValue = analogRead(MQ2_ANALOG_PIN);
  // MQ2 outputs HIGH raw when gas is present (inverse of some modules)
  // Adjust the formula if your readings are inverted
  float gasPct = (rawValue / 4095.0) * 100.0;
  return gasPct;
}

// ─────────────────────────────────────────────────
//  SETUP
// ─────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  Serial.println("\n\n========================================");
  Serial.println("  Smart DustBin ESP32 Firmware v1.0");
  Serial.println("  Bin ID: " BIN_ID);
  Serial.println("  Sector: " BIN_SECTOR);
  Serial.println("========================================\n");

  // Pin setup
  pinMode(TRIG_PIN,       OUTPUT);
  pinMode(ECHO_PIN,       INPUT);
  pinMode(MQ2_DIGITAL_PIN, INPUT);
  pinMode(LED_PIN,        OUTPUT);

  // ── Connect to WiFi ──────────────────────────
  Serial.print("[WiFi] Connecting to: " WIFI_SSID " ");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int wifiRetries = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    wifiRetries++;
    if (wifiRetries > 40) {
      Serial.println("\n[ERROR] WiFi failed. Check SSID/Password. Restarting...");
      delay(3000);
      ESP.restart();
    }
  }

  Serial.println("\n[WiFi] Connected!");
  Serial.print("[WiFi] IP Address: ");
  Serial.println(WiFi.localIP());

  // ── Configure Firebase ────────────────────────
  config.api_key           = API_KEY;
  config.database_url      = DATABASE_URL;

  // Anonymous sign-in (no email/password needed for device)
  // The Realtime DB rules are set to allow public read/write
  auth.user.email    = "";
  auth.user.password = "";

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  // Increase timeout for slow connections
  fbdo.setResponseSize(4096);

  Serial.println("[Firebase] Initialized.");
  Serial.println("[System] Starting data upload loop...\n");

  // Warm-up delay for MQ2 sensor (needs ~30s ideally, we do 3s for demo)
  Serial.println("[MQ2] Warming up gas sensor (3 seconds)...");
  delay(3000);
  Serial.println("[MQ2] Ready.");
}

// ─────────────────────────────────────────────────
//  LOOP
// ─────────────────────────────────────────────────
void loop() {
  unsigned long now = millis();

  if (now - lastSendTime >= SEND_INTERVAL_MS) {
    lastSendTime = now;

    // ── Read Sensors ───────────────────────────
    float distanceCm = measureDistanceCm();
    float fillLevel  = calculateFillLevel(distanceCm);
    float gasLevel   = readGasLevel();

    // Round to 1 decimal
    fillLevel = round(fillLevel * 10) / 10.0;
    gasLevel  = round(gasLevel  * 10) / 10.0;

    Serial.println("──────────────────────────────────");
    Serial.print("[Sensor] Distance : "); Serial.print(distanceCm); Serial.println(" cm");
    Serial.print("[Sensor] Fill Level: "); Serial.print(fillLevel); Serial.println(" %");
    Serial.print("[Sensor] Gas Level : "); Serial.print(gasLevel);  Serial.println(" %");

    // ── Build Firebase path ────────────────────
    String basePath = "/dustbins/" + String(BIN_ID);

    // ── Upload to Firebase ─────────────────────
    bool success = true;

    if (!Firebase.setFloat(fbdo,   basePath + "/fillLevel",   fillLevel))  { Serial.println("[ERR] fillLevel: "   + fbdo.errorReason()); success = false; }
    if (!Firebase.setFloat(fbdo,   basePath + "/gasLevel",    gasLevel))   { Serial.println("[ERR] gasLevel: "    + fbdo.errorReason()); success = false; }
    if (!Firebase.setString(fbdo,  basePath + "/id",          BIN_ID))     { Serial.println("[ERR] id: "          + fbdo.errorReason()); success = false; }
    if (!Firebase.setString(fbdo,  basePath + "/location",    BIN_LOCATION)){ Serial.println("[ERR] location: "   + fbdo.errorReason()); success = false; }
    if (!Firebase.setString(fbdo,  basePath + "/sector",      BIN_SECTOR)) { Serial.println("[ERR] sector: "      + fbdo.errorReason()); success = false; }
    if (!Firebase.setInt(fbdo,     basePath + "/lastUpdated", (int)(now / 1000))) { Serial.println("[ERR] lastUpdated"); success = false; }

    if (success) {
      Serial.println("[Firebase] ✓ Data sent successfully!");
      // Blink LED to indicate successful send
      digitalWrite(LED_PIN, HIGH);
      delay(100);
      digitalWrite(LED_PIN, LOW);
    } else {
      Serial.println("[Firebase] ✗ Some fields failed to upload.");
      // Rapid blink for error
      for (int i = 0; i < 5; i++) {
        digitalWrite(LED_PIN, HIGH); delay(50);
        digitalWrite(LED_PIN, LOW);  delay(50);
      }
    }
  }
}
