// pages/api/inventory/new.js
import { MongoClient } from "mongodb";
import { NextResponse } from "next/server"; // For Next.js 13+ using the new app directory

// export async function GET(request) {
//   // Replace the uri string with your connection string.
//   const uri = process.env.MONGODB_URI;
//   const client = new MongoClient(uri);
//   try {
//     await client.connect();
//     const database = client.db("Chat");
//     const inventory = database.collection("test");
//     const products = await inventory.find({}).toArray(); // Fetch all documents

//     return NextResponse.json({ success: true, products }); // Return as an object with a `products` key
//   } catch (error) {
//     console.error("Failed to fetch messages:", error);
//     return NextResponse.json({
//       success: false,
//       error: "Failed to fetch messages",
//     });
//   } finally {
//     await client.close();
//   }
// }


export async function POST(request) {
  let body = await request.json();
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  
  try {
    const database = client.db('Chat');
    const collection = database.collection('messages');
    
    // Adding name, timestamp, and userId to the message
    const newMessage = {
      ...body,
      name: body.name,
      timestamp: new Date().toISOString(),
      userId: body.userId,
    };
    
    const result = await collection.insertOne(newMessage);
    return NextResponse.json({ success: true, message: result.ops[0] });
  } finally {
    await client.close();
  }
}

export async function GET() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  
  try {
    const database = client.db('Chat');
    const collection = database.collection('messages');
    const messages = await collection.find().toArray(); // Sorting by time
    // const messages = await collection.find().sort({ timestamp: 1 }).toArray(); // Sorting by time
    return NextResponse.json({ success: true, messages });
  } finally {
    await client.close();
  }
}

export async function DELETE(request) {
  const { id } = await request.json();
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    const database = client.db('Chat');
    const collection = database.collection('test');
    await collection.deleteOne({ _id: new MongoClient.ObjectID(id) });
    return NextResponse.json({ success: true });
  } finally {
    await client.close();
  }
}
