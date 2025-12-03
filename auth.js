import { supabase } from './client';

// Create a new user in Supabase
export async function signUpUser(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  return { data, error };
}

// Sign in an existing user
export async function signInUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

// Sign the user out
export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  return { error };
}
