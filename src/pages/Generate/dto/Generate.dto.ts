export interface GenerateDataDTO {
  projectId: string;
  query: string;
  network: string;
  totalRecords: string;
  schema: {
    name: string;
    type: string;
    unique: boolean;
    autoIncrement: boolean;
  }[];
  examples?: string;
  fkData?: {
    columnName: string;
    items: string[];
  }[];
}
