# 🛡️ Women Safety App – AI-Powered Scream Detection  
### Edge Impulse Integrated · Real-Time Distress Monitoring · Automatic SOS

Hey there! This project is an impactful blend of **AI**, **mobile development**, and **safety innovation** — built to protect women in real-world emergency situations. With **Edge Impulse’s on-device ML**, the app listens for distress cues like *screams*, *“help”*, and sudden loud noises, and triggers **automatic SOS actions** — even when the user cannot tap a button.

---

## 🌟 What This Project Solves

Women often face unsafe situations where they:

❌ Cannot press an SOS button  
❌ Cannot unlock their phone  
❌ Cannot call for help  
❌ Panic or freeze  
❌ Are physically restricted  

Traditional safety apps depend on manual triggers — which fail when they matter most.

---

## 🚨 Problem Statement

There is a need for a safety system that:

- ⚡ Works automatically  
- 🎧 Detects danger in real time  
- 🆘 Sends alerts without user input  
- 📡 Works even offline  
- 🛟 Helps women get immediate support  

This project solves that using **AI-based scream detection**.

---

## 💡 Proposed Solution

A mobile app powered by **Edge Impulse’s audio classification model** that detects:

- 🔊 Scream-like audio  
- 🗣️ Distress keywords (“Help”, “Stop”)  
- 🔉 Sudden loud noises  
- 🎙️ Unusual audio patterns  

When danger is detected → **Automatic SOS**, **GPS sharing**, **audio recording**, and **contact alerts**.

---

## 🔥 Key Features

- 🤖 AI-powered scream detection (≥75% confidence)  
- 🧠 Real-time MFCC + CNN audio classification  
- 🚨 Automatic SOS activation  
- 📍 Live GPS sharing  
- 📡 Works offline (on-device inference)  
- 📱 Background monitoring  
- 🎤 Auto audio evidence recording  
- 📳 Fall/struggle detection via accelerometer  

---

## 🛠️ Tech Stack

### 📱 Mobile App
- Flutter / React Native  
- Google Maps API  
- Firebase / Twilio / WhatsApp API  

### 🤖 AI Model
- Edge Impulse Audio Classification  
- MFCC Feature Extraction  
- TensorFlow Lite Deployment  

### 🔌 Sensors & Integrations
- Microphone  
- GPS  
- Accelerometer  

---

## 🔗 Edge Impulse Integration

### 1️⃣ Data Collection
Includes:
- Scream samples  
- Crying / shouting  
- Background noise  
- Talking  
- Silence  
- Keywords: “Help”, “Stop”  

### 2️⃣ Model Training
- MFCC extraction  
- CNN classifier  
- Labels: Scream, Noise, Talking, Silence  
- Accuracy: **82–90%**  

### 3️⃣ Deployment
- Exported as `.tflite`  
- Edge Impulse C++ SDK  

### 4️⃣ Mobile Model Output Example

```json
{
  "Scream": 0.82,
  "Talking": 0.10,
  "Noise": 0.05,
  "Silence": 0.03
}
