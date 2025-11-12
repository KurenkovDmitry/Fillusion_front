import { apiServiceClient } from "../client";
import { apiGeneratorClient } from "../client";
import {
  DatasetsRequestResponse,
  DatasetsResponse,
  DownloadDatasetFileResponse,
  GenerateRequest,
} from "./GenerateService.types";

export const GenerateService = {
  async getDatasets(projectId: string): Promise<DatasetsResponse> {
    return apiGeneratorClient.get<DatasetsResponse>(
      `/datasets?project_id=${projectId}`
    );
  },

  async generateData(generatePayload: GenerateRequest): Promise<any> {
    return apiGeneratorClient.post<any>(`/datasets/generate`, generatePayload);
  },

  async getDataset(
    requestId: string,
    projectId: string
  ): Promise<DatasetsRequestResponse> {
    return apiGeneratorClient.get<DatasetsRequestResponse>(
      `datasets/${requestId}?project_id=${projectId}`
    );
  },

  async downloadFile(
    requestId: string,
    projectId: string
  ): Promise<DownloadDatasetFileResponse> {
    return apiGeneratorClient.get<DownloadDatasetFileResponse>(
      `/datasets/${requestId}/download?project_id=${projectId}`
    );
  },
};
