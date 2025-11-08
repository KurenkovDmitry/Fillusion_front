export type GenerateDataDTO = {
  projectId: string;
  query: string;
  network: string;
  totalRecords: string;
  schema: {
    name: string;
    type: string;
    // isPrimaryKey?: boolean | undefined;
    // isForeignKey?: boolean | undefined;
    unique?: boolean | undefined;
    autoIncrement?: boolean | undefined;
    viaFaker?: boolean | undefined;
    fakerType?: string | undefined;
    locale?: "RU_RU" | "EN_US" | undefined;
  }[];
  examples: string | undefined;
  fkData?: [
    {
      columnName: string;
      items: string[];
    }
  ];
  exportType?: string;
};

// export interface GenerateDataDTO {
//   name: string;
//   projectId: string;
//   query: string;
//   network: string;
//   totalRecords: string;
//   schema: {
//     id: string;
//     name: string;
//     type: string;
//     unique?: boolean;
//     autoIncrement?: boolean;
//     viaFaker?: boolean;
//     fakerType?: string;
//     locale?: "RU_RU" | "EN_US";
//   }[];
//   examples?: string;
//   fkData?: {
//     columnName: string;
//     items: string[];
//   }[];
// }
