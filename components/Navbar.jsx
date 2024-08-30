import { SignOutButton, UserButton } from "@clerk/nextjs";
import React from "react";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <h1 className="text-xl font-bold">UnderGround Chat</h1>
      <div className="flex items-center space-x-4">
        <UserButton />
        <SignOutButton>
          <button className="px-4 py-2 bg-red-600 rounded-lg">Logout</button>
        </SignOutButton>
      </div>
    </nav>
  );
};

export default Navbar;
