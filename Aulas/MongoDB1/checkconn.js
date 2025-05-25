const { MongoClient } = require("mongodb");
// Connection URI

// Create a new MongoClient
require("dotenv").config()
const URI = process.env.URI
const client = new MongoClient(URI);

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    // Establish and verify connection
    resultPing = await client.db("admin").command({ ping: 1 });
    resultHello = await client.db("admin").command({ hello: 1 });
    resultWhat = await client.db("admin").command({ whatsmyuri: 1 });
    console.log(resultHello)
    console.log(resultHello.hosts)
    console.log("Connected successfully to server");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir)

// const express = require('express');
// const app = express();
// const { MongoClient } = require("mongodb");