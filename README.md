# 🎯 HobbyHub Server

This is the **Backend API Server** for the [HobbyHub](https://github.com/your-client-repo) project — a platform that allows users to create, join, and manage hobby groups.

Powered by:  
**Node.js | Express | MongoDB | Multer | Sharp | dotenv**

---

## 📁 Project Structure

📦 HobbyHub Server
├── uploads/ # Uploaded images directory
├── .env # Environment variables
├── server.js # Main entry point
├── package.json

markdown
Copy
Edit

---

## ⚙️ Features

- 🔐 **User Management**  
  - Add new users to the database

- 👥 **Group Management**
  - Create group (with optional image upload)
  - Fetch all groups or by creator's email
  - View a single group by ID
  - Update group (with or without new image)
  - Delete group

- 📷 **Image Upload & Compression**
  - Upload and compress images using `Multer` and `Sharp`

- 🙋 **Join Requests**
  - Send join requests to any group
  - Prevent duplicate requests or rejoining

---

## 🔌 API Endpoints

### 👤 User

#### ➕ POST `/users`
Create a new user  
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
👥 Groups
➕ POST /api/groups
Create a group with optional image field
Body:

json
Copy
Edit
{
  "name": "Photography Club",
  "description": "For all photo lovers",
  "creatorEmail": "john@example.com",
  "category": "Art",
  "startDate": "2025-06-15",
  "image": "https://example.com/sample.jpg"
}
📷 POST /api/groups/:id/with-image
Update a group with a new image
Form Data:

image (File)

name, description, category, startDate (Text)

🔍 GET /api/groups
Fetch all groups or filter by creatorEmail
Query Parameters:

creatorEmail (optional)

page (default 0)

size (default 100)

🔍 GET /api/groups/:id
Get a single group by ID

✏️ PUT /api/groups/:id
Update group info (without image)

❌ DELETE /api/groups/:id
Delete a group by ID

🙋 Join Requests
➕ POST /api/groups/:id/join-request
Send a join request to a group
Body:

json
Copy
Edit
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "photo": "https://example.com/jane.jpg"
}
🖼 Image Handling
Uploads are saved under /uploads

Original image is compressed to 800px width at 70% quality using Sharp

Original is deleted after compression

🛠 Setup & Run
📦 Install Dependencies
bash
Copy
Edit
npm install
📁 Create .env File
env
Copy
Edit
PORT=5000
MONGODB_URI=your_mongodb_connection_string
▶️ Run the Server
bash
Copy
Edit
npm start
Or in development mode:

bash
Copy
Edit
npx nodemon server.js
🚀 Deployment
For deployment on platforms like Render, Railway, or Vercel (Backend):

Make sure .env variables are configured

Ensure uploads/ directory exists or handle cloud storage if needed

🙌 Author
👤 Md Sanjid Talukdar
📧 Email: mdsanjid@gmsil.com
📍 Based in Dhaka, Bangladesh
🌐 GitHub: https://github.com/sanjidtalukder

📜 License
This project is licensed under the Programming Hero.