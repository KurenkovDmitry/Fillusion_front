export interface GenerateDataDTO {
  name: string;
  projectId: string;
  query: string;
  network: string;
  totalRecords: string;
  schema: {
    id: string;
    name: string;
    type: string;
    unique?: boolean;
    autoIncrement?: boolean;
    viaFaker?: boolean;
    fakerType?: string;
    locale?: "RU_RU" | "EN_US";
  }[];
  examples?: string;
  fkData?: {
    columnName: string;
    items: string[];
  }[];
}
