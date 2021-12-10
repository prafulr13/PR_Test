import React from "react";
import Link from "next/link";

import { useSession, signIn, signOut } from "next-auth/client";

export default function Navbar() {
  const [session] = useSession();

  if (session) {
    return (
      <>
        <div>
          Signed in as {session.user.name} <br />
          <button onClick={() => signOut()}>Sign out</button>
          <br />
          <ul>
            <li>
              <Link href="/">
                <a>Home</a>
              </Link>
            </li>
            <li>
              <Link href="/whoami">
                <a>Brightspace User Details</a>
              </Link>
            </li>
            <li>
              <Link href="/create-course">
                <a>Create-Course</a>
              </Link>
            </li>
          </ul>
        </div>
      </>
    );
  }
  return (
    <>
      <div>
        Not signed in <br />
        <button onClick={() => signIn()}>Sign in</button>
      </div>
    </>
  );
}
