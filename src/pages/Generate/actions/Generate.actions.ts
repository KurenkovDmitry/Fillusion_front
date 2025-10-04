import type { GenerateDataDTO } from "../dto";

const API_BASE_URL = "https://api.example.com";

export async function generateData(values: GenerateDataDTO) {
  return fetch(`${API_BASE_URL}/api/v1/datasets/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}
