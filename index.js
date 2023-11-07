const express = require("express");
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config()
const port = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true

}));
app.use(express.json());
app.use(cookieParser());



// const uri = "mongodb+srv://<username>:groupStudy@OF4ynwLVq7ModC0T.mongodb.net/?retryWrites=true&w=majority`;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zjauaf8.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// middleware
const logger = async (req, res, next) => {
  console.log('colled', req.host, req.originalUrl);
  next()
}

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;
  console.log('value of token in middleware', token);
  if (!token) {
    return res.status(401).send({ message: 'not authorized' })
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=>{
    // error 
    if(err){
      console.log(err);
      return res.status(401).send({message: 'unauthorized'})
    }
    // if token is valid then it would be decoded
    console.log('value in the token', decoded);
    req.user= decoded;
    next()
  })
  
}



async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const assignmentsCollection = client.db('group-studyDB').collection('assignments');
    const featureCollection = client.db('group-studyDB').collection('features');
    const submitedCollection = client.db('group-studyDB').collection('submitedassignment');


    // auth related api

    app.post('/jwt', logger, async (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      res.
        cookie('token', token, {
          httpOnly: true,
          secure: false,  //http://localhost:5000/
          // sameSite: 'none'
        })
        .send({ success: true })
    })






    // services related api

    app.post('/api/v1/create-assignments', async (req, res) => {
      const assignments = req.body;
      const result = await assignmentsCollection.insertOne(assignments)
      res.send(result)
    })

    app.delete(`/api/v1/all-assignment/:assignmentId`, async (req, res) => {
      const id = req.params.assignmentId
      const quary = { _id: new ObjectId(id) }
      const result = await assignmentsCollection.deleteOne(quary);
      res.send(result);
    })

    app.get("api/v1/submited-all-assignment",verifyToken,  logger, async (req, res) => {
      console.log(req.query.email);
      // console.log('tok tok tok token', req.cookies.token);
      console.log('user in the valid token', req.user);
      if(req.query.email !== req.user.email){
        return res.status(403).send({message: 'forbidden access'})
      }
      let quary = {};
      if (req.query?.email) {
        quary = { email: req.query.email }
      }
      const result = await submitedCollection.find().toArray();
      res.send(result);
    });
    app.get("/api/v1/all-assignment", async (req, res) => {
      const result = await assignmentsCollection.find().toArray();
      res.send(result);
    });


    //  update Single User 
    app.put(`/api/v1/update-assignment/:assignmentId`, async (req, res) => {
      const id = req.params.assignmentId;
      const data = req.body;
      console.log("id", id, data);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedData = {
        $set: {
          title: data.title,
          marks: data.marks,
          description: data.description,
          date: data.date,
          image: data.image,
          level: data.level
        },
      };
      const result = await assignmentsCollection.updateOne(
        filter,
        updatedData,
        options
      );
      res.send(result);
    });


    app.get("/api/v1/update-assignment/:assignmentId", async (req, res) => {
      const id = req.params.assignmentId;
      console.log("id", id);
      const query = {
        _id: new ObjectId(id),
      };
      const result = await assignmentsCollection.findOne(query);
      console.log(result);
      res.send(result);
    });

    // update single user end

    // submitedassignment
    app.get("/api/v1/all-assignment/:assignmentId", async (req, res) => {
      const id = req.params.assignmentId;
      console.log("id", id);
      const query = {
        _id: new ObjectId(id),
      };
      const result = await assignmentsCollection.findOne(query);
      console.log(result);
      res.send(result);
    });


    // features card section
    app.get("/api/v1/features-cards", logger, async (req, res) => {
      const result = await featureCollection.find().toArray();
      res.send(result);
    });


    // submited assignment
    app.post('/api/v1/submited-assignments', async (req, res) => {
      const assignments = req.body;
      const result = await submitedCollection.insertOne(assignments)
      res.send(result)
    })

    app.get("/api/v1/submited-all-assignment", async (req, res) => {
      const result = await submitedCollection.find().toArray();
      res.send(result);
    });


    // submited assignments  //update

    app.patch('/api/v1/submited-all-assignment:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateAssignment = req.body;
      console.log(updateAssignment);
      const updateDoc = {
        $set: {
          status: updateAssignment.status
        },
      };
    })






    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
  res.send("Crud is running...");
});

app.listen(port, () => {
  console.log(`Simple Crud is Running on port ${port}`);
});