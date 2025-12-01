Women Safety App – AI-Powered Scream Detection
Edge Impulse Integrated · Real-Time Distress Monitoring · Automatic SOS

Hey there! This project is an impactful blend of AI, mobile development, and safety innovation — built to protect women in real-world emergency situations.
With Edge Impulse’s on-device ML, the app listens for distress cues like screams, “help”, and sudden loud noises, and triggers automatic SOS actions — even when the user cannot tap a button.

🌟 What This Project Solves

Women often face unsafe situations where they:

❌ Cannot press an SOS button

❌ Cannot unlock their phone

❌ Cannot call for help

❌ Panic or freeze

❌ Are physically restricted

Traditional safety apps depend on manual triggers — which fail when they matter most.

This app solves that with AI that listens, detects, and helps instantly — without user input.

🚨 Problem Statement

Women require a safety system that:

⚡ Works automatically

🎧 Detects danger in real time

🆘 Sends alerts without user interaction

📡 Works even offline

🛟 Provides immediate help

This app brings an AI-driven scream detection system built to save lives.

💡 Proposed Solution

A mobile app powered by Edge Impulse’s Audio Classification Model that continuously monitors the environment and detects:

🔊 Scream-like sounds

🙁 Crying / shouting

🔉 Distress keywords (“Help”, “Stop”)

📢 Sudden loud noises

🎙️ Unusual audio patterns

When a threat is detected → Automatic SOS, live location sharing, audio recording, and contact notifications.

🔥 Key Highlights

🤖 AI-powered scream detection (≥75% confidence)

🧠 Real-time audio classification (MFCC + CNN)

🚨 Automatic SOS trigger

📍 Live GPS location sharing

📡 Works offline (on-device ML)

📱 Background monitoring

📸 Auto evidence recording (10–30 sec)

📳 Optional accelerometer detection (fall/struggle)

🛠️ Tech Stack
📱 Mobile App

Flutter / React Native

Firebase / Twilio / WhatsApp API

Google Maps API

🤖 AI Model

Edge Impulse (Audio Classification)

MFCC feature extraction

TensorFlow Lite deployment

📡 Sensors Used

Microphone

GPS

Accelerometer

On-device inference engine

🎯 Core Features
🔊 AI Scream & Distress Detection

Detects scream, shouting, “Help!”

Multi-level distress scoring → High / Medium / Low

Runs silently in background

🚨 Automatic SOS System

When scream ≥ 0.75 confidence:

Sends SOS alert

Shares real-time location

Records audio evidence

Notifies trusted contacts / helplines

🛰 GPS Emergency Tracking

Live location updates

Continuous tracking in danger mode

📱 Safety Tools

One-tap SOS

Fake call feature

High-volume alarm

Instant evidence recording

🔐 Privacy First

No raw audio stored

On-device ML

End-to-end encrypted emergency data

🔗 Edge Impulse Integration
① Data Collection

Dataset includes:

Scream samples

Crying / shouting

Background noise

Talking

Silence

Keywords: “Help”, “Stop”, etc.

Uploaded to Edge Impulse Studio.

② Model Training

MFCC feature extraction

CNN-based classifier

Labels: Scream, Noise, Talking, Silence

Accuracy: 82%–90% based on dataset

③ Model Deployment

Export formats:

.tflite (mobile)

C++ Edge Impulse SDK

④ Mobile Integration

Model output example:

{
  "Scream": 0.82,
  "Talking": 0.10,
  "Noise": 0.05,
  "Silence": 0.03
}

⑤ Decision Flow
Audio Input
     ↓
Edge Impulse Model
     ↓
Is Scream ≥ 0.75?
     → Yes → Trigger SOS
     → No → Is Scream ≥ 0.50?
                 → Yes → Notify Contacts
                 → No → Keep Monitoring

📦 AI Response Example
{
  "detection": true,
  "distress_level": "high",
  "scream_confidence": 0.82,
  "recommended_action": "Trigger SOS and send location immediately.",
  "location": "13.0827, 80.2707",
  "timestamp": "2025-02-19T18:22:15Z"
}

🚀 Getting Started
1️⃣ Clone the Repository
git clone https://github.com/your-username/women-safety-ai-scream-detection.git
cd women-safety-ai-scream-detection

2️⃣ Add Your Edge Impulse Model

Place your .tflite file inside:

/assets/models/

3️⃣ Install Dependencies (Flutter)
flutter pub get

4️⃣ Run the App
flutter run

📘 How to Use

Just open the app → allow microphone access → keep it running.

The AI listens silently in the background.
If danger is detected → SOS triggers automatically.

🔮 Future Improvements

🗺️ Geofencing unsafe zones

⌚ Wearable + smartwatch integration

❤️ Heart-rate distress detection

🧠 Multilingual keyword detection

🤝 Community safety network

📡 Cloud-based incident analytics
