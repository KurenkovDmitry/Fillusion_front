import type { GenerateDataDTO } from "../dto";
import { API_BASE_URL, apiServiceClient } from "@services/api";

// type GenerateDataDTO = {
//   projectId: string;
//   query: string;
//   network: string;
//   totalRecords: string;
//   schema: {
//     name: string;
//     type: string;
//     // isPrimaryKey?: boolean | undefined;
//     // isForeignKey?: boolean | undefined;
//     unique?: boolean | undefined;
//     autoIncrement?: boolean | undefined;
//     viaFaker?: boolean | undefined;
//     fakerType?: string | undefined;
//     locale?: "RU_RU" | "EN_US" | undefined;
//   }[];
//   examples: string | undefined;
//   fkData?: [
//     {
//       columnName: string;
//       items: string[];
//     }
//   ];
//   exportType?: string;
// };

// {
//   "projectId": "string",
//   "query": "string",
//   "network": "string",
//   "totalRecords": "string",
//   "schema": [
//     {
//       "name": "string",
//       "type": "string",
//       "unique": true,
//       "autoIncrement": true,
//       "viaFaker": true,
//       "fakerType": "COLUMN_TYPE_UNSPECIFIED",
//       "locale": "LOCALE_UNSPECIFIED"
//     }
//   ],
//   "examples": "string",
//   "fkData": [
//     {
//       "columnName": "string",
//       "items": [
//         "string"
//       ]
//     }
//   ],
//   "exportType": "EXPORT_TYPE_UNSPECIFIED"
// }

export async function generateData(values: GenerateDataDTO): Promise<JSON> {
  return apiServiceClient.post(`/datasets/generate`, values);

  // return fetch(`${API_BASE_URL}/datasets/generate`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(values),
  // });
}
