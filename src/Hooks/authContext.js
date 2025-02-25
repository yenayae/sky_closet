// AuthContext.js
import React, { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../supabase/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);

  // Fetch the session on initial load and listen for auth state changes.
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
    };

    getSession();

    // Monitor auth state changes.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Update the session with additional profile info (like username) when a session exists.
  useEffect(() => {
    const fetchUserProfile = async () => {
      // Only fetch profile if user exists and the username is not already set.
      if (session?.user && !session.user.username) {
        const { data: profile, error } = await supabase
          .from("users")
          .select("username")
          .eq("id", session.user.id)
          .single();

        if (!error && profile) {
          // Update the session with the username.
          const updatedUser = { ...session.user, username: profile.username };
          setSession({ ...session, user: updatedUser });
        }
      }
    };

    fetchUserProfile();
  }, [session?.user, session]);

  return (
    <AuthContext.Provider value={{ session, user: session?.user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
