import express from 'express';
import cors from 'cors';
import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// p-6YfHGdH99bKSjOBt
// n- hobbyhubDB
// MongoDB Connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const db = client.db('hobbyhubDB');
    const groupCollection = db.collection('groups');

    // Example API
    app.post('/create-group', async (req, res) => {
      const group = req.body;
      const result = await groupCollection.insertOne(group);
      res.send(result);
    });

    app.get('/groups', async (req, res) => {
      const result = await groupCollection.find().toArray();
      res.send(result);
    });

    console.log('MongoDB Connected ');
  } catch (err) {
    console.error('Connection Error:', err);
  }
}

run();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
