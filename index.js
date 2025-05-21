import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

// Load environment variables
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

    // -----------------------------
    // Users (Optional)
    // -----------------------------
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // -----------------------------
    // Groups API
    // -----------------------------

    // CREATE group
    app.post('/api/groups', async (req, res) => {
      const group = req.body;
      const result = await groupsCollection.insertOne(group);
      res.send(result);
    });

    // READ all groups (for AllGroups.jsx)
    app.get('/api/groups', async (req, res) => {
     const creatorEmail = req.query.creatorEmail;
if (creatorEmail) {
  query.creatorEmail = creatorEmail;
}

      let query = {};
      if (creatorEmail) {
        query.creatorEmail = creatorEmail;
      }

      const result = await groupsCollection.find(query).toArray();
      res.send(result);
    });

    // READ single group by ID (for UpdateGroup.jsx)
    app.get('/api/groups/:id', async (req, res) => {
      const id = req.params.id;
      const group = await groupsCollection.findOne({ _id: new ObjectId(id) });
      res.send(group);
    });

    // UPDATE group
    app.put('/api/groups/:id', async (req, res) => {
      const id = req.params.id;
      const updatedFields = req.body;
      const result = await groupsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedFields }
      );
      res.send(result);
    });

    // DELETE group
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
