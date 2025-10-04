export interface GenerateDataDTO {
  query: string;
  network: string;
  totalRecords: string;
  schema: {
    name: string;
    type: string;
    unique: false;
    autoIncrement: false;
  }[];
  examples?: string;
  fkData?: {
    columnName: string;
    items: string[];
  };
}
