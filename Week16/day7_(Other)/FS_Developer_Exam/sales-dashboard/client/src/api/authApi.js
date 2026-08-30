import httpClient from "./httpClient";

export async function login(username, password) {
  const { data } = await httpClient.post("/auth/login", { username, password });
  return data;
}
