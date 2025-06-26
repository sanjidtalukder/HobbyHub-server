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

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Multer setup
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
if (!uri) {
  console.error("MongoDB URI missing in .env");
  process.exit(1);
}
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    console.log('MongoDB connected');

    const db = client.db('mdsanjidt');
    const usersCollection = db.collection('users');
    const groupsCollection = db.collection('groups');

    app.get('/', (req, res) => {
      res.send('HobbyHub Server is running...');
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
        const { name, description, creatorEmail, category, startDate, imageUrl } = group;

        if (!name || !description || !creatorEmail) {
          return res.status(400).send({ error: "Missing required fields" });
        }

        group.creatorEmail = creatorEmail.toLowerCase();
        group.createdAt = new Date();
        group.status = 'pending'; // ensure new groups have default status
        if (imageUrl) group.imageUrl = imageUrl;

        const result = await groupsCollection.insertOne(group);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to create group" });
      }
    });

    // Get groups with pagination
    app.get('/api/groups', async (req, res) => {
      const { creatorEmail, page = 0, size = 100 } = req.query;
      const query = creatorEmail ? { creatorEmail: creatorEmail.toLowerCase() } : {};

      const groups = await groupsCollection
        .find(query)
        .project({ name: 1, imageUrl: 1, description: 1, startDate: 1, _id: 1, category: 1 })
        .skip(parseInt(page) * parseInt(size))
        .limit(parseInt(size))
        .toArray();

      res.send(groups);
    });

    // Get single group
    app.get('/api/groups/:id', async (req, res) => {
      const id = req.params.id;
      const group = await groupsCollection.findOne({ _id: new ObjectId(id) });
      res.send(group);
    });

    // Update group with image and validation
    app.put('/api/groups/:id/with-image', upload.single('image'), async (req, res) => {
      const id = req.params.id;
      const { name, description, category, startDate, creatorEmail } = req.body;

      try {
        const group = await groupsCollection.findOne({ _id: new ObjectId(id) });

        if (!group) return res.status(404).send({ error: "Group not found" });
        if (creatorEmail?.toLowerCase() !== group.creatorEmail)
          return res.status(403).send({ error: "User not valid" });

        const updatedFields = {};
        if (description) updatedFields.description = description;
        if (category) updatedFields.category = category;
        if (startDate) updatedFields.startDate = startDate;

        if (req.file) {
          const compressedPath = `uploads/compressed-${req.file.filename}`;
          await sharp(req.file.path)
            .resize(800)
            .jpeg({ quality: 70 })
            .toFile(compressedPath);
          fs.unlinkSync(req.file.path);
          updatedFields.imageUrl = `${req.protocol}://${req.get("host")}/${compressedPath}`;
        }

        const result = await groupsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedFields }
        );

        res.send({ modifiedCount: result.modifiedCount, acknowledged: result.acknowledged });
      } catch (error) {
        console.error("Update error:", error);
        res.status(500).send({ error: "Failed to update group." });
      }
    });

    // Delete group
    app.delete('/api/groups/:id', async (req, res) => {
      const id = req.params.id;
      const result = await groupsCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // Dashboard summary route
    app.get('/api/dashboard/summary', async (req, res) => {
  const email = req.query.email?.toLowerCase(); // always lowercase to match db
console.log(' Summary API hit with email:', email);
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const totalGroups = await groupsCollection.countDocuments();
    const myGroups = await groupsCollection.countDocuments({ creatorEmail: email }); // FIXED LINE
    const pendingGroups = await groupsCollection.countDocuments({ status: 'pending' });

    res.json({
      totalGroups,
      myGroups,
      pendingGroups,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


    // Send join request
    app.post('/api/groups/:id/join-request', async (req, res) => {
      const groupId = req.params.id;
      const { name, email, photo } = req.body;

      if (!email) return res.status(400).send({ error: 'Email is required' });

      try {
        const group = await groupsCollection.findOne({ _id: new ObjectId(groupId) });
        if (!group) return res.status(404).send({ error: 'Group not found' });

        const alreadyRequested = group.joinRequests?.some(u => u.email === email);
        const alreadyJoined = group.joinedUsers?.some(u => u.email === email);

        if (alreadyRequested || alreadyJoined) {
          return res.status(400).send({ error: 'Already requested or joined' });
        }

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
    console.error('Error in run():', err);
  }
}

run();
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
