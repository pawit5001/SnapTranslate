# 📸 Snap Translate

An AI-powered image translation system for language learning. Supports object detection, image captioning, multi-language translation, and text-to-speech.

![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square&logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-47A248?style=flat-square&logo=mongodb&logoColor=white)
![YOLO](https://img.shields.io/badge/YOLOv8-Object_Detection-00FFFF?style=flat-square&logo=ultralytics&logoColor=black)

---

## 📋 Table of Contents

- [Features](#-features)
- [Requirements](#-requirements)
- [Installation](#-installation)
- [Database Setup](#-database-setup)
- [Usage Guide](#-usage-guide)
- [Project Structure](#-project-structure)
- [AI Models & Services](#-ai-models--services)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### 👤 For Users
- ✅ Register and login with email verification
- ✅ Upload images for AI processing
- ✅ Object detection using YOLOv8
- ✅ Image captioning using BLIP
- ✅ Multi-language translation (50+ languages)
- ✅ Text-to-Speech audio playback
- ✅ AI Image Generation from text prompts
- ✅ View usage history and statistics
- ✅ Submit feedback and ratings
- ✅ Edit profile / Change password

### 👨‍💼 For Administrators
- ✅ Dashboard with system statistics
- ✅ User account management
- ✅ View feedback and ratings from users
- ✅ System usage statistics
- ✅ Discord Webhook notifications
- ✅ API performance monitoring

### 🤖 AI Capabilities
- ✅ **YOLOv8**: Real-time object detection
- ✅ **BLIP**: Automatic image captioning
- ✅ **Google Translate**: 50+ language support
- ✅ **Stable Diffusion XL**: Text-to-image generation
- ✅ **Google TTS**: Multi-language voice synthesis

---

## 💻 Requirements

| Item | Minimum Version |
|------|-----------------|
| Python | 3.8 or higher |
| Node.js | 18.0 or higher |
| MongoDB | 5.0 or higher |
| CUDA | 11.8 or higher (optional, for GPU) |

---

## 🚀 Installation

### Step 1: Clone the Project
```bash
git clone https://github.com/pawit5001/SnapTranslate.git
cd reactjs_snap_translate
```

### Step 2: Install Backend
```bash
# Create Virtual Environment (recommended)
python -m venv venv
venv\Scripts\activate  # For Windows

# Install Dependencies
pip install -r requirements.txt
```

### Step 3: Install Frontend
```bash
npm install
```

### Step 4: Configure Environment File
Create a `.env` file in the root folder:

```env
# Database
MONGODB_URI=mongodb://localhost:27017

# AI Services
HF_API_TOKEN=your_huggingface_api_token

# Authentication
JWT_SECRET_KEY=your_secret_key_here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email (for verification)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Discord Webhook (optional)
DISCORD_WEBHOOK_URL=your_webhook_url
```

### Step 5: Start the Application
```bash
# Run Frontend and Backend together
npm start
```

Access the application:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 🗄️ Database Setup

### Install MongoDB
1. Download and install [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Start MongoDB Service
3. The system will create the database automatically

### Auto-created Collections

| Collection | Description |
|------------|-------------|
| `users` | User data and authentication |
| `feedback` | User feedback and ratings |
| `stats` | System usage statistics |

### Alternative: MongoDB Atlas (Cloud)
1. Create an account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free Cluster
3. Add the Connection String to `.env`

---

## 📖 Usage Guide

### 🔐 Login

#### For Regular Users
- URL: `http://localhost:5173`
- Register a new account or login with Email

#### For Administrators
- Login with Admin account
- Access Dashboard from Admin menu

---

### 👤 User Guide

#### 1. Translate Image
1. Login to the system
2. Click **"Translate"** in the menu
3. Upload an image
4. Select mode:
   - **Object Detection**: Detect objects in the image
   - **Image Captioning**: Generate image description
5. Select target languages
6. Click **"Translate"**
7. View results and listen to audio

#### 2. Create Image from Text
1. Click **"Create Image"** in the menu
2. Type the image description (in English)
3. Click **"Generate"**
4. Wait approximately 10-20 seconds
5. Download or share the image

#### 3. View Usage History
1. Click **"Profile"** in the menu
2. View usage statistics
3. View translation history

#### 4. Submit Feedback
1. Click **"Feedback"** in the menu
2. Rate and write comments
3. Click **"Submit"**

---

### 👨‍💼 Administrator Guide

#### 1. Dashboard
- View system overview statistics
- Total user count
- AI Services usage count

#### 2. Manage Users
1. Go to **"Manage Users"**
2. View all users
3. View user status and information

#### 3. View Feedback
1. Go to **"Feedback Stats"**
2. View user feedback and ratings
3. Analyze satisfaction levels

#### 4. Configure Discord Webhook
1. Go to **"Webhook Settings"**
2. Enter Discord Webhook URL
3. Receive notifications for important activities

---

## 📁 Project Structure

```
reactjs_snap_translate/
├── backend/                          # FastAPI Backend
│   ├── main.py                       # Application entry point
│   ├── database.py                   # MongoDB connection
│   ├── auth/                         # Authentication system
│   │   ├── routes.py                 # Auth API routes
│   │   ├── auth_utils.py             # JWT Utilities
│   │   ├── models.py                 # User Models
│   │   └── service/                  # Business Logic
│   ├── routes/                       # API Routes
│   │   ├── analyze.py                # Image analysis
│   │   ├── generate_image.py         # Image generation
│   │   ├── languages.py              # Language list
│   │   ├── admin.py                  # Admin Functions
│   │   ├── feedback.py               # Feedback system
│   │   └── stats.py                  # Statistics
│   ├── services/                     # AI Services
│   │   ├── yolo_service.py           # YOLO Object Detection
│   │   ├── blip_service.py           # BLIP Image Captioning
│   │   ├── translate.py              # Google Translate
│   │   ├── generate_image.py         # Stable Diffusion
│   │   ├── tts.py                    # Text-to-Speech
│   │   └── discord_webhook_service.py
│   └── config/                       # Configuration
│
├── src/                              # React Frontend
│   ├── components/                   # React Components
│   │   ├── LandingPage.jsx           # Home page
│   │   ├── TranslatePage.jsx         # Translation page
│   │   ├── CreateImagePage.jsx       # Image creation page
│   │   ├── LoginPage.jsx             # Login page
│   │   ├── RegisterPage.jsx          # Registration page
│   │   └── admin/                    # Admin Components
│   │       ├── Dashboard.jsx
│   │       ├── ManageUsers.jsx
│   │       └── FeedbackStats.jsx
│   ├── contexts/                     # React Contexts
│   │   └── AuthContext.jsx           # Authentication State
│   ├── api/                          # API Client
│   └── App.jsx                       # Main App
│
├── yolo_train/                       # YOLO Training
│   ├── train.ipynb                   # Training Notebook
│   ├── test.ipynb                    # Testing Notebook
│   ├── yolov8s.pt                    # Production Model
│   └── coco128/                      # Training Dataset
│
├── uploads/                          # Uploaded images
├── tts_cache/                        # Generated audio files
├── package.json                      # Node.js Dependencies
├── vite.config.js                    # Vite Config
└── README.md                         # This file
```

---

## 🤖 AI Models & Services

### Object Detection (YOLOv8)
- **Model**: `yolov8s.pt`
- **Purpose**: Detect objects in images
- **Output**: Detected object names → Translated to multiple languages

### Image Captioning (BLIP)
- **Model**: Salesforce BLIP-base
- **Purpose**: Generate automatic image descriptions
- **Used when**: No clear objects detected in image

### Text Translation (Google Translate)
- **Service**: Google Translate API
- **Supports**: 50+ languages

### Image Generation (Stable Diffusion)
- **Model**: SDXL 1.0 via Hugging Face
- **Purpose**: Generate images from text prompts

### Text-to-Speech (Google TTS)
- **Service**: Google Text-to-Speech
- **Purpose**: Voice pronunciation of translations
- **Cache**: Audio files stored in `tts_cache/`

---

## 🔧 Troubleshooting

### ❌ Backend Not Working
- Check Python version: `python --version` (must be 3.8+)
- Install dependencies: `pip install -r requirements.txt`
- Check if MongoDB is running
- Verify `.env` file is correct

### ❌ Frontend Not Displaying
- Check Node.js version: `node --version` (must be 18+)
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Check port 5173 is not in use

### ❌ AI Features Not Working
- Check `HF_API_TOKEN` in `.env` file
- Check internet connection
- Verify YOLO model exists at `yolo_train/yolov8s.pt`

### ❌ Database Connection Failed
- Check MongoDB is running: `mongod --version`
- Check `MONGODB_URI` in `.env` file
- Test: `mongosh mongodb://localhost:27017`

### ❌ Email Not Sending
- Check SMTP settings in `.env` file
- For Gmail, use App Password
- Enable 2-Factor Authentication first

---

## 📊 System Performance

### AI Service Benchmarks
| Service | Average Time |
|---------|-------------|
| YOLO Object Detection | ~50ms/image |
| BLIP Captioning | ~2-3 seconds/image |
| Google Translate | ~100ms/translation |
| Stable Diffusion | ~10-20 seconds/image |
| Google TTS | ~200ms/audio file |

### System Requirements
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 10GB for Models and Cache
- **Network**: Stable internet for AI APIs
- **GPU**: NVIDIA GPU + CUDA 11.8+ (recommended but optional)

---

## 👨‍💻 Developer

- **Project**: Snap Translate - AI Image Translation App
- **GitHub**: [pawit5001/SnapTranslate](https://github.com/pawit5001/SnapTranslate)

---

## 📄 License

MIT License - Free to use and modify
