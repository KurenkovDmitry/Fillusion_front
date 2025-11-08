import { apiServiceClient } from "../client";

import {
  ApiResponse,
  ApiTable,
  ApiTableResponse,
  RelationApi,
  RelationCreate,
  TableCreate,
} from "./SchemaService.types";

export const SchemaService = {
  async getSchema(projectId: string): Promise<ApiResponse> {
    return apiServiceClient.get<ApiResponse>(`/projects/${projectId}/schema`);
  },

  async getTable(projectId: string, tableId: string): Promise<ApiTable> {
    return apiServiceClient.get<ApiTable>(
      `/projects/${projectId}/tables/${tableId}`
    );
  },

  async createRelation(
    projectId: string,
    data: RelationCreate
  ): Promise<RelationApi> {
    return apiServiceClient.post<RelationApi>(
      `/projects/${projectId}/relations`,
      data
    );
  },

  async createTable(
    projectId: string,
    data: TableCreate
  ): Promise<ApiTableResponse> {
    return apiServiceClient.post<ApiTableResponse>(
      `/projects/${projectId}/tables`,
      data
    );
  },

  async updateRelation(
    projectId: string,
    relationId: string,
    data: RelationCreate
  ): Promise<RelationApi> {
    return apiServiceClient.patch<RelationApi>(
      `/projects/${projectId}/relations/${relationId}`,
      data
    );
  },

  async updateTable(
    projectId: string,
    tableId: string,
    data: ApiTable
  ): Promise<ApiTable> {
    return apiServiceClient.patch<ApiTable>(
      `/projects/${projectId}/tables/${tableId}`,
      data
    );
  },

  async deleteRelation(projectId: string, relationId: string): Promise<void> {
    return apiServiceClient.delete(
      `/projects/${projectId}/relations/${relationId}`
    );
  },

  async deleteTable(projectId: string, tableId: string): Promise<void> {
    return apiServiceClient.delete(`/projects/${projectId}/tables/${tableId}`);
  },
};
