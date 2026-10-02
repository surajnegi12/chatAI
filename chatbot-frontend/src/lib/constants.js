export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const STORAGE_KEYS = {
  TOKEN: "chatbot_jwt_token",
  USER: "chatbot_user",
};

export const SENDER = {
  USER: "USER",
  BOT: "BOT",
};