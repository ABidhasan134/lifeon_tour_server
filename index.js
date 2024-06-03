const  express = require('express')
const app = express();
const cors=require('cors');
require('dotenv').config();
const { MongoClient } = require("mongodb");
const port = process.env.PORT || 5000;

//middlewares 
app.use(cors({
    origin: "http://localhost:5173", // Your frontend URL
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  }));
app.use(express.json());

app.get('/', (req, res) => res.send('Life is on my way'))

console.log(process.env.DB_PASSWORD);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.il352b3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  

async function run() {
  try {
    await client.connect();
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const database = client.db('lifeOn');
    const videosCollaction = database.collection('videos');

    app.get('/videos',async(req,res)=>{
        const result= await videosCollaction.find().toArray();
        res.send(result);
    })

  } finally {
    
  }
}
run().catch(console.dir);

app.listen(port, () => console.log(`My listening on port ${port}!`))