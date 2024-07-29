const express = require ('express');
const mongoose = require('mongoose');
const bookRoutes = require('./routes/book');
const userRoutes = require('./routes/user');
const app = express();
//require('dotenv').config();

app
.use(express.json())
.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

//const dataBaseUrl = process.env.DATABASE_URL;

/*const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://Mon_vieux_grimoire:<projet6>@cluster0.lxhtynr.mongodb.net/";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}*/
mongoose.connect("mongodb+srv://Elise:projet6@cluster0.lxhtynr.mongodb.net/?retryWrites=true&w=majority&appName=Clustertest",
{ 
    useNewUrlParser: true,
    useUnifiedTopology: true 
})

.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));

//Routes
app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static('images'));
console.log("ok")
module.exports = app;