"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { MessageCircle } from "lucide-react";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        if (!formData.name.trim()) throw new Error("Name is required");
        await signup(formData.name, formData.email, formData.password);
      } else {
        await login(formData.email, formData.password);
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 p-8 shadow-xl">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-500 flex items-center justify-center mb-3">
            <MessageCircle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-neutral-100">
            {isSignUp ? "Sign In" : "Log In"}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            {isSignUp
              ? "Sign up to start chatting"
              : "Enter your credentials to access your chats"}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <Input
              label="Full Name"
              id="name"
              placeholder=""
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          )}

          <Input
            label="Email Address"
            id="email"
            type="email"
            placeholder=""
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />

          <Input
            label="Password"
            id="password"
            type="password"
            placeholder=""
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />

          <Button type="submit" disabled={loading} className="w-full mt-2">
            {loading ? <Spinner size="sm" /> : isSignUp ? "Sign Up" : "Log In"}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-neutral-400">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            className="text-blue-400 hover:underline font-semibold ml-1"
          >
            {isSignUp ? "Log in" : "Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}