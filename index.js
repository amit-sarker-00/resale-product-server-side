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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("unauthorized access");
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await userCollections.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "1d",
        });
        return res.send({ accessToken: token });
      }

      res.status(403).send({ accessToken: "unauthorized access" });
    });
    const resaleCollections = client
      .db("resaleHolder")
      .collection("latestSell");
    const userCollections = client.db("resaleHolder").collection("users");
    const paymentsCollection = client.db("resaleHolder").collection("payments");
    const advertisementCollections = client
      .db("resaleHolder")
      .collection("advertise");
    const buyerCollections = client
      .db("resaleHolder")
      .collection("bookProducts");
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
      const latest = await resaleCollections
        .find(query)
        .sort({ _id: -1 })
        .limit(-8)
        .toArray();
      res.send(latest);
    });

    // categories
    app.get("/categories", async (req, res) => {
      const query = {};
      const categories = await categoryCollections

        .find(query)
        .sort({ _id: -1 })
        .limit(-8)
        .toArray();
      res.send(categories);
      console.log(categories);
    });

    //get store bike
    app.get("/storeBikes/:name", async (req, res) => {
      const categoryName = req.params.name;
      const query = { categoryName };
      const storeBikes = await storeBikesCollections
        .find(query)
        .sort({ _id: -1 })
        .toArray();
      res.send(storeBikes);
    });
    app.get("/categories/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const categories = await categoryCollections.findOne(query);
      res.send(categories);
    });
    //save user in Database
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollections.insertOne(user);
      res.send(result);
    });
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const users = await userCollections.findOne(query);
      res.send(users);
    });
    app.get("/users", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if (email !== decodedEmail) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const query = {};
      const users = await userCollections.find(query).toArray();
      res.send(users);
    });

    // book now product
    app.post("/booknow", async (req, res) => {
      const product = req.body;
      const result = await buyerCollections.insertOne(product);
      res.send(result);
    });
    //get seller
    app.get("/sellers", async (req, res) => {
      const query = {};
      const users = await userCollections.find(query).toArray();
      res.send(users);
    });
    app.get("/seller", async (req, res) => {
      const query = { role: "seller" };
      const allseller = await userCollections.find(query).toArray();
      res.send(allseller);
    });

    //buyerCollections
    app.get("/myorders/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const product = await buyerCollections.find(query).toArray();
      res.send(product);
    });
    app.get("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const orders = await buyerCollections.findOne(query);
      res.send(orders);
    });

    //make admin
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollections.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });
    app.put("/users/admin/:id", async (req, res) => {
      const decodeEmail = req.decoded.email;
      const query = { email: decodeEmail };
      const user = await userCollections.findOne(query);
      if (user.role !== "admin") {
        return res.status(403).send({ message: "forbidden access" });
      }
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollections.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
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

    app.get("/recent", async (req, res) => {
      const query = {};
      const recentAdd = await productsCollections
        .find(query)
        .sort({ _id: -1 })
        .limit(-6)
        .toArray();
      res.send(recentAdd);
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
