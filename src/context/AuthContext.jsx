import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../config/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function mapUser(supabaseUser) {
    if (!supabaseUser) return null;
    const meta = supabaseUser.user_metadata || {};
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      name: meta.full_name || meta.name || supabaseUser.email.split("@")[0],
      role: meta.role || "client",
      company: meta.company || "",
      phone: meta.phone || "",
      plan: meta.is_trial ? "trial" : "standard",
    };
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session ? mapUser(session.user) : null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session ? mapUser(session.user) : null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    setUser(mapUser(data.user));
    return data;
  }

  async function signup({ email, password, name, role, company, phone, isTrial = false }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role,
          company: company || "",
          phone: phone || "",
          is_trial: isTrial,
        },
      },
    });
    if (error) throw error;
    setUser(mapUser(data.user));
    return data;
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
