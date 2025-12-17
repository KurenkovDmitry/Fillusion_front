export type TableData = {
  name: string;
  query: string;
  totalRecords: string;
  schema: ColumnSchema[];
  examples: string;
};

export type Dataset = {
  requestId: string;
  createdAt: string;
  projectId: string;
  network: string;
  status: "PENDING" | "SUCCESS" | "ERROR";
  tablesCount: string;
  tableNames: string[];
  doneTablesCount: string;
  exportType:
    | "EXPORT_TYPE_UNSPECIFIED"
    | "EXPORT_TYPE_JSON"
    | "EXPORT_TYPE_SNAPSHOT"
    | "EXPORT_TYPE_DIRECT_DB"
    | "EXPORT_TYPE_EXCEL";
};

export type DatasetsResponse = {
  datasets: Dataset[];
};

export type FkData = {
  table: string;
  column: string;
  unique: boolean;
};

export type ColumnSchema = {
  name: string;
  type: string;
  unique: boolean;
  autoIncrement: boolean;
  viaFaker: boolean;
  fakerType: "COLUMN_TYPE_UNSPECIFIED" | string;
  locale: "LOCALE_UNSPECIFIED" | string;
  isPk: boolean;
  isFk: boolean;
  fkData?: FkData;
};

export type ExportType = "EXPORT_TYPE_UNSPECIFIED" | string;

export type GenerateRequest = {
  projectId: string;
  network: string;
  tables: TableData[];
  exportType: ExportType;
};

export type DatasetsRequestResponse = {
  datasets: any;
  exportType: ExportType;
  file: string;
  fileName: string;
};

export type DownloadDatasetFileResponse = {
  contentType: string;
  data: string;
  extensions: any[];
};

export type DownloadAgentOS = "windows" | "linux";
