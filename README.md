# 📸 Snap Translate

An AI-powered image translation and processing application that combines computer vision, natural language processing, and text-to-speech technologies. Users can upload images to detect objects, generate captions, translate content to multiple languages, create new images from text, and listen to pronunciations.

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
- [Environment Configuration](#-environment-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Usage Guide](#-usage-guide)
- [Project Structure](#-project-structure)
- [AI Models & Services](#-ai-models--services)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### 👤 For Users (Students)
- ✅ Register and login with email verification
- ✅ Upload images for AI processing
- ✅ Object detection using YOLOv8
- ✅ Image captioning using BLIP
- ✅ Multi-language text translation (50+ languages)
- ✅ Text-to-speech audio generation
- ✅ Image generation from text prompts
- ✅ View processing history and statistics
- ✅ Submit feedback and ratings
- ✅ Profile management and password change

### 👨‍💼 For Administrators
- ✅ Dashboard with system analytics
- ✅ User account management
- ✅ Monitor user feedback and ratings
- ✅ System usage statistics
- ✅ Discord webhook notifications
- ✅ API performance monitoring
- ✅ Content moderation tools

### 🤖 AI Capabilities
- ✅ **YOLOv8 Object Detection**: Real-time object recognition
- ✅ **BLIP Image Captioning**: Advanced image description generation
- ✅ **Google Translate**: Multi-language text translation
- ✅ **Stable Diffusion XL**: High-quality image generation
- ✅ **Google Text-to-Speech**: Natural voice synthesis

---

## � Requirements

| Component | Minimum Version |
|-----------|-----------------|
| Python | 3.8 or higher |
| Node.js | 18.0 or higher |
| MongoDB | 5.0 or higher |
| CUDA | 11.8 or higher (optional, for GPU acceleration) |

### Python Dependencies
- FastAPI
- Uvicorn
- Motor (MongoDB async driver)
- Ultralytics (YOLO)
- Transformers (BLIP)
- Deep Translator
- GTTs (Text-to-Speech)
- Python-dotenv
- Requests

### Node.js Dependencies
- React 19
- Vite
- Tailwind CSS
- Axios
- React Toastify
- Lucide React

---

## 🚀 Installation

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd reactjs_snap_translate
```

### Step 2: Backend Setup
```bash
# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

### Step 3: Frontend Setup
```bash
# Install Node.js dependencies
npm install
```

### Step 4: Database Setup
See [Database Setup](#-database-setup) section below.

### Step 5: Environment Configuration
See [Environment Configuration](#-environment-configuration) section below.

---

## 🗄️ Database Setup

### Install MongoDB
1. Download and install MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. Create database named `snaptranslate`

### Alternative: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get connection string

### Database Collections
The application automatically creates the following collections:
- `users` - User accounts and authentication
- `feedback` - User feedback and ratings
- `stats` - Usage statistics and analytics

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017

# AI Services
HF_API_TOKEN=your_huggingface_api_token_here

# Authentication
JWT_SECRET_KEY=your_super_secret_jwt_key_here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email (for verification)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Discord Webhook (optional)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook_id/your_webhook_token
```

### Getting API Tokens

#### Hugging Face Token
1. Create account at [Hugging Face](https://huggingface.co)
2. Go to Settings → Access Tokens
3. Create new token with "Read" permissions
4. Add to `.env` as `HF_API_TOKEN`

#### Discord Webhook (Optional)
1. Create Discord server
2. Go to Server Settings → Integrations → Webhooks
3. Create new webhook
4. Copy webhook URL to `.env`

---

## ▶️ Running the Application

### Development Mode
```bash
# Start both frontend and backend simultaneously
npm start
```

This runs:
- Backend API server on `http://localhost:8000`
- Frontend React app on `http://localhost:5173`

### Manual Startup

#### Backend Only
```bash
# From project root
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Only
```bash
npm run dev
```

### Production Build
```bash
# Build frontend for production
npm run build

# Start production server
npm run preview
```

---

## 📚 API Documentation

### Interactive API Docs
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Main Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User authentication |
| POST | `/auth/register` | User registration |
| POST | `/analyze/` | Image analysis (object detection/captioning) |
| POST | `/generate/image` | Generate image from text |
| GET | `/languages` | Get supported languages |
| GET | `/admin/users` | Admin: List users |
| POST | `/feedback/submit` | Submit user feedback |

### API Response Example
```json
{
  "original": "cat",
  "th": "แมว",
  "audio_url": "/audio/th_cat.mp3",
  "translations": [
    {
      "language": "Spanish",
      "text": "gato",
      "audio_url": "/audio/es_cat.mp3"
    }
  ]
}
```

---

## 🏗️ Project Architecture

```
reactjs_snap_translate/
├── backend/                          # FastAPI Backend
│   ├── main.py                       # Application entry point
│   ├── database.py                   # MongoDB connection
│   ├── auth/                         # Authentication system
│   │   ├── routes.py                 # Auth API endpoints
│   │   ├── auth_utils.py             # JWT utilities
│   │   ├── models.py                 # User data models
│   │   └── service/                  # Auth business logic
│   ├── routes/                       # Feature API routes
│   │   ├── analyze.py                # Image analysis
│   │   ├── generate_image.py         # Image generation
│   │   ├── languages.py              # Language support
│   │   ├── admin.py                  # Admin functions
│   │   ├── feedback.py               # Feedback system
│   │   └── stats.py                  # Analytics
│   ├── services/                     # AI Service integrations
│   │   ├── yolo_service.py           # YOLO object detection
│   │   ├── blip_service.py           # BLIP image captioning
│   │   ├── translate.py              # Google Translate
│   │   ├── generate_image.py         # Stable Diffusion
│   │   ├── tts.py                    # Google TTS
│   │   └── discord_webhook_service.py # Admin notifications
│   └── config/                       # Configuration
│       ├── languages.py              # Language settings
│       └── models/                   # Data models
├── src/                              # React Frontend
│   ├── components/                   # UI Components
│   │   ├── LandingPage.jsx           # Home page
│   │   ├── TranslatePage.jsx         # Main translation interface
│   │   ├── CreateImagePage.jsx       # Image generation
│   │   ├── LoginPage.jsx             # Authentication
│   │   ├── admin/                    # Admin components
│   │   │   ├── Dashboard.jsx         # Admin dashboard
│   │   │   ├── ManageUsers.jsx       # User management
│   │   │   └── FeedbackStats.jsx     # Feedback analytics
│   │   └── Modal.jsx                 # Reusable modal
│   ├── contexts/                     # React contexts
│   │   └── AuthContext.jsx           # Authentication state
│   ├── api/                          # API client functions
│   └── App.jsx                       # Main app component
├── yolo_train/                       # YOLO Model Training
│   ├── train.ipynb                   # Training notebook
│   ├── test.ipynb                    # Testing notebook
│   ├── yolov8s.pt                    # Production YOLO model
│   ├── yolo11n.pt                    # Alternative model
│   ├── coco128/                      # Training dataset
│   ├── class-descriptions-boxable.csv # Open Images classes
│   ├── train-annotations-bbox.csv     # Training annotations
│   └── README.md                     # Training documentation
├── public/                           # Static assets
├── uploads/                          # User uploaded images
├── tts_cache/                        # Generated audio files
├── package.json                      # Node.js dependencies
├── vite.config.js                    # Vite configuration
├── tailwind.config.js                # Tailwind CSS config
└── README.md                         # This documentation
```

---

## 🤖 AI Models & Services

### Object Detection (YOLOv8)

#### Model Overview
- **Primary Model**: `yolov8s.pt` (located in `yolo_train/`)
- **Purpose**: Detect objects in user-uploaded images for translation
- **Integration**: `backend/services/yolo_service.py`
- **Output**: Object class names that get translated to multiple languages
- **Classification**: Automatically categorizes objects as "living" or "non-living"

#### Training Infrastructure
The `yolo_train/` folder contains complete training infrastructure for YOLO models:

**Training Capabilities:**
- ✅ Train YOLOv8/YOLO11 models on custom datasets
- ✅ Pre-trained model support (yolov8s.pt, yolo11n.pt)
- ✅ COCO128 dataset included for quick testing
- ✅ Configurable training parameters (epochs, batch size, image size)
- ✅ Automatic dataset download and extraction
- ✅ Model validation and metrics calculation

**Requirements:**
- Python 3.8+
- PyTorch 2.0+
- CUDA 11.8+ (for GPU training)
- ultralytics library

#### Dataset Setup

**Using COCO128 (Default):**
The COCO128 dataset is automatically downloaded when running training notebooks.

**Custom Dataset for Snap Translate:**
To train models optimized for common user-uploaded objects:

1. Prepare dataset in YOLO format:
   ```
   dataset/
   ├── images/
   │   ├── train/
   │   └── val/
   └── labels/
       ├── train/
       └── val/
   ```

2. Create `data.yaml`:
   ```yaml
   train: dataset/images/train
   val: dataset/images/val
   nc: 80  # number of classes
   names: [
     "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat", "traffic light",
     "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat", "dog", "horse", "sheep", "cow",
     "elephant", "bear", "zebra", "giraffe", "backpack", "umbrella", "handbag", "tie", "suitcase", "frisbee",
     "skis", "snowboard", "sports ball", "kite", "baseball bat", "baseball glove", "skateboard", "surfboard",
     "tennis racket", "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple",
     "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair", "couch",
     "potted plant", "bed", "dining table", "toilet", "tv", "laptop", "mouse", "remote", "keyboard", "cell phone",
     "microwave", "oven", "toaster", "sink", "refrigerator", "book", "clock", "vase", "scissors", "teddy bear",
     "hair drier", "toothbrush"
   ]
   ```

#### Training Process

**Using Jupyter Notebooks:**
1. Open `yolo_train/train.ipynb`
2. Run cells in order to install dependencies, download datasets, and train models

**Training Parameters:**
```python
from ultralytics import YOLO

model = YOLO("yolov8s.pt")  # Load pre-trained model
model.train(
    data="coco128.yaml",  # Dataset configuration
    epochs=50,            # Number of training epochs
    imgsz=640,            # Image size
    batch=16,             # Batch size
    device=0              # GPU device (0) or 'cpu'
)
```

**Custom Training for Better Performance:**
```python
model.train(
    data="your_custom_data.yaml",
    epochs=100,           # More epochs for custom training
    imgsz=640,
    batch=8,              # Smaller batch for memory
    device='cpu'          # Use CPU if no GPU available
)
```

#### Testing & Inference

**Using Test Notebook:**
1. Open `yolo_train/test.ipynb`
2. Load trained models and run inference on sample images
3. View detection results with bounding boxes and confidence scores

**Inference Code:**
```python
from ultralytics import YOLO
import cv2

# Load model
model = YOLO("yolov8s.pt")

# Run inference
results = model("path/to/image.jpg")

# Display results
for result in results:
    result.show()
```

#### Model Integration in Snap Translate

The trained models integrate seamlessly with the web application:

```python
# backend/services/yolo_service.py
from ultralytics import YOLO

yolo_model = YOLO("yolov8s.pt")  # Production model

def detect_object(image):
    results = yolo_model(image)[0]
    if len(results.boxes) == 0:
        return None
    # Get highest confidence detection
    best_box = max(results.boxes, key=lambda b: b.conf.cpu().item())
    return yolo_model.model.names[int(best_box.cls.cpu().item())]
```

**Object Classification Logic:**
```python
# Classify as living or non-living for better UX
detected_image_class = "living" if any(keyword in label.lower() for keyword in [
    "animal", "human", "bird", "fish", "insect", "cat", "dog"
]) else "non-living"
```

#### Replacing Production Models

To use custom trained models:
1. Train your model using `yolo_train/train.ipynb`
2. Save as `my_custom_model.pt`
3. Update `backend/services/yolo_service.py`:
   ```python
   yolo_model = YOLO("yolo_train/my_custom_model.pt")
   ```
4. Restart the web application

#### Project Structure
```
yolo_train/
├── train.ipynb                    # Training notebook
├── test.ipynb                     # Testing notebook
├── yolov8s.pt                     # Production model (active)
├── yolo11n.pt                     # Alternative model
├── coco128/                       # Training dataset
├── class-descriptions-boxable.csv # Open Images classes
├── train-annotations-bbox.csv     # Training annotations
└── data.yaml                      # Dataset configuration
```

#### Performance Metrics
After training, evaluate model performance:
```python
metrics = model.val()
print(f"mAP@0.5: {metrics.box.map50}")
print(f"mAP@0.5:0.95: {metrics.box.map}")
```

#### Troubleshooting
- **CUDA/GPU Issues**: Use `device='cpu'` for CPU training
- **Memory Issues**: Reduce batch size or image size
- **Model Loading**: Ensure paths are correct in `yolo_service.py`
- **Dataset Errors**: Verify `data.yaml` paths and file permissions

### Image Captioning (BLIP)
- **Model**: Salesforce BLIP-base
- **Purpose**: Generate descriptive text for images
- **Integration**: `backend/services/blip_service.py`
- **Use Case**: When object detection doesn't find clear objects

### Text Translation (Google Translate)
- **Service**: Google Translate API
- **Purpose**: Translate detected objects/captions to multiple languages
- **Integration**: `backend/services/translate.py`
- **Languages**: 50+ supported languages

### Image Generation (Stable Diffusion)
- **Model**: SDXL 1.0 via Hugging Face
- **Purpose**: Create images from text prompts
- **Integration**: `backend/services/generate_image.py`
- **API**: Hugging Face Inference API

### Text-to-Speech (Google TTS)
- **Service**: Google Text-to-Speech
- **Purpose**: Generate audio pronunciations
- **Integration**: `backend/services/tts.py`
- **Caching**: Audio files stored in `tts_cache/`

---

## 📖 Usage Guide

### For Users

#### 1. Getting Started
1. Visit the application homepage
2. Register a new account or login
3. Upload an image for processing

#### 2. Image Translation
1. Click "Upload Image" on the main page
2. Choose between "Object Detection" or "Image Captioning" mode
3. Select target languages for translation
4. Click "Translate" to process
5. Listen to pronunciations and view translations

#### 3. Image Generation
1. Navigate to "Create Image" section
2. Enter a text description
3. Click "Generate" to create new images
4. Download or share generated images

#### 4. Profile Management
- Update personal information
- Change password
- View usage statistics
- Submit feedback

### For Administrators

#### Dashboard Access
- Login with admin credentials
- View system analytics and statistics
- Monitor user activity and feedback

#### User Management
- View all registered users
- Monitor user engagement metrics
- Review user feedback and ratings

#### System Monitoring
- Track API usage patterns
- Monitor AI service performance
- Review system health metrics

---

## 💻 Development

### Setting up Development Environment
```bash
# Clone repository
git clone <repository-url>
cd reactjs_snap_translate

# Backend setup
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend setup
npm install

# Start development servers
npm start
```

### Code Structure Guidelines

#### Backend (FastAPI)
- Use async/await for all database operations
- Implement proper error handling with HTTPException
- Use Pydantic models for request/response validation
- Follow RESTful API design principles

#### Frontend (React)
- Use functional components with hooks
- Implement proper state management
- Follow component composition patterns
- Use TypeScript for type safety (future enhancement)

### Testing
```bash
# Backend tests
pytest

# Frontend tests
npm test

# Manual testing
# - Test all API endpoints
# - Test user workflows
# - Test admin features
# - Test AI integrations
```

### Contributing
1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

---

## 🚀 Deployment

### Backend Deployment
```bash
# Install production dependencies
pip install fastapi uvicorn[standard]

# Run with uvicorn
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Serve static files (nginx/apache)
```

### Docker Deployment
```dockerfile
# Dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Setup
- Set up MongoDB database
- Configure environment variables
- Set up reverse proxy (nginx)
- Configure SSL certificates
- Set up monitoring and logging

---

## 🔧 Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check Python version
python --version  # Should be 3.8+

# Check dependencies
pip list

# Check MongoDB connection
python -c "from backend.database import get_db; print('DB connected')"
```

#### Frontend Won't Load
```bash
# Clear node modules
rm -rf node_modules && npm install

# Check Node.js version
node --version  # Should be 18+

# Check build
npm run build
```

#### AI Services Not Working
```bash
# Check API keys in .env
cat .env

# Test YOLO model
python -c "from ultralytics import YOLO; model = YOLO('yolo_train/yolov8s.pt'); print('Model loaded')"

# Test internet connectivity
curl https://api-inference.huggingface.co
```

#### Database Connection Issues
```bash
# Check MongoDB status
mongod --version
ps aux | grep mongod

# Test connection
mongosh mongodb://localhost:27017
```

### Performance Optimization
- Use GPU for AI processing when available
- Implement caching for TTS audio files
- Optimize image processing pipelines
- Use connection pooling for database

### Monitoring
- Monitor API response times
- Track AI service usage
- Monitor database performance
- Set up error logging and alerting

---

## 📊 Performance Metrics

### AI Service Benchmarks
- **YOLO Object Detection**: ~50ms per image
- **BLIP Captioning**: ~2-3 seconds per image
- **Google Translate**: ~100ms per translation
- **Stable Diffusion**: ~10-20 seconds per image
- **Google TTS**: ~200ms per audio file

### System Requirements
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 10GB for models and cache
- **Network**: Stable internet for AI APIs
- **GPU**: NVIDIA GPU with CUDA 11.8+ (optional but recommended)

---

## � Developer

- **Project**: Snap Translate - AI Image Translation App
- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: FastAPI + Python + MongoDB
- **AI Stack**: YOLOv8, BLIP, Google Translate, Stable Diffusion, Google TTS

---

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

---

## 🙏 Acknowledgments

- **Ultralytics** for YOLO object detection
- **Salesforce** for BLIP image captioning
- **Google** for Translate and Text-to-Speech services
- **Hugging Face** for Stable Diffusion API
- **MongoDB** for database services
- **React & FastAPI** communities for excellent frameworks
Once the backend is running, visit:
- **API Docs**: `http://localhost:8000/docs` (Swagger UI)
- **Alternative Docs**: `http://localhost:8000/redoc`

### Main API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | User login |
| `/auth/register` | POST | User registration |
| `/auth/verify-email` | POST | Email verification |
| `/analyze/upload` | POST | Upload and analyze image |
| `/generate/image` | POST | Generate image from text |
| `/languages` | GET | Get supported languages |
| `/admin/users` | GET | Get all users (admin) |
| `/feedback/submit` | POST | Submit user feedback |
| `/stats/overview` | GET | Get system statistics |

---

## 📁 Project Structure

```
reactjs_snap_translate/
├── backend/                          # FastAPI Backend
│   ├── main.py                       # Main application
│   ├── database.py                   # MongoDB connection
│   ├── auth/                         # Authentication system
│   │   ├── routes.py                 # Auth API routes
│   │   ├── auth_utils.py             # Auth utilities
│   │   ├── models.py                 # User models
│   │   └── service/                  # Auth services
│   ├── routes/                       # API routes
│   │   ├── analyze.py                # Image analysis
│   │   ├── generate_image.py         # Image generation
│   │   ├── languages.py              # Language support
│   │   ├── admin.py                  # Admin functions
│   │   ├── feedback.py               # Feedback system
│   │   └── stats.py                  # Statistics
│   ├── services/                     # AI Services
│   │   ├── blip_service.py           # Image captioning
│   │   ├── yolo_service.py           # Object detection
│   │   ├── translate.py              # Text translation
│   │   ├── generate_image.py         # Image generation
│   │   ├── tts.py                    # Text-to-speech
│   │   └── discord_webhook_service.py # Notifications
│   └── config/                       # Configuration
│       ├── languages.py              # Language settings
│       └── models/                   # Data models
├── src/                              # React Frontend
│   ├── components/                   # React components
│   │   ├── LandingPage.jsx           # Home page
│   │   ├── TranslatePage.jsx         # Translation interface
│   │   ├── CreateImagePage.jsx       # Image generation
│   │   ├── LoginPage.jsx             # Authentication
│   │   ├── admin/                    # Admin components
│   │   └── Modal.jsx                 # UI modals
│   ├── contexts/                     # React contexts
│   │   └── AuthContext.jsx           # Authentication context
│   ├── api/                          # API client functions
│   └── App.jsx                       # Main app component
├── yolo_train/                       # YOLO Model Training & Fine-tuning
│   ├── train.ipynb                   # Training notebook for YOLO models
│   ├── test.ipynb                    # Testing notebook for trained models
│   ├── yolov8s.pt                    # YOLOv8s model (used by the app)
│   ├── yolo11n.pt                    # YOLO11n model (alternative)
│   ├── coco128/                      # COCO128 training dataset
│   ├── class-descriptions-boxable.csv # Open Images class definitions
│   ├── train-annotations-bbox.csv     # Open Images annotations
│   └── README.md                     # YOLO training documentation
├── public/                           # Static assets
├── uploads/                          # User uploaded images
├── tts_cache/                        # Generated audio files
├── package.json                      # Node.js dependencies
├── vite.config.js                    # Vite configuration
├── tailwind.config.js                # Tailwind CSS config
└── README.md                         # This file
```

---

## 🏃‍♂️ YOLO Model Training

Snap Translate includes a complete YOLO training environment for fine-tuning object detection models:

### Quick Training Setup
```bash
cd yolo_train
pip install ultralytics opencv-python matplotlib
jupyter notebook train.ipynb
```

### Using Custom Trained Models
1. Train your model using the notebooks in `yolo_train/`
2. Replace `yolov8s.pt` with your trained model
3. The model will be automatically loaded by the application

### Training Documentation
See the [Object Detection (YOLOv8)](#object-detection-yolov8) section above for comprehensive training instructions, dataset setup, and model integration details.

---

## 🔧 Troubleshooting

### ❌ Backend Won't Start
- Check Python version: `python --version` (must be 3.8+)
- Install missing dependencies: `pip install -r requirements.txt`
- Verify MongoDB is running
- Check `.env` file exists with correct values

### ❌ Frontend Won't Load
- Check Node.js version: `node --version` (must be 18+)
- Clear node_modules: `rm -rf node_modules && npm install`
- Check for port conflicts (5173)

### ❌ AI Features Not Working
- Verify API tokens in `.env` file
- Check internet connection for external APIs
- Ensure CUDA is installed for GPU acceleration (optional)

### ❌ Database Connection Issues
- Verify MongoDB is running: `mongod --version`
- Check connection string in `.env`
- Test connection: `mongosh mongodb://localhost:27017`

### ❌ CORS Errors
- Backend allows `http://localhost:5173` by default
- Add your domain to `allow_origins` in `backend/main.py` for production

---

## 🚀 Deployment

### Backend Deployment
```bash
# Install production dependencies
pip install fastapi uvicorn[standard]

# Run with uvicorn
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Serve static files
npm run preview
```

### Docker Deployment (Optional)
```dockerfile
# Dockerfile example
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 👥 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Developer

- **Project**: Snap Translate - AI Image Translation App
- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: FastAPI + Python + MongoDB
- **AI Models**: YOLOv8, BLIP, Stable Diffusion, Google Translate, Google TTS

---

## 🙏 Acknowledgments

- **Ultralytics** for YOLO object detection
- **Salesforce** for BLIP image captioning
- **Hugging Face** for Stable Diffusion API
- **Google** for Translate and Text-to-Speech services
- **MongoDB** for database services
