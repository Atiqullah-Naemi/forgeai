"use client";

import Image from "next/image";
import Link from "next/link";
import { SignInButton, useAuth, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";

export function NavMenu() {
  const auth = useAuth();

  return (
    <nav className="flex justify-between items-center h-16 bg-white/89 shadow-lg rounded-sm w-full px-5">
      <div className="flex gap-6 items-center">
        <Link
          className="relative w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center"
          href="/"
        >
          <Image
            src="/logo.svg"
            alt="forgeai logo"
            fill
            className="object-contain p-1"
          />
        </Link>
        {auth.isSignedIn && <Link href="/projects">Projects</Link>}
        <Link href="#pricing">Pricing</Link>
      </div>

      <div className="flex gap-6">
        {auth.isSignedIn ? (
          <UserButton showName />
        ) : (
          <SignInButton>
            <Button className="cursor-pointer border-none text-white px-6">
              Sign In
            </Button>
          </SignInButton>
        )}
      </div>
    </nav>
  );
}
