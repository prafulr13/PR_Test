import React from "react";
import { useSession } from "next-auth/client";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

const queryClient = new QueryClient();
export default function Whoami() {
  const [session, loading] = useSession();

  if (typeof window !== "undefined" && loading) return null;

  if (session)
    return (
      <QueryClientProvider client={queryClient}>
        <GetUser />
      </QueryClientProvider>
    );

  return <p>Access Denied</p>;
}

function GetUser() {
  const [session] = useSession();
  console.log("GetUser" + useSession);
  const { status, data } = useQuery("getuser", () =>
    fetch(`https://tamsite.desire2learn.com/d2l/api/lp/1.0/users/whoami`, {
      headers: { Authorization: "Bearer " + session.accessToken }
    }).then((res) => res.json())
  );

  if (status === "loading") return <p>Loading...</p>;
  if (status === "error") return <p>Error :</p>;

  return (
    <body>
      <div>
        <h1>Who am I</h1>

        <h2>
          {data.FirstName} {data.LastName}
        </h2>

        <p>
          Identifier: {data.Identifier} <br />
          Profile Identifier: {data.ProfileIdentifier}
        </p>
      </div>
      <ReactQueryDevtools initialIsOpen />
    </body>
  );
}
