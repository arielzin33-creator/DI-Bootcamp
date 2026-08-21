import httpClient from "./httpClient";

export async function listCompanies() {
  const { data } = await httpClient.get("/companies");
  return data;
}

export async function createCompany(payload) {
  const { data } = await httpClient.post("/companies", payload);
  return data;
}

export async function updateCompany(id, payload) {
  const { data } = await httpClient.put(`/companies/${id}`, payload);
  return data;
}

export async function deleteCompany(id) {
  await httpClient.delete(`/companies/${id}`);
}
