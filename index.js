import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // serve uploaded images

// MongoDB Setup
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
});

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

async function run() {
  try {
    await client.connect();
    const db = client.db('mdsanjidt');
    const usersCollection = db.collection('users');
    const groupsCollection = db.collection('groups');

    // Users API
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // Create Group
    app.post('/api/groups', async (req, res) => {
      const group = req.body;
      group.creatorEmail = group.creatorEmail?.toLowerCase();
      const result = await groupsCollection.insertOne(group);
      res.send(result);
    });

    // Get All Groups
    app.get('/api/groups', async (req, res) => {
      let query = {};
      const creatorEmail = req.query.creatorEmail;
      if (creatorEmail) {
        query.creatorEmail = creatorEmail.toLowerCase();
      }
      const result = await groupsCollection.find(query).toArray();
      res.send(result);
    });

    // Get Single Group
    app.get('/api/groups/:id', async (req, res) => {
      const id = req.params.id;
      const group = await groupsCollection.findOne({ _id: new ObjectId(id) });
      res.send(group);
    });

    // ✅ Update Group with optional file upload
    app.put('/api/groups/:id', upload.single('image'), async (req, res) => {
      const id = req.params.id;
      const updatedFields = {
        name: req.body.name,
        description: req.body.description,
      };

      if (req.file) {
        updatedFields.imageUrl = `/uploads/${req.file.filename}`;
      }

      const result = await groupsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedFields }
      );
      res.send(result);
    });

    // Delete Group
    app.delete('/api/groups/:id', async (req, res) => {
      const id = req.params.id;
      const result = await groupsCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  }
}

run();

app.get('/', (req, res) => {
  res.send('HobbyHub Server is running...');
});

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
