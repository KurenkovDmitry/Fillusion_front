import type { GenerateDataDTO } from "../dto";
const API_BASE_URL = "http://127.0.0.1:8085/api/v1";


export async function generateData(values: GenerateDataDTO) {
  return fetch(`${API_BASE_URL}/datasets/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}
