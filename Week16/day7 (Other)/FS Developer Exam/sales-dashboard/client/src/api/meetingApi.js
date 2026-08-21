import httpClient from "./httpClient";

export async function listMeetings() {
  const { data } = await httpClient.get("/meetings");
  return data;
}

export async function createMeeting(payload) {
  const { data } = await httpClient.post("/meetings", payload);
  return data;
}

export async function updateMeeting(id, payload) {
  const { data } = await httpClient.put(`/meetings/${id}`, payload);
  return data;
}

export async function deleteMeeting(id) {
  await httpClient.delete(`/meetings/${id}`);
}
