import { ConnectionOptions } from "../../../pages/QueryHistory/components/DatasetDialog";
import { apiGeneratorClient } from "../client";
import {
  DatasetsRequestResponse,
  DatasetsResponse,
  DownloadAgentOS,
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
      `/datasets/${requestId}?project_id=${projectId}`
    );
  },

  async downloadFile(requestId: string, projectId: string): Promise<any> {
    return apiGeneratorClient.downloadFileAsBlob(requestId, projectId);
  },

  async downloadAgent(platform: DownloadAgentOS, arch = "amd64"): Promise<any> {
    return apiGeneratorClient.downloadFileAsBlob(
      "",
      "",
      `/agent/download/${platform}/${arch}`
    );
  },
};
