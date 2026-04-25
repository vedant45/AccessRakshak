import axios from "axios";
import { API_URL } from "./config";

export function getApi(token: string) {
  return axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${token}` },
  });
}