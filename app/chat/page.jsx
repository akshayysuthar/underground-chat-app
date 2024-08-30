"use client";
import { useEffect, useState, useRef } from "react";
import Navbar from "../../components/Navbar";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userType, setUserType] = useState(null); // Store selected user type

  const chatEndRef = useRef(null); // Reference for auto-scrolling

  // Fetch messages from the server
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch("/api/messages");
        const data = await response.json();
        if (data.success && Array.isArray(data.products)) {
          setMessages(
            data.products.filter(
              (msg) => msg.userId === selectedUser?.id || userType === "admin"
            )
          );
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages(); // Initial fetch on mount
    const intervalId = setInterval(fetchMessages, 5000); // Polling for new messages

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [selectedUser, userType]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (message.trim() === "") return;
  
    const newMessage = {
      userId: userType === "admin" ? "admin" : `user_${Math.random().toString(36).substring(7)}`,
      message,
      timestamp: new Date().toISOString(),
      name: selectedUser?.fullName || "Anonymous",
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
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };
  

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setUserType(user.id);
    localStorage.setItem("lastUserType", user.id);
  };

  // Fetch the last selected user from localStorage
  useEffect(() => {
    const lastUserType = localStorage.getItem("lastUserType");
    if (lastUserType) {
      setUserType(lastUserType);
      setSelectedUser({ id: lastUserType, fullName: lastUserType === "admin" ? "Admin User" : "Demo User" });
    }
  }, []);

  // Handle message deletion
  const handleDeleteMessage = async (id) => {
    try {
      await fetch(`/api/messages/${id}`, { method: "DELETE" });
      setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== id));
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="mb-4">
        <h2>Select a user to chat with:</h2>
        <ul className="flex space-x-4">
          <li>
            <button
              className={`px-4 py-2 rounded-lg ${userType === "admin" ? "bg-blue-500 text-white" : "bg-gray-300"}`}
              onClick={() => handleUserSelect({ id: "admin", fullName: "Admin User" })}
            >
              Admin
            </button>
          </li>
          <li>
            <button
              className={`px-4 py-2 rounded-lg ${userType === "demo" ? "bg-blue-500 text-white" : "bg-gray-300"}`}
              onClick={() => handleUserSelect({ id: "demo", fullName: "Demo User" })}
            >
              Demo
            </button>
          </li>
        </ul>
      </div>

      <div className="flex flex-col flex-grow p-4 overflow-y-auto bg-gray-100">
        <div className="flex flex-col space-y-4">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`p-3 rounded-lg shadow-md ${msg.userId === "admin" ? "bg-blue-500 text-white" : "bg-red-500 text-white"}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">{msg.name}</p>
                    <p className="text-sm text-gray-200">
                      {new Date(msg.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {msg.userId === userType && (
                    <button
                      className="text-red-600"
                      onClick={() => handleDeleteMessage(msg._id)}
                    >
                      Delete
                    </button>
                  )}
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
          />
          <button
            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
            onClick={handleSendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
