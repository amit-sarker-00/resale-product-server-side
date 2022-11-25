const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.qpavz6c.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const resaleCollections = client
      .db("resaleHolder")
      .collection("latestSell");
    const userCollections = client.db("resaleHolder").collection("users");
    const productsCollections = client
      .db("resaleHolder")
      .collection("products");
    const storeBikesCollections = client
      .db("resaleHolder")
      .collection("bikeStore");
    const categoryCollections = client
      .db("resaleHolder")
      .collection("categories");

    app.get("/latestSell", async (req, res) => {
      const query = {};
      const latest = await resaleCollections.find(query).limit(8).toArray();
      res.send(latest);
    });

    //save user in Database
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollections.insertOne(user);
      res.send(result);
    });
    // categories
    app.get("/categories", async (req, res) => {
      const query = {};
      const categories = await categoryCollections.find(query).toArray();
      res.send(categories);
    });

    //get store bike
    app.get("/storeBikes/:name", async (req, res) => {
      const categoryName = req.params.name;
      const query = { categoryName };
      const storeBikes = await storeBikesCollections.find(query).toArray();
      res.send(storeBikes);
    });
    app.get("/categories/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const categories = await categoryCollections.findOne(query);
      res.send(categories);
    });
    //users
    app.get("/users/:email", async (req, res) => {
      const userEmail = req.query.email;
      const query = { userEmail };
      const user = await userCollections.findOne(query);
      res.send(user);
    });
    //add products, get and delete
    app.post("/addproduct", async (req, res) => {
      const product = req.body;
      const result = await productsCollections.insertOne(product);
      res.send(result);
    });
    app.get("/product/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const product = await productsCollections.find(query).toArray();
      res.send(product);
    });
    app.delete("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollections.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}
run().catch((err) => console.log(err));
app.get("/", (req, res) => {
  res.send("Resale side is running");
});

app.listen(port, () => {
  console.log(`server listening on ${port}`);
});
