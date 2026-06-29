# ♻️ Smart Dustbin Monitoring System

A premium, real-time IoT dashboard for monitoring smart dustbins. It fully supports both public-sector urban models and industrial organic-waste reactors.

Live Demo: [https://sdb-waste-management-system.web.app](https://sdb-waste-management-system.web.app)

---

## 🚀 Key Features

* **Dual Modes**: 
  * 🚌 **Public Bus Halt Model**: Monitors dual compartments (Inorganic & Organic), solar yield, active USB passenger ports, night light, and fan statuses.
  * 🏨 **Industrial Hotel Model**: Monitors organic weight (kg), methane yield ($m^3$), reactor status, and LKR cost savings.
* **Optimize Collection**: Generates a dynamic truck collection route on CartoDB maps (Light/Dark themes).
* **Responsive & Themes**: Fully supports premium Light/Dark mode.

---

## 💻 Tech Stack

* **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Leaflet Maps
* **Backend/Database**: Firebase Authentication & Realtime Database

---

## 🛠️ Quick Start

### Installation
```bash
npm install
```

### Run Locally
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Build App
```bash
npm run build
```

---

## 🔌 Hardware Setup (ESP32)

We have included a step-by-step configuration wizard.
* **Instructions**: Double-click [ESP32_SETUP_GUIDE.bat](./ESP32_SETUP_GUIDE.bat) to view the wiring and configuration guide.
* **Firmware Code**: Open [smart_dustbin_esp32.ino](./smart_dustbin_esp32.ino) in Arduino IDE to flash your ESP32.
