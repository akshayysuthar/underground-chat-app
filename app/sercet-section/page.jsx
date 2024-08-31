"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import Navbar from "../../components/Navbar";
import { Button } from "../../components/ui/button";

export default function Chat() {
  const { user } = useUser(); // Use Clerk to get the current user
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const chatEndRef = useRef(null); // Reference for auto-scrolling

  // Fetch messages from the server
  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch("/api/serect");
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      console.log("Fetched data:", data); // Debugging line
      if (data.success && Array.isArray(data.products)) {
        setMessages(data.products);
      } else {
        console.error(
          "Failed to fetch messages:",
          data.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }, []);

  // Fetch messages initially
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

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
      const response = await fetch("/api/serect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMessage),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();
      if (!result.success) {
        console.error("Error sending message:", result.message);
      } else {
        setMessage("");
        setMessages((prevMessages) => [
          ...prevMessages,
          { ...newMessage, _id: result.product },
        ]); // Update local message list
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };
  const handleDeleteMessage = async (id) => {
    try {
      const response = await fetch(`/api/serect/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();
      if (result.success) {
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg._id !== id)
        );
      } else {
        console.error("Error deleting message:", result.message);
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar />

      <div className="flex justify-center mb-4">
        <Button
          className="px-4 py-2 bg-transparent text-blue-600 border border-blue-600 rounded-lg"
          onClick={fetchMessages}
        >
          Refresh
        </Button>
      </div>

      <div className="flex flex-col flex-grow p-4 overflow-y-auto">
        <div className="flex flex-col space-y-4">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`p-3 rounded-lg shadow-md max-w-[60%] ${
                  user && msg.userId === user.id
                    ? "bg-blue-500 text-white self-start" // User's message on the left
                    : "bg-red-500 text-white self-end" // Other's message on the right
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
                {user && msg.userId === user.id && (
                  <button
                    className="ml-2 text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteMessage(msg._id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500">No messages yet</div>
          )}
          <div ref={chatEndRef}></div>
        </div>
      </div>

      <div className="p-4 text-black">
        <div className="flex">
          <input
            type="text"
            className="flex-grow p-2 rounded-lg border text-white border-gray-300"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={!user} // Disable input if the user is not loaded
          />
          <Button
            variant="outline"
            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
            onClick={handleSendMessage}
            disabled={!user} // Disable button if the user is not loaded
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
