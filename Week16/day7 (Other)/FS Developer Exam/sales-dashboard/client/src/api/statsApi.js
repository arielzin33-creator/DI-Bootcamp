import httpClient from "./httpClient";

export async function getMeetingsPerDay(days = 30) {
  const { data } = await httpClient.get("/stats/meetings-per-day", { params: { days } });
  return data;
}

export async function getMeetingsThisMonth() {
  const { data } = await httpClient.get("/stats/meetings-this-month");
  return data;
}

export async function getMeetingsPerDayPercentage() {
  const { data } = await httpClient.get("/stats/meetings-per-day-percentage");
  return data;
}
