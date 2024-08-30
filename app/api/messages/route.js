// pages/api/inventory/new.js
import { MongoClient } from "mongodb";
import { NextResponse } from "next/server"; // For Next.js 13+ using the new app directory

export async function GET(request) {
  // Replace the uri string with your connection string.
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db("Chat");
    const inventory = database.collection("test");
    const products = await inventory.find({}).toArray(); // Fetch all documents

    return NextResponse.json({ success: true, products }); // Return as an object with a `products` key
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch messages",
    });
  } finally {
    await client.close();
  }
}

export async function POST(request) {
  // Replace the uri string with your connection string.
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    const body = await request.json(); // Parse the JSON body
    const database = client.db("Chat"); // Access the 'stock' database
    const inventory = database.collection("test"); // Access the 'inventory' collection

    // Insert the received data into the collection
    const result = await inventory.insertOne(body);

    // Return a successful response with the inserted document
    return NextResponse.json({ product: result, ok: true });
  } catch (error) {
    console.error("Failed to insert document:", error);
    // Return an error response
    return NextResponse.json({ error: "Failed to insert document", ok: false });
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
