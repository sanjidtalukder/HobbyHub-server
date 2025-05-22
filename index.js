import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// MongoDB
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    console.log(' MongoDB connected');

    const db = client.db('mdsanjidt');
    const usersCollection = db.collection('users');
    const groupsCollection = db.collection('groups');

    // Create Index for performance
    await groupsCollection.createIndex({ creatorEmail: 1 });

    // Root route
    app.get('/', (req, res) => {
      res.send(' HobbyHub Server is running...');
    });

    // Add user
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // Add group
    app.post('/api/groups', async (req, res) => {
  try {
    const group = req.body;
    if (group.creatorEmail) {
      group.creatorEmail = group.creatorEmail.toLowerCase();
    }
    // Ensure the image field is consistent with frontend key "imageUrl"
    if (group.image) {
      group.imageUrl = group.image;
      delete group.image;
    }
    const result = await groupsCollection.insertOne(group);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to create group" });
  }
});


    // Get groups with all necessary fields
    app.get('/api/groups', async (req, res) => {
      const { creatorEmail, page = 0, size = 100000 } = req.query;
      const query = creatorEmail ? { creatorEmail: creatorEmail.toLowerCase() } : {};

      const groups = await groupsCollection
        .find(query)
        .project({ 
          name: 1, 
          imageUrl: 1,
          description: 1,
          startDate: 1,
          _id: 1,
          category: 1
        })
        .skip(parseInt(page) * parseInt(size))
        .limit(parseInt(size))
        .toArray();

      res.send(groups);
    });

    // Get single group by id
    app.get('/api/groups/:id', async (req, res) => {
      const id = req.params.id;
      const group = await groupsCollection.findOne({ _id: new ObjectId(id) });
      res.send(group);
    });

    // Update group without image
    app.put('/api/groups/:id', async (req, res) => {
      const id = req.params.id;
      const { name, description, category, startDate } = req.body;
      const updatedFields = { name, description, category, startDate };
      const result = await groupsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedFields }
      );
      res.send(result);
    });

    // Update group with image (compressed)
    app.put('/api/groups/:id/with-image', upload.single('image'), async (req, res) => {
      const id = req.params.id;
      const { name, description, category, startDate } = req.body;
      const updatedFields = { name, description, category, startDate };

      if (req.file) {
        const compressedPath = `uploads/compressed-${req.file.filename}`;
        await sharp(req.file.path)
          .resize(800)
          .jpeg({ quality: 70 })
          .toFile(compressedPath);
        fs.unlinkSync(req.file.path); // Delete original uploaded file

        // Use absolute URL for imageUrl
        updatedFields.imageUrl = `${req.protocol}://${req.get('host')}/${compressedPath}`;
      }

      const result = await groupsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedFields }
      );
      res.send(result);
    });

    // Delete group
    app.delete('/api/groups/:id', async (req, res) => {
      const id = req.params.id;
      const result = await groupsCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // newrequest end point
app.post('/api/groups/:id/join-request', async (req, res) => {
  const groupId = req.params.id;
  const { name, email, photo } = req.body;

  if (!email) {
    return res.status(400).send({ error: 'Email is required' });
  }

  try {
    const group = await groupsCollection.findOne({ _id: new ObjectId(groupId) });
    if (!group) {
      return res.status(404).send({ error: 'Group not found' });
    }

    //  joinRequests 
    const alreadyRequested = group.joinRequests?.some(u => u.email === email);
    const alreadyJoined = group.joinedUsers?.some(u => u.email === email);

    if (alreadyRequested || alreadyJoined) {
      return res.status(400).send({ error: 'You have already requested or joined this group.' });
    }

    //new request
    const updatedJoinRequests = [...(group.joinRequests || []), { name, email, photo }];
    await groupsCollection.updateOne(
      { _id: new ObjectId(groupId) },
      { $set: { joinRequests: updatedJoinRequests } }
    );

    res.send({ message: 'Join request sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Failed to send join request' });
  }
});


  } catch (err) {
    console.error(' Error:', err);
  }
}

run();

app.listen(port, () => {
  console.log(` Server is running at http://localhost:${port}`);
});
