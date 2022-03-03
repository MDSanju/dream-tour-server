const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5gvym.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
      await client.connect();
      const database = client.db("dream_tour");
      const servicesCollection = database.collection("booking_services");
      const orderCollection = database.collection("orders");
      const commentCollection = database.collection("comments");
      const usersCollection = database.collection("users");

      // GET API
      app.get("/booking_services", async (req, res) => {
        const cursor = servicesCollection.find({});
        const services = await cursor.toArray();
        res.send(services);
      });

      // GET API
      app.get("/orders", async (req, res) => {
        const cursor = orderCollection.find({});
        const orders = await cursor.toArray();
        res.send(orders);
      });

      // GET A Single Service
      app.get("/booking_services/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const service = await servicesCollection.findOne(query);
        res.json(service);
      });

      // GET API By Email
      app.get("/orders/:email", async (req, res) => {
        console.log(req.params.email);
        const cursor = orderCollection.find({ email: req.params.email });
        const orders = await cursor.toArray();
        res.send(orders);
      });

      // GET API
      app.get("/comments", async (req, res) => {
        const cursor = commentCollection.find({});
        const comments = await cursor.toArray();
        console.log(comments);
        res.send(comments);
      });

      // Add to Orders API
      app.post("/orders", async (req, res) => {
        const order = req.body;
        const result = await orderCollection.insertOne(order);
        res.json(result);
      });

      // Add to Comments API
      app.post("/comments", async (req, res) => {
        const comment = req.body;
        const result = await commentCollection.insertOne(comment);
        res.json(result);
      });

      // Add A New service API
      app.post("/booking_services", async (req, res) => {
        const service = req.body;
        const result = await servicesCollection.insertOne(service);
        res.json(result);
      });

      // UPDATE API
      app.put("/orders/:id", async (req, res) => {
        const id = req.params.id;
        const updateOrder = req.body;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {
          $set: {
            status: "Approved",
          },
        };
        const result = await orderCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.json(result);
      });

      // UPDATE API
      app.put("/users", async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const options = { upsert: true };
        const updateDoc = { $set: user };
        const result = await usersCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.json(result);
      });

      // UPDATE API
      app.put("/users/admin", async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const updateDoc = { $set: { role: "admin" } };
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.json(result);
      });

      // GET API(admin role matched)
      app.get("/users/:email", async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if (user?.role === "admin") {
          isAdmin = true;
        }
        res.json({ admin: isAdmin });
      });

      // DELETE API
      app.delete("/orders/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await orderCollection.deleteOne(query);
        res.json(result);
      });

      // DELETE API
      app.delete("/comments/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await commentCollection.deleteOne(query);
        res.json(result);
      });
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Dream Tour Server!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})