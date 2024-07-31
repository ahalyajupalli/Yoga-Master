const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const stripe = require('stripe')(process.env.PAYMENT_SECRET);
const cors = require('cors');
const port = 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// Middleware
app.use(cors());
app.use(express.json());

// set token

// mongodb connection

//import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@yoga-master.angzij2.mongodb.net/?retryWrites=true&w=majority&appName=yoga-master`;

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
    //create a database and collections

    const database = client.db("yoga-master");
    const usersCollection = database.collection("users");
    const classesCollection = database.collection("classes");
    const cartCollection = database.collection("cart");
    const paymentCollection = database.collection("payments");
    const enrolledCollection = database.collection("enrolled");
    const appliedCollection = database.collection("applied");

    //set token
    app.post("/api/set-token", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ASSESS_SECRET, {
        expiresIn: "24h",
      });
      res.send({ token });
    });

    //verify token
    const verifyJWT = (req, res, next) => {
      // Error occurs here
      const authorization = req.headers.authorization;
      if (!authorization) {
        return res.status(401).send({ message: "Invalid authorization" });
      }
      const token = authorization.split(" ")[1];
      jwt.verify(token, process.env.ASSESS_SECRET, (err, decoded) => {
        if (err) {
          return res.status(403).send({ message: "Forbidden access" });
        }
        req.decoded = decoded; // This line attaches the decoded token to the request object
        next();
      });
    };
    

    //middleware for admin and instructor
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user.role === "admin") {
        next();
      } else {
        return res.status(403).send({ message: "Forbidden access" });
      }
    };

    //middleware for instructor
    const verifyInstructor = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user.role === 'instructor' || user.role === 'admin') {
          next()
      }
      else {
          return res.status(401).send({ error: true, message: 'Unauthorize access' })
      }
  }

    //new user
    app.post("/new-user", async (req, res) => {
      const newUser = req.body;
      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    });

    app.get('/users', async (req, res) => {
      const users = await usersCollection.find({}).toArray();
      res.send(users);
  })

    //users by id

    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });
    //users by email

    app.get('/user/:email', verifyJWT, async (req, res) => {
      console.log('Received request for:', req.params.email);
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      if (result) {
        res.send(result);
      } else {
        res.status(404).send({ message: "User not found" });
      }
    });

    //delete a user

    app.delete('/delete-user/:id', verifyJWT, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
  })
    //upadte a user

    app.put('/update-user/:id', verifyJWT, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const updatedUser = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
          $set: {
              name: updatedUser.name,
              email: updatedUser.email,
              role: updatedUser.role,
              address: updatedUser.address,
              phone: updatedUser.phone,
              about: updatedUser.about,
              photoUrl: updatedUser.photoUrl,
              skills: updatedUser.skills ? updatedUser.skills : null,
          }
      }
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.send(result);
  })
  

    //classes routes
    app.post('/new-class', verifyJWT, verifyInstructor, async (req, res) => {
      const newClass = req.body;
      newClass.availableSeats = parseInt(newClass.availableSeats)
      const result = await classesCollection.insertOne(newClass);
      res.send(result);
  });
    app.get("/classes", async (req, res) => {
      const query = { status: "approved" };
      const result = await classesCollection.find().toArray();
      res.send(result);
    });

    // get courses by instructor email address
    app.get(
      "/classes/:email",
      verifyJWT,
      verifyInstructor,
      async (req, res) => {
        const email = req.params.email;
        const query = { instructorEmail: email };
        const result = await classesCollection.find(query).toArray();
        res.send(result);
      }
    );

    //manage classes
    app.get('/classes-manage', async (req, res) => {
      const result = await classesCollection.find().toArray();
      res.send(result);
  })

    //update classes status and reason
    app.put('/change-status/:id', verifyJWT, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const status = req.body.status;
      console.log(req.body)
      const reason = req.body.reason;
      const filter = { _id: new ObjectId(id) };
      console.log("🚀 ~ file: index.js:180 ~ app.put ~ reason:", reason)
      const options = { upsert: true };
      const updateDoc = {
          $set: {
              status: status,
              reason: reason
          }
      }
      const result = await classesCollection.updateOne(filter, updateDoc, options);
      res.send(result);
  })

    //get approved classes
    app.get("/approved-classes", async (req, res) => {
      const query = { status: "approved" };
      const result = await classesCollection.find(query).toArray();
      res.send(result);
    });

    //get single class details
    app.get("/class/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await classesCollection.findOne(query);
      res.send(result);
    });

    //update class details (all data)

    app.put(
      "/update-class/:id",
      verifyJWT,
      verifyInstructor,
      async (req, res) => {
        const id = req.params.id;
        const updatedClass = req.body;
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {
          $set: {
            name: updatedClass.name,
            description: updatedClass.description,
            price: updatedClass.price,
            availableSeats: parseInt(updatedClass.availableSeats),
            videoLink: updatedClass.videoLink,
            status: "pending",
          },
        };
        const result = await classesCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.send(result);
      }
    );

    //cart routes !----
    app.post("/add-to-cart", verifyJWT, async (req, res) => {
      const newCartItem = req.body;
      const result = await cartCollection.insertOne(newCartItem);
      res.send(result);
    });

    //get cart item by id if a class is already in cart
    app.get("/cart-item/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const email = req.query.email;
      const query = { classId: id, userMail: email };
      const projection = { classId: 1 };
      const result = await cartCollection.findOne(query, {
        projection: projection,
      });
      res.send(result);
    });
    // cart info by user email
    // app.get("/cart/:email", verifyJWT, async (req, res) => {
    //   const email = req.params.email;
    //   const query = { userMail: email };
    //   const projection = { classId: 1 };
    //   const carts = await cartCollection.find(query, {
    //     projection: projection,
    //   });
    //   const classIds = carts.map((cart) => new ObjectId(cart.classId));
    //   const query2 = { _id: { $in: classIds } };
    //   const result = await classesCollection.find(query2).toArray();
    //   res.send(result);
    // });
    const CircularJSON = require("circular-json");

    app.get("/cart/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const query = { userMail: email };
      const projection = { classId: 1 };

      try {
        // Using `find` to retrieve an array of cart documents
        const carts = await cartCollection
          .find(query, { projection })
          .toArray();

        // Ensure carts is an array before mapping
        if (!Array.isArray(carts)) {
          return res
            .status(500)
            .send({ error: "Unexpected response format from database" });
        }

        const classIds = carts.map((cart) => new ObjectId(cart.classId));
        const query2 = { _id: { $in: classIds } };

        const result = await classesCollection.find(query2).toArray();

        // Convert result to JSON safely
        const safeResult = CircularJSON.stringify(result);

        res.send(safeResult);
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .send({ error: "An error occurred while fetching cart items" });
      }
    });

    //delete cart item
    app.delete("/delete-cart-item/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { classId: id };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });

    // payments routes
    app.post('/create-payment-intent', verifyJWT, async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price) * 100;
      const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: 'usd',
          payment_method_types: ['card']
      });
      res.send({
          clientSecret: paymentIntent.client_secret
      });
    })

    //post payment info to db
    app.post('/payment-info', verifyJWT, async (req, res) => {
      const paymentInfo = req.body;
      const classesId = paymentInfo.classesId;
      const userEmail = paymentInfo.userEmail;
      const singleClassId = req.query.classId;
      let query;
      // const query = { classId: { $in: classesId } };
      if (singleClassId) {
          query = { classId: singleClassId, userMail: userEmail };
      } else {
          query = { classId: { $in: classesId } };
      }
      const classesQuery = { _id: { $in: classesId.map(id => new ObjectId(id)) } }
      const classes = await classesCollection.find(classesQuery).toArray();
      const newEnrolledData = {
          userEmail: userEmail,
          classesId: classesId.map(id => new ObjectId(id)),
          transactionId: paymentInfo.transactionId,
      }
      const updatedDoc = {
          $set: {
              totalEnrolled: classes.reduce((total, current) => total + current.totalEnrolled, 0) + 1 || 0,
              availableSeats: classes.reduce((total, current) => total + current.availableSeats, 0) - 1 || 0,
          }
      }
      // const updatedInstructor = await userCollection.find()
      const updatedResult = await classesCollection.updateMany(classesQuery, updatedDoc, { upsert: true });
      const enrolledResult = await enrolledCollection.insertOne(newEnrolledData);
      const deletedResult = await cartCollection.deleteMany(query);
      const paymentResult = await paymentCollection.insertOne(paymentInfo);
      res.send({ paymentResult, deletedResult, enrolledResult, updatedResult });
  })
    //get payment history
     app.get('/payment-history/:email', async (req, res) => {
            const email = req.params.email;
            const query = { userEmail: email };
            const result = await paymentCollection.find(query).sort({ date: -1 }).toArray();
            res.send(result);
        })

    //paymnet history length
    app.get("/payment-history-length/:email", async (req, res) => {
      const email = req.params.email;
      const query = { userMail: email };
      const total = await paymentCollection.countDocuments(query);
      res.send({ total });
    });
    //Enrollement routes
    app.get("/popular-classes", async (req, res) => {
      const result = await classesCollection
        .find()
        .sort({ totalEnrolled: -1 })
        .limit(7)
        .toArray();
      res.send(result);
    });
    // popular instructors
    app.get("/popular-instructors", async (req, res) => {
      const pipeline = [
        {
          $group: {
            _id: "$instructorEmail",
            totalEnrolled: { $sum: "$totalEnrolled" },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "email",
            as: "instructor",
          },
        },
        {
          $project: {
            _id: 0,
            instructor: {
              $arrayElemAt: ["$instructor", 0],
            },
            totalEnrolled: 1,
          },
        },
        {
          $sort: {
            totalEnrolled: -1,
          },
        },
        {
          $limit: 6,
        },
      ];

      try {
        const result = await classesCollection.aggregate(pipeline).toArray();

        // Log the instructor names
        result.forEach((instructorData, index) => {
          console.log(
            `Instructor ${index + 1}: ${
              instructorData.instructor?.name || "Name not found"
            }`
          );
        });

        res.send(result);
      } catch (error) {
        console.error("Error fetching popular instructors:", error);
        res.status(500).send({ error: "Failed to fetch popular instructors" });
      }
    });

    //admin-status
    app.get('/admin-stats', verifyJWT, verifyAdmin, async (req, res) => {
      // Get approved classes and pending classes and instructors 
      const approvedClasses = (await classesCollection.find({ status: 'approved' }).toArray()).length;
      const pendingClasses = (await classesCollection.find({ status: 'pending' }).toArray()).length;
      const instructors = (await usersCollection.find({ role: 'instructor' }).toArray()).length;
      const totalClasses = (await classesCollection.find().toArray()).length;
      const totalEnrolled = (await enrolledCollection.find().toArray()).length;
      // const totalRevenue = await paymentCollection.find().toArray();
      // const totalRevenueAmount = totalRevenue.reduce((total, current) => total + parseInt(current.price), 0);
      const result = {
          approvedClasses,
          pendingClasses,
          instructors,
          totalClasses,
          totalEnrolled,
          // totalRevenueAmount
      }
      res.send(result);

  })
    // get all instructors
    app.get("/instructors", async (req, res) => {
      const result = await usersCollection
        .find({ role: "instructor" })
        .toArray();
      res.send(result);
    });
