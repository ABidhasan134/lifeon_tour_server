const express = require("express");
const app = express();
const cors = require("cors");
const jwt= require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

//middlewares
app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true, 
  })
);
app.use(express.json());

app.get("/", (req, res) => res.send("Life is on my way"));

console.log(
  "here is user and password",
  process.env.DB_PASSWORD,
  process.env.DB_USER
);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.il352b3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const database = client.db("lifeOn");
    const videosCollaction = database.collection("videos");
    const packagesCollaction = database.collection("packages");
    const ourPackagesCollaction = database.collection("ourPackages");
    const ourGuidesCollaction = database.collection("guide");
    const storysCollaction = database.collection("story");
    const bookingsCollaction = database.collection("bookings");
    const rattingCommentCollaction = database.collection("rattingComment");
    const wishlistCollaction = database.collection("wishlist");
    const userstCollaction = database.collection("users");
    // jwt related apis
    // create token 
    app.post('/jwt',async(req,res)=>{
      const userEamil=req.body;
      const token=jwt.sign(userEamil,process.env.ACCESS_TOKEN,{ expiresIn: '1h' })
      res.send(token);
    })
    const verifyToken=async(req, res,next)=>{
      const authHeader = req.headers.authorization || req.headers.Authorization;
      console.log(authHeader)
      if (!authHeader) {
        return res.status(401).send({ message: "Forbidden access" });
      }
      const token = authHeader.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        console.log(process.env.ACCESS_TOKEN)
        console.log(token)
        if (err) {
          return res.status(401).send({ message: "Forbidden access" });
        }
        req.decoded = decoded;
        
        next();
      });
    }
    // videos api
    app.get("/videos",async (req, res) => {
      const result = await videosCollaction.find().toArray();
      res.send(result);
    });
    // packages apis
    app.get("/packages", async (req, res) => {
      const result = await packagesCollaction.find().toArray();
      res.send(result);
    });
    // our all packages
    app.get("/ourPackages", async (req, res) => {
      const result = await ourPackagesCollaction.find().toArray();
      res.send(result);
    });
    // all packages data by id
    app.get("/alltourdetail/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await ourPackagesCollaction.findOne(query);
      res.send(result);
      // console.log(result);
    });
    // guided person get api  // find a guide data (this is user collaction also)
    app.get("/guides", async (req, res) => {
     const filte={role:'guide',status:'ok'}
      const result = await ourGuidesCollaction.find(filte).toArray();
      res.send(result);
    });
    app.put("/guides/:email", async (req, res) => {
      const filter={email: req.params.email}
      const info=req.body
      const updateDoc={
        $set:{
          name:info?.name || info.user_name,
          email: info?.email || info.user_email,
          experience:info?.experience,
          availability:info?.availability,
          price_range:info?.price_range,
          bio:info?.bio,
          image_url:info?.image_url,
          specialties:info?.specialties,
          languages:info?.languages,
          city:info?.city,
          average_rating:info?.average_rating,
          status:info?.status,
          role: info?.role || 'guide'
        }
      }
      // console.log(updateDoc);
      const options = { upsert: true };
     
      const result = await ourGuidesCollaction.updateOne(filter, updateDoc, options);
        res.send(result);

    })
    app.get("/guideDetails/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await ourGuidesCollaction.findOne(query);
      res.send(result);
      // console.log(result);
    });
    // story get api
    app.get("/storys", async (req, res) => {
      const result = await storysCollaction.find().toArray();
      res.send(result);
    });
    app.post("/storys",async(req,res)=>{
      const newStory=req.body;
      const result=await storysCollaction.insertOne(newStory)
      res.send(result);
    })
    // mybookings
    app.post('/mybooking',async(req,res)=>{
      const info=req.body;
      const result=await bookingsCollaction.insertOne(info);
      res.send(result);
      // console.log(info)
    })
    app.get("/mybooking/:email", async (req, res) => {
      const filter={tourist_email:req.params.email}
      const result=await bookingsCollaction.find(filter).toArray();
      res.send(result);
    })
    app.delete("/mybooking/:id", async (req, res) =>{
      const id=req.params.id;
      // console.log(id)
      const query={_id:new ObjectId(id)}
      const result=await bookingsCollaction.deleteOne(query);
      res.send(result);
    })
    // ratting and commenting
    app.put('/rattingComment/:email',verifyToken, async (req, res) => {
      const filter = {tourist_email: req.params.email };  // Assuming email is the filter criteria
      const info = req.body;
      // console.log(filter);
    
      const updateDoc = {
        $set: {
          tourist_name: info.tourist_name,
          tourist_email: info.tourist_email,
          guide_email: info.guide_email,
          guide_name: info.guide_name,
        }
      };
    
      if (info.newValue) {
        updateDoc.$set.ratting = info.newValue;
      }
    
      if (info.comment) {
        updateDoc.$set.comment = info.comment;
      }
    
      const options = { upsert: true };
    
        const result = await rattingCommentCollaction.updateOne(filter, updateDoc, options);
        res.send(result);
    //  console.log(updateDoc)
    });
    // wishList
    app.post("/wishlist",async(req, res) =>{
      const wish=req.body;
      delete wish._id;
      // console.log("wish consol",wish); 
      const result=await wishlistCollaction.insertOne(wish);
      res.send(result);

    })
    app.get('/wishlist/:email',async(req, res) =>{
      const email=req.params.email;
      // console.log("wish consol",email);
      const query={user_email: email}
      const result= await wishlistCollaction.find(query).toArray();
      res.send(result);
    })
    app.delete('/wishlist/:id',async(req, res) =>{
      const id=req.params.id;
      // console.log(id)
      const query={_id:new ObjectId(id)}
      const result=await wishlistCollaction.deleteOne(query);
      res.send(result);
    })
    // users apis
    app.put("/users/:useremail", async (req, res) => {
      const userInfo = req.body;
      const filter = { user_email: req.params.useremail };
      const updateUser = {
        $set: {
          user_name: userInfo.user_name,
          user_email: userInfo.user_email,
          role: userInfo.role,
        },
      };
      const options = { upsert: true };
      const result = await userstCollaction.updateOne(filter, updateUser, options);
      res.send(result);
    });
    //middlewares of admin
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await ourGuidesCollaction.findOne(query);
      const isAdmin = user?.role === "admin";
      if (!isAdmin) {
        return res.status(403).send({ message: "forbidden access" });
      }
      next();
    };
    // admin apis
    app.get("/users/admin/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: "unauthorized access" });
      }
      const query = { email: email };
      const user = await ourGuidesCollaction.findOne(query);
      let admin = false; // Default to false if user or role is not found
      if (user && user.role === "admin") {
        admin = true;
      }
      res.send({ admin });
    });
    
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => console.log(`My listening on port ${port}!`));
