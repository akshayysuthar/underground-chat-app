"use client";
import { useEffect, useState, useRef } from "react";
import { UserButton, useUser, SignOutButton } from "@clerk/nextjs";
import Navbar from "../../components/Navbar";

export default function Chat() {
  const { user, isLoaded } = useUser();
  // const { sessionId } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const chatEndRef = useRef(null); // Reference for auto-scrolling

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch("/api/messages");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        if (data.success && Array.isArray(data.messages)) {
          setMessages(data.messages);
        } else {
          console.error("Expected an array but got:", data);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages(); // Initial fetch on mount

    const intervalId = setInterval(fetchMessages, 2500); // Fetch every 5 seconds

    return () => clearInterval(intervalId);
  }, []);

  const handleSendMessage = async () => {
    if (message.trim() === "" || !user) return;

    const newMessage = {
      userId: user.id,
      name: user.fullName,
      message,
    };

    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMessage),
      });
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleDeleteMessage = async (id) => {
    try {
      await fetch("/api/messages", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      setMessages(messages.filter((msg) => msg._id !== id));
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to access the chat.</div>;
  }

  return (
    <div className="flex flex-col h-screen text-black">
      <Navbar />

      <div className="flex flex-col flex-grow p-4 overflow-y-auto bg-gray-100">
        <div className="flex flex-col space-y-4">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`p-3 rounded-lg shadow-md bg-white`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">{msg.name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(msg.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {msg.userId === user.id && (
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
