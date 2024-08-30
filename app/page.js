"use client"
import { SignInButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/chat");
    }
  }, [isSignedIn, router]);

  return (
    <div className="flex items-center  justify-center min-h-screen bg-gray-100">
      {!isSignedIn ? (
        <div className="">
          <h1 className="text-3xl text-black font-bold mb-4">
            Welcome to UnderGround Chat
          </h1>
          <SignInButton mode="modal">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg">
              Login
            </button>
          </SignInButton>
        </div>
      ) : (
        <h1 className="text-3xl font-bold">Redirecting to chat...</h1>
      )}
    </div>
  );
}
