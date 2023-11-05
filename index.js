const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



// const uri = "mongodb+srv://<username>:groupStudy@OF4ynwLVq7ModC0T.mongodb.net/?retryWrites=true&w=majority";
const uri = "mongodb+srv://groupStudy:OF4ynwLVq7ModC0T@cluster0.zjauaf8.mongodb.net/?retryWrites=true&w=majority";

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
    await client.connect();
    const assignmentsCollection = client.db('group-studyDB').collection('assignments');


    app.post('/api/v1/create-assignments', async(req,res)=>{
        const assignments = req.body;
        const result = await assignmentsCollection.insertOne(assignments)
        res.send(result)
    })

  
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
            image:data.image,
            level: data.data
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
  


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log( "Pinged your deployment. You successfully connected to MongoDB!");
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