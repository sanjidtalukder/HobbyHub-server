import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve static files from uploads

// MongoDB setup
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
});

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

async function run() {
  try {
    await client.connect();
    const db = client.db('mdsanjidt');
    const usersCollection = db.collection('users');
    const groupsCollection = db.collection('groups');

    // Root
    app.get('/', (req, res) => {
      res.send('HobbyHub Server is running...');
    });

    // Users
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // Groups
    app.post('/api/groups', async (req, res) => {
      const group = req.body;
      group.creatorEmail = group.creatorEmail?.toLowerCase();
      const result = await groupsCollection.insertOne(group);
      res.send(result);
    });

    app.get('/api/groups', async (req, res) => {
      const creatorEmail = req.query.creatorEmail;
      let query = {};
      if (creatorEmail) {
        query.creatorEmail = creatorEmail.toLowerCase();
      }
      const result = await groupsCollection.find(query).toArray();
      res.send(result);
    });

    app.get('/api/groups/:id', async (req, res) => {
      const id = req.params.id;
      const group = await groupsCollection.findOne({ _id: new ObjectId(id) });
      res.send(group);
    });

    //  Update group WITHOUT image
    app.put('/api/groups/:id', async (req, res) => {
      const id = req.params.id;
      const { name, description } = req.body;

      try {
        const result = await groupsCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              name,
              description,
            },
          }
        );
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Group update failed' });
      }
    });

    //  Optional: Update WITH image if FormData is used
    app.put('/api/groups/:id/with-image', upload.single('image'), async (req, res) => {
      const id = req.params.id;
      const { name, description } = req.body;

      const updatedFields = {
        name,
        description,
      };

      if (req.file) {
        updatedFields.imageUrl = `/uploads/${req.file.filename}`;
      }

      try {
        const result = await groupsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedFields }
        );
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Image update failed' });
      }
    });

    // Delete group
    app.delete('/api/groups/:id', async (req, res) => {
      const id = req.params.id;
      const result = await groupsCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    console.log(' MongoDB connected successfully');
  } catch (err) {
    console.error(' MongoDB connection failed:', err);
  }
}

run();

app.listen(port, () => {
  console.log(` Server is running on http://localhost:${port}`);
});
