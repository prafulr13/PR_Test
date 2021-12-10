import NextAuth from "next-auth";

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(token) {
  try {
    const url = "https://auth.brightspace.com/core/connect/token";
    let urlencoded = new URLSearchParams();
    urlencoded.append("grant_type", "refresh_token");
    urlencoded.append("refresh_token", token.refreshToken);
    urlencoded.append("client_id", process.env.D2LTAMSITE_CLIENT_ID);
    urlencoded.append("client_secret", process.env.D2LTAMSITE_CLIENT_SECRET);

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST",
      body: urlencoded
    });

    const refreshedTokens = await response.json();
    console.log(refreshedTokens);

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken // Fall back to old refresh token
    };
  } catch (error) {
    console.log(error);

    return {
      ...token,
      error: "RefreshAccessTokenError"
    };
  }
}

export default NextAuth({
  providers: [
    {
      id: "tamsite",
      name: "Tamsite",
      type: "oauth",
      version: "2.0",
      scope: process.env.D2LTAMSITE_SCOPE,
      params: { grant_type: "authorization_code" },
      accessTokenUrl: "https://auth.brightspace.com/core/connect/token",
      authorizationUrl:
        "https://auth.brightspace.com/oauth2/auth?response_type=code",
      profileUrl: `${process.env.D2LTAMSITE_BASE_URL}/d2l/api/lp/1.0/users/whoami`,
      async profile(profile, tokens) {
        // You can use the tokens, in case you want to fetch more profile information
        // For example several OAuth providers do not return email by default.
        // Depending on your provider, will have tokens like `access_token`, `id_token` and or `refresh_token`
        console.log(tokens);

        return {
          id: profile.Identifier,
          name: profile.UniqueName
        };
      },
      clientId: process.env.D2LTAMSITE_CLIENT_ID,
      clientSecret: process.env.D2LTAMSITE_CLIENT_SECRET
    }
  ],

  callbacks: {
    async jwt(token, user, account) {
      // Initial sign in
      if (account && user) {
        return {
          accessToken: account.accessToken,
          accessTokenExpires: Date.now() + account.expires_in * 1000,
          refreshToken: account.refresh_token,
          user
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    async session(session, token) {
      if (token) {
        session.user = token.user;
        session.accessToken = token.accessToken;
        session.error = token.error;
      }

      return session;
    },
    async redirect(url, baseUrl) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    }
  }
});
