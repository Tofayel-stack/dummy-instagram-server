const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv').config()

// cookie 
var cookieParser = require('cookie-parser')
app.use(cookieParser())

// mongodb 
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(express.static("public"));

// middleware 
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dcb0xdp.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

// database connection check by this function 
async function dbConnect() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
      console.log('connected with mongodb');

    }
    catch{err => console.log(err)}
  }
dbConnect()



  // collections
  const usersCollection = client.db("dummy-insta").collection("user");
  const postCollection = client.db("dummy-insta").collection("post");
  const commentCollection = client.db("dummy-insta").collection("post-comments");



// JWT verification function 

function verifyJWT(req,res,next){
  const authHeader = req.headers.authorization;
  if(!authHeader){
    res.status(401).send({message:'unauthorized access'})
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,function(err,decoded){
    if(err){
      res.status(401).send({message:'unauthorized access'})
    }
    req.decoded = decoded;
    next();
  })
  
}


  // create jwt token 
  app.post('/jwt',(req,res)=>{
      try {
        const user = req.body;
        const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:"1h"})
        
        res.send({token})

      } catch (error) {

        console.log(error);
        
      }
  })




// GET APIs 

// get a user by user email
app.get('/user',async(req,res)=>{
  try {
    const email = req.query.email;
    const query = {email:email}
    const result = await usersCollection.findOne(query)

    if (result) {
      res.status(200).send({
        success: true,
        message: `successfully found`,
        data: result,
      });
    } else {
      res.status(200).send({
        success: false,
        message: `Not found`,
        data: [],
      });
    }
    
  } catch (error) {
    console.log(error.message);
    res.status(404).send({
      message: "failed! for some issue!",
      data: null,
    });
  }
})
//...



// get all post
app.get('/all-post',async (req,res)=>{

   try {
    const query = {}
    const result = await postCollection.find(query).sort({ _id: -1 }).toArray()

    if (result) {
      res.status(200).send({
        success: true,
        message: `successfully found`,
        data: result,
      });
    } else {
      res.status(200).send({
        success: false,
        message: `Not found`,
        data: [],
      });
    }
    
   } catch (error) {
    console.log(error.message);
    res.status(404).send({
      message: "failed! for some issue!",
      data: null,
    });
   }
})


// get a single post details 
app.get('/single-post-comment',async (req,res)=>{

   try {

    const id = req.query.id;
    
    const query = {postID:id}
    const result = await commentCollection.find(query).toArray()

    if (result) {
      res.status(200).send({
        success: true,
        message: `successfully found`,
        data: result,
      });
    } else {
      res.status(200).send({
        success: false,
        message: `Not found`,
        data: [],
      });
    }
    
   } catch (error) {
    console.log(error.message);
    res.status(404).send({
      message: "failed! for some issue!",
      data: null,
    });
   }
})









// POST APIs

// create a user When he/she register first time
app.post('/createUser',async(req,res)=>{
  try {
    const userData = req.body;

    const result = await usersCollection.insertOne(userData)
     if (result.acknowledged) {
      res.send({
        message: "user creation successfully ",
        data: result,
      });
    }
    
  } catch (error) {
    console.log(error.message);
    res.status(404).send({
      message: "creation failed! for some issue!",
      data: null,
    });
  }
})
//...

// create a comment by any user login
app.post('/create-comment',async(req,res)=>{
  try {
    const postData = req.body;

    const result = await commentCollection.insertOne(postData)

     if (result.acknowledged) {
      res.send({
        message: "post successfully ",
        data: result,
      });
    }
    
  } catch (error) {
    console.log(error.message);
    res.status(404).send({
      message: "creation failed! for some issue!",
      data: null,
    });
  }
})
//...


// add a comment in database against a post 
app.post('/create-post',async(req,res)=>{
  try {
    const postData = req.body;

    const result = await postCollection.insertOne(postData)
     if (result.acknowledged) {
      res.send({
        message: "post successfully ",
        data: result,
      });
    }
    
  } catch (error) {
    console.log(error.message);
    res.status(404).send({
      message: "creation failed! for some issue!",
      data: null,
    });
  }
})
//...


// update like of a post 
app.put('/add-like',async(req,res)=>{

  try {
    const postID = req.query.id;
    const likesCount = req.body.likes;

    const query = {_id:new ObjectId(postID)}
    const options = { upsert: true };
    const updateDoc = {
      $set: {
        likes: likesCount
      },
    };

   
    const result = await postCollection.updateOne(query , updateDoc , options);

     if (result.acknowledged) {
      res.send({
        message: "post successfully ",
        data: result,
      });
    }
    
  } catch (error) {
    console.log(error.message);
    res.status(404).send({
      message: "creation failed! for some issue!",
      data: null,
    });
  }
})
//...









app.get('/', (req, res) => {
  res.send('insta server is running !!! ')
})

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})