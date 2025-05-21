import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const db = client.db('mdsanjidt');
    const usersCollection = db.collection('users');
    const groupsCollection = db.collection('groups');

    // Users API (optional)
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // Create Group
    app.post('/api/groups', async (req, res) => {
      const group = req.body;
      group.creatorEmail = group.creatorEmail?.toLowerCase(); // Ensure lowercase
      const result = await groupsCollection.insertOne(group);
      res.send(result);
    });

    // Get All Groups (optionally filtered by creatorEmail)
    app.get('/api/groups', async (req, res) => {
      let query = {};
      const creatorEmail = req.query.creatorEmail;
      if (creatorEmail) {
        query.creatorEmail = creatorEmail.toLowerCase(); // Ensure lowercase match
      }
      const result = await groupsCollection.find(query).toArray();
      res.send(result);
    });

    // Get Single Group by ID
    app.get('/api/groups/:id', async (req, res) => {
      const id = req.params.id;
      const group = await groupsCollection.findOne({ _id: new ObjectId(id) });
      res.send(group);
    });

    // Update Group
    app.put('/api/groups/:id', async (req, res) => {
      const id = req.params.id;
      const updatedFields = req.body;
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
