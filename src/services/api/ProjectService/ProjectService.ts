import { ConnectionOptions } from "../../../pages/QueryHistory/components/DatasetDialog";
import { apiServiceClient } from "../client";
import {
  CreateProjectRequest,
  Project,
  UpdateProjectRequest,
} from "./ProjectService.types";

export const ProjectService = {
  async getProjects(): Promise<{ projects: Project[] }> {
    return apiServiceClient.get<{ projects: Project[] }>("/projects");
  },

  async createProject(data: CreateProjectRequest): Promise<Project> {
    return apiServiceClient.post<Project>("/projects", data);
  },

  async updateProject(
    projectId: string,
    data: UpdateProjectRequest
  ): Promise<Project> {
    return apiServiceClient.patch<Project>(`/projects/${projectId}`, data);
  },

  async deleteProject(projectId: string): Promise<void> {
    return apiServiceClient.delete(`/projects/${projectId}`);
  },

  async directFill(
    projectId: string,
    data: ConnectionOptions & { engine: string }
  ): Promise<any> {
    return apiServiceClient.post(
      `/projects/${projectId}/datasets/${projectId}/direct-fill`,
      data
    );
  },
};
