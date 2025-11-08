import type { GenerateDataDTO } from "../dto";
import { API_BASE_URL } from "@services/api";

export async function generateData(values: GenerateDataDTO) {
  return fetch(`${API_BASE_URL}/datasets/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}
