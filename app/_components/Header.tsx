import { syncUser } from "../../lib/syncUser";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUp,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { DollarSign } from "lucide-react";
import Link from "next/link";
import React from "react";

const Header = async () => {
  await syncUser();

  return (
    <nav className="bg-white border-gray-100 border-b fixed top-0 w-full">
      <div className="mx-auto px-1 sm:px-2 lg:px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <DollarSign className="h-6 w-6 text-primary-600" />
            <span className="ml-2 font-bold text-xl text-gray-900">
              FinTrack
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <SignedOut>
              <SignUpButton>
                <button className="btn-primary">SignUp</button>
              </SignUpButton>
              <SignInButton>
                <button className="btn-secondary">Login</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href={"/dashboard"} className="btn-primary">
                Go To Dashboard
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                  },
                }}
              />
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