//Enrolled classes

app.get('/enrolled-classes/:email', verifyJWT, async (req, res) => {
  const email = req.params.email;
  const query = { userEmail: email };
  const pipeline = [
      {
          $match: query
      },
      {
          $lookup: {
              from: "classes",
              localField: "classesId",
              foreignField: "_id",
              as: "classes"
          }
      },
      {
          $unwind: "$classes"
      },
      {
          $lookup: {
              from: "users",
              localField: "classes.instructorEmail",
              foreignField: "email",
              as: "instructor"
          }
      },
      {
          $project: {
              _id: 0,
              classes: 1,
              instructor: {
                  $arrayElemAt: ["$instructor", 0]
              }
          }
      }

  ]
  const result = await enrolledCollection.aggregate(pipeline).toArray();
  // const result = await enrolledCollection.find(query).toArray();
  res.send(result);
})
    app.post("/as-instructor", async (req, res) => {
      const data = req.body;
      const result = await appliedCollection.insertOne(data);
      res.send(result);
    });
    // applied instructors
   app.get('/applied-instructors/:email',   async (req, res) => {
            const email = req.params.email;
            const result = await appliedCollection.findOne({email});
            res.send(result);
   })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (e) {
    console.log("Error " + e);
  }
}
run();

app.get("/", (req, res) => {
  res.send("Hello all!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
