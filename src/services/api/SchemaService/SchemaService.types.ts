export type ApiField = {
  id: string;
  name: string;
  type: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  visible?: boolean; // если чо подключим
  position?: number;
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
  meta?: meta;
  layout: {
    x: number;
    y: number;
  };
  fields: ApiField[];
};

export type ApiTableResponseInternal = {
  id: string;
  name: string;
  x: number;
  y: number;
  meta?: Partial<meta>;
  fields: ApiField[];
};

export type meta = {
  query: string;
  totalRecords: number;
  examples: string;
  selectModelValue: "deepseek" | "gemini";
  selectOutputValue:
    | "EXPORT_TYPE_JSON"
    | "EXPORT_TYPE_SNAPSHOT"
    | "EXPORT_TYPE_DIRECT_DB";
};

export type ApiTable = {
  table: ApiTableInternal;
};

export type ApiResponse = {
  schema: {
    tables: ApiTableResponseInternal[];
    relations: Relation[];
  };
};

export type ApiTableResponse = {
  table: ApiTableResponseInternal;
};

export type RelationType =
  | "one-to-one"
  | "one-to-many"
  | "many-to-many"
  | "many-to-one";

export interface Relation {
  id: string;
  fromTable: string;
  toTable: string;
  fromField: string;
  toField: string;
  type: RelationType;
  fromHandle: "left" | "right";
  toHandle: "left" | "right";
}

export interface RelationApi {
  relation: Relation;
}

export type RelationCreate = Omit<Relation, "id">;

export type FieldCreate = Omit<ApiField, "id">;

type TableCreateInternal = Omit<ApiTableInternal, "id"> & {
  fields: FieldCreate[];
};

export interface TableCreate {
  table: TableCreateInternal;
}
