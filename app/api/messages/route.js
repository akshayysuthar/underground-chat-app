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
  try {
    const { userId, message, timestamp, name } = await request.json();
    if (!userId || !message) {
      return NextResponse.json(
        { success: false, message: "Invalid data" },
        { status: 400 }
      );
    }

    await client.connect();
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

    return NextResponse.json(
      { success: true, product: result.ops[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to send message:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send message" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    await client.connect();
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
    await client.close();
  }
}
