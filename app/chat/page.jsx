"use client";
import { useEffect, useState, useRef } from "react";
import { useUser } from '@clerk/nextjs';
import Navbar from "../../components/Navbar";

export default function Chat() {
  const { user } = useUser(); // Use Clerk to get the current user
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const chatEndRef = useRef(null); // Reference for auto-scrolling

  // Fetch messages from the server
  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/messages");
      const data = await response.json();
      if (data.success && Array.isArray(data.products)) {
        setMessages(data.products);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  // Fetch messages initially
  useEffect(() => {
    fetchMessages();
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (message.trim() === "" || !user) return;

    const newMessage = {
      userId: user.id,
      message,
      timestamp: new Date().toISOString(),
      name: user.fullName || "Anonymous",
    };

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMessage),
      });
      const result = await response.json();
      if (!result.success) {
        console.error("Error sending message:", result.message);
      } else {
        setMessage("");
        setMessages([...messages, { ...newMessage, _id: result.product }]); // Update local message list
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar />

      <div className="flex justify-center mb-4 bg-transparent">
        <button
          className="px-4 py-2 bg-blue-600 text-white  rounded-lg"
          onClick={fetchMessages}
        >
          Refresh
        </button>
      </div>

      <div className="flex flex-col flex-grow p-4 overflow-y-auto bg-gray-100">
        <div className="flex flex-col space-y-4">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`p-3 rounded-lg shadow-md max-w-[60%] ${
                  user && msg.userId === user.id
                    ? "bg-blue-500 text-white self-start" // User's message on the left
                    : "bg-red-500 text-white self-end"   // Other's message on the right
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">{msg.name}</p>
                    <p className="text-sm text-gray-200">
                      {new Date(msg.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-black">{msg.message}</p>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500">No messages yet</div>
          )}
          <div ref={chatEndRef}></div>
        </div>
      </div>

      <div className="p-4 bg-gray-200 text-black">
        <div className="flex">
          <input
            type="text"
            className="flex-grow p-2 rounded-lg border border-gray-300"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={!user} // Disable input if the user is not loaded
          />
          <button
            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
            onClick={handleSendMessage}
            disabled={!user} // Disable button if the user is not loaded
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
