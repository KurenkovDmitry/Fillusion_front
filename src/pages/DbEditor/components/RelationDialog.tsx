// components/RelationDialog.tsx
import { Dialog, Button } from "@mui/material";
import { Relation, RelationType } from "@store/schemaStore";
import useSchemaStore from "@store/schemaStore";
import { useState, useEffect } from "react";
import { SelectField } from "../../Generate/components/SelectField";
import { SchemaService } from "@services/api";
import { getTableLayoutPayload } from "../DbEditor";

interface RelationDialogProps {
  relation: Relation | null;
  projectId: string;
  open: boolean;
  onClose: () => void;
}
const selectOptions = [
  { value: "one-to-one", label: "Один-к-одному (1:1)" },
  { value: "one-to-many", label: "Один-ко-многим (1:N)" },
  { value: "many-to-one", label: "Многие-к-одному (N:1)" },
  { value: "many-to-many", label: "Многие-ко-многим (N:M)" },
];

export const RelationDialog = (props: RelationDialogProps) => {
  const updateRelation = useSchemaStore((state) => state.updateRelation);
  const removeRelation = useSchemaStore((state) => state.removeRelation);
  const updateField = useSchemaStore((state) => state.updateField);
  const getAllTables = useSchemaStore((state) => state.getAllTables);

  const [relationType, setRelationType] = useState<RelationType>("one-to-many");

  useEffect(() => {
    if (props.relation) {
      setRelationType(props.relation.type);
    }
  }, [props.relation]);

  const handleSave = () => {
    if (props.relation) {
      updateRelation(props.relation.id, { type: relationType });
      SchemaService.updateRelation(props.projectId, props.relation.id, {
        ...props.relation,
        type: relationType,
      });
      props.onClose();
    }
  };

  const handleDelete = async () => {
    if (!props.relation || !props.projectId) return;

    try {
      await SchemaService.deleteRelation(props.projectId, props.relation.id);

      removeRelation(props.relation.id);

      updateField(props.relation.fromTable, props.relation.fromField, {
        isForeignKey: false,
      });
      const table = getAllTables().find(
        (t) => t.id === props.relation?.toTable
      );
      if (!table) return;

      await SchemaService.updateTable(props.projectId, props.relation.toTable, {
        ...table,
        layout: getTableLayoutPayload(table),
      });

      props.onClose();
    } catch (error) {
      console.error("Failed to delete relation:", error);
    }
  };
  const tables = useSchemaStore((state) => state.tables);

  if (!props.relation) return null;

  const fromTable = tables[props.relation.fromTable];
  const toTable = tables[props.relation.toTable];
  const fromField = fromTable?.fields.find(
    (f) => f.id === props.relation!.fromField
  );
  const toField = toTable?.fields.find((f) => f.id === props.relation!.toField);

  return (
    <Dialog open={props.open} onClose={props.onClose} maxWidth="sm" fullWidth>
      <div style={{ padding: "24px", backgroundColor: "#fff", color: "#000" }}>
        <h2 style={{ margin: "0 0 16px", fontSize: "18px", color: "#000" }}>
          Редактирование связи
        </h2>

        <div style={{ marginBottom: "12px", fontSize: "14px", color: "#666" }}>
          <div style={{ marginBottom: "8px" }}>
            <strong>{fromTable?.name}</strong>.{fromField?.name} →{" "}
            <strong>{toTable?.name}</strong>.{toField?.name}
          </div>
        </div>

        <SelectField
          value={relationType}
          onChange={(val: string | string[]) =>
            setRelationType(val as RelationType)
          }
          label="Тип связи"
          options={selectOptions}
        />

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "18px",
            height: "38px",
          }}
        >
          <Button
            onClick={props.onClose}
            sx={{
              color: "#666",
              border: "1px solid #ddd",
              textTransform: "none",
              borderRadius: "10px",
              fontSize: "14px",
              padding: "8px 20px",
              backgroundColor: "#f5f5f5",
              "&:hover": { backgroundColor: "#e8e8e8" },
            }}
          >
            Отмена
          </Button>

          <Button
            onClick={handleDelete}
            sx={{
              color: "#fff",
              backgroundColor: "#d32f2f",
              textTransform: "none",
              borderRadius: "10px",
              fontSize: "14px",
              padding: "8px 20px",
              marginLeft: "auto",
              "&:hover": { backgroundColor: "#b71c1c" },
            }}
          >
            Удалить связь
          </Button>

          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              backgroundColor: "#4A90E2",
              color: "#fff",
              textTransform: "none",
              borderRadius: "10px",
              fontSize: "14px",
              padding: "8px 20px",
              "&:hover": { backgroundColor: "#357ABD" },
            }}
          >
            Сохранить
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
