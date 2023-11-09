const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
require('dotenv').config()



//middleware
app.use(cors()) 
app.use(express.json());
const port = process.env.PORT || 5000;


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





async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const assignmentsCollection = client.db('group-studyDB').collection('assignments');
    const featureCollection = client.db('group-studyDB').collection('features');
    const submitedCollection = client.db('group-studyDB').collection('submitedassignment');


    // auth related api

  





    // services related api

    app.post('/api/v1/create-assignments', async (req, res) => {
      const user = req.body;
      const result = await assignmentsCollection.insertOne(user)
      console.log(result);
      res.send(result)
    })

    app.delete(`/api/v1/all-assignment/:assignmentId`, async (req, res) => {
      const id = req.params.assignmentId
      const quary = { _id: new ObjectId(id) }
      const result = await assignmentsCollection.deleteOne(quary);
      res.send(result);
    })

    // app.delete(`/api/v1/all-assignment/:assignmentId`, async (req, res) => {
    //   const id = req.params.assignmentId
    //   const {email} = req.query;
    //   const quary = { _id: new ObjectId(id) }
    //   console.log(id, email);
    //   const result = await assignmentsCollection.deleteOne(quary);
    //   console.log('delete result find:', result);
      
    //   if(!result){
    //     console.log('no item found');
    //     return res
    //           .status(404)
    //           .json({ message : 'assignment not found'})
    //   }
    //   if(email = result?.creatorEmail){
    //     const deleteResult = await assignmentsCollection.deleteOne(
    //       quary
    //     )
    //     res.send(deleteResult);
    //   }
    //   else{
    //     return res
    //           .status(403)
    //           .json({message:"access donied . Email does not match"})
    //   }
    // })verifyToken,


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
    app.get("/api/v1/features-cards", async (req, res) => {
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
      const result = await submitedCollection.updateOne(filter, updateDoc);
      res.send(result)
    })






    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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