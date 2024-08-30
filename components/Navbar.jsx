// components/Navbar.js
import {
  useUser,
  SignInButton,
  SignOutButton,
  UserButton,
  RedirectToSignIn,
  UserProfile,
} from "@clerk/nextjs";
import Link from "next/link";

const Navbar = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>; // Handle loading state
  }

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <h1 className="text-xl font-bold">UnderGround Chat</h1>

      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <span className="font-semibold">
              {user.firstName}
            </span>
            <UserButton />
            <SignOutButton>
              <button className="px-4 py-2 bg-red-600 rounded-lg">
                Logout
              </button>
            </SignOutButton>
          </>
        ) : (
          <SignInButton>
            <button className="px-4 py-2 bg-blue-600 rounded-lg">Login</button>
          </SignInButton>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
