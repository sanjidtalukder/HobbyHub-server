# 🎯 HobbyHub Server

This is the **Backend API Server** for the HobbyHub project — a platform where users can create, join, and manage different hobby-based groups.

**Tech Stack:**  
Node.js • Express • MongoDB • Multer • Sharp • dotenv

---

## 📁 Project Structure

📦 HobbyHub Server

├── uploads/ # Stores uploaded images

├── .env # Environment variables

├── server.js # Main backend entry point

├── package.json # Project metadata & dependencies




---

## ⚙️ Key Features

### 🔐 User Management
-  Add new users to the database

### 👥 Group Management
-  Create a group (with or without image)
-  Upload and compress group image
-  Fetch all groups or filter by creator’s email
-  View a single group by ID
-  Update group (with or without image)
-  Delete a group

### 📷 Image Handling
- Image uploads handled via **Multer**
- Image compression via **Sharp** (800px width, 70% quality)
- Original images are auto-deleted after compression

### 🙋 Group Join Requests
- ➕ Send join requests to a group
- 🚫 Prevent duplicate requests or rejoining the same group

---

## 📡 API Endpoints

### 👥 Groups

####  Create Group
POST /api/groups


**Body (JSON):**


#### {
  "name": "Photography Club",
  "description": "For photo lovers",
  "creatorEmail": "john@example.com",
  "category": "Photography",
  "startDate": "2025-06-10",
  "image": "https://..." 
}


#### 🖼️ Update Group With Image


PUT /api/groups/:id/with-image
Form Data (multipart/form-data):


#### image: File (required)

- name, description, category, startDate: Text fields


#### 🔍 Get All Groups

- GET /api/groups

- Query Parameters (optional):

- creatorEmail

- page (default: 0)

- size (default: 100)

#### 🔍 Get Single Group

    GET /api/groups/:id
  ✏️ Update Group Without Image

    - PUT /api/groups/:id
    - Delete Group

     DELETE /api/groups/:id

#### 🙋 Join Requests

    - Send Join Request

    -- POST /api/groups/:id/join-request


#### 🛠 Setup Instructions

    📦 Install Dependencies

      - npm install

      🧪 Create .env File

        PORT=5000

      MONGODB_URI=your_mongodb_connection_string

#### ▶️ Run the Server

 - npm start

# or, for development:

npx nodemon server.js

#### 🚀 Deployment Tips

If you're deploying to platforms like Render, Railway, or Vercel:

✅ Ensure .env variables are configured properly

✅ Make sure uploads/ folder exists on the server

🔄 Alternatively, integrate cloud image storage (like Cloudinary or S3)

#### 🙌 Author
👤 Md Sanjid Talukdar
📧 Email: mdsanjid@gmail.com
📍 Based in Dhaka, Bangladesh
🌐 GitHub: https://github.com/sanjidtalukder

#### 📜 License
This project is developed as part of the Programming Hero initiative.
Feel free to use, modify, or improve with proper attribution.