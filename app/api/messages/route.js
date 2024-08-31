import { MongoClient, ObjectId } from "mongodb";
import { NextResponse } from "next/server";

// MongoDB connection URI
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function GET() {
  try {
    await client.connect();
    const database = client.db("Chat");
    const messages = database.collection("test");

    // Fetch all messages from the collection
    const result = await messages.find({}).toArray();

    return NextResponse.json({ success: true, products: result });
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch messages" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function POST(request) {
  let client;

  try {
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const { userId, message, timestamp, name } = await request.json();
    if (!userId || !message || !timestamp || !name) {
      return NextResponse.json(
        { success: false, message: "Invalid data" },
        { status: 400 }
      );
    }

    const database = client.db("Chat");
    const messages = database.collection("test");

    // Insert the new message into the collection
    const newMessage = {
      userId,
      message,
      timestamp,
      name,
    };
    const result = await messages.insertOne(newMessage);

    // Fetch the inserted message to return it
    const insertedMessage = await messages.findOne({ _id: result.insertedId });

    return NextResponse.json(
      { success: true, product: insertedMessage },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to send message:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send message" },
      { status: 500 }
    );
  } finally {
    if (client) {
      try {
        await client.close();
      } catch (error) {
        console.error("Failed to close MongoDB connection:", error);
      }
    }
  }
}

export async function DELETE(request) {
  let client;

  try {
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Invalid ID" },
        { status: 400 }
      );
    }

    const database = client.db("Chat");
    const messages = database.collection("test");

    await messages.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete message:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete message" },
      { status: 500 }
    );
  } finally {
    if (client) {
      try {
        await client.close();
      } catch (error) {
        console.error("Failed to close MongoDB connection:", error);
      }
    }
  }
}
