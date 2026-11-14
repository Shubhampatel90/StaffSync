import axios from "axios";

const api = axios.create({
  baseURL: "https://staffsync-w6wn.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;