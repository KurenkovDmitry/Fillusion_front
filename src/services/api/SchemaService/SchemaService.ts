import { TableSchema } from "@store/schemaStore";
import { apiServiceClient } from "../client";

import {
  ApiField,
  ApiResponse,
  ApiTable,
  ApiTableInternal,
  ApiTableResponse,
  RelationApi,
  RelationCreate,
  TableCreate,
} from "./SchemaService.types";

type FrontSchemaField = {
  id: string;
  name: string;
  type: string;
  isPrimaryKey?: boolean | undefined;
  isForeignKey?: boolean | undefined;
  unique?: boolean | undefined;
  autoIncrement?: boolean | undefined;
  viaFaker?: boolean | undefined;
  fakerType?: string | undefined;
  locale?: "RU_RU" | "EN_US" | undefined;
};

// export type ApiField = {
//   id: string;
//   name: string;
//   type: string;
//   isPrimaryKey?: boolean;
//   isForeignKey?: boolean;
//   visible?: boolean; // хуй знает, если чо подключим
//   generation?: {
//     uniqueValues?: boolean;
//     autoIncrement?: boolean;
//     viaFaker?: boolean;
//     fakerType?: string;
//     fakerLocale?: string;
//   };
// };

const mapSchemaToBack = (table: TableSchema): ApiTableInternal => {
  return {
    id: table.id,
    name: table.name,
    layout: table.layout,
    fields: table.fields.map((field: FrontSchemaField): ApiField => {
      return {
        name: field.name,
        type: field.type,
        isPrimaryKey: field.isPrimaryKey,
        generation: {
          uniqueValues: field.unique,
          autoIncrement: field.autoIncrement,
          viaFaker: field.viaFaker,
          fakerType: field.fakerType,
          fakerLocale: field.locale,
        },
      };
    }),
  };
};

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
      mapSchemaToBack(data.table)
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
