import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';

// ✅ Load .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ Use URI from .env
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const db = client.db('mdsanjidt'); // database name from URI
    const userCollection = db.collection('users');

    // ✅ POST route
    app.post('/users', async (req, res) => {
      const user = req.body;
      console.log('Received:', user); // optional debug
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    console.log(' MongoDB connected successfully');
  } catch (err) {
    console.error(' MongoDB connection error:', err);
  }
}

run();

app.get('/', (req, res) => {
  res.send('HobbyHub Server is running');
});

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
