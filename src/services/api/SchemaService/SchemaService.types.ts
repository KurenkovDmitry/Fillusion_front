export type ApiField = {
  id: string;
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  generation?: {
    uniqueValues?: boolean;
    autoIncrement?: boolean;
    viaFaker?: boolean;
    fakerType?: string;
    fakerLocale?: string;
  };
};

export type ApiTableInternal = {
  id: string;
  name: string;
  layout: {
    x: number;
    y: number;
  };
  fields: ApiField[];
};

export type ApiTable = {
  table: ApiTableInternal;
};

export type ApiResponse = {
  schema: {
    tables: ApiTableInternal[];
    relations: any[];
  };
};

export interface Relation {
  id: string;
  fromTable: string;
  toTable: string;
  fromField: string;
  toField: string;
  type: string;
}

export interface RelationApi {
  relation: Relation;
}

export type RelationCreate = Omit<Relation, "id">;

export type FieldCreate = Omit<ApiField, "id">;

type TableCreateInternal = Omit<ApiTable, "id"> & {
  fields: FieldCreate[];
};

export interface TableCreate {
  table: TableCreateInternal;
}
