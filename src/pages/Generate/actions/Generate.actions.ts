import type { GenerateDataDTO } from "../dto";

const API_BASE_URL = "http://127.0.0.1:3000";

export async function generateData(values: GenerateDataDTO) {
  return fetch(`${API_BASE_URL}/generate/data`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}
