"use client";
import { useEffect, useState, useRef } from 'react';
import { UserButton, useUser, SignOutButton } from '@clerk/nextjs';

export default function Chat() {
  const { user, isLoaded } = useUser(); // Add isLoaded to ensure user data is fully loaded
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const chatEndRef = useRef(null); // 

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/messages');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (data.success && Array.isArray(data.products)) {
          setMessages(data.products);
          scrollToBottom(); // Scroll to bottom after fetching messages
        } else {
          console.error('Expected an array but got:', data);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };

    fetchMessages(); // Initial fetch on mount

    // Set up polling to fetch new messages periodically
    const intervalId = setInterval(fetchMessages, 1000); // Fetch every 5 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleSendMessage = async () => {
    if (message.trim() === '' || !user) return; // Ensure user is available

    const newMessage = {
      userId: user.id,
      message,
    };

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMessage),
      });
      setMessage(''); // Clear input after sending
      // Optionally refetch messages immediately to show the new message
      // await fetchMessages(); 
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>; // Handle the loading state
  }

  if (!user) {
    return <div>Please log in to access the chat.</div>; // Handle case where user is not logged in
  }


  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-4 bg-gray-800 text-white">
        <h1 className="text-xl font-bold">UnderGround Chat</h1>
        <div className="flex items-center space-x-4">
          <UserButton />
          <SignOutButton>
            <button className="px-4 py-2 bg-red-600 rounded-lg">Logout</button>
          </SignOutButton>
        </div>
      </nav>

      {/* Chat section */}
      <div className="flex flex-col flex-grow p-4 overflow-y-auto bg-gray-100">
        <div className="flex flex-col space-y-4">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`p-3 rounded-lg shadow-md ${msg.userId === user.id ? 'self-end bg-blue-500 text-white' : 'bg-white'}`}
              >
                {msg.message}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500">No messages yet</div>
          )}
          <div ref={chatEndRef} /> {/* Empty div to scroll to */}
        </div>
      </div>

      {/* Message input */}
      <div className="p-4 bg-gray-200 text-black">
        <div className="flex">
          <input
            type="text"
            className="flex-grow p-2 rounded-lg border border-gray-300"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
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
