// components/PkSettings.tsx
import {
  IconButton,
  Popover,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
} from "@mui/material";
import {
  mapTableToApiPayload,
  SchemaField,
  TableSchema,
} from "@store/schemaStore";
import { useState, useEffect } from "react";
import { SelectField } from "./SelectField";
import useSchemaStore, { RelationType } from "../../../store/schemaStore";
import { SchemaService } from "@services/api";

interface PkSettingsProps {
  field: SchemaField;
  tableId: string;
  projectId: string;
}

type KeyType = "regular" | "primary" | "foreign";

export const getTableLayoutPayload = (currentTable: TableSchema) => {
  return {
    x: Math.round(currentTable.layout.x),
    y: Math.round(currentTable.layout.y),
  };
};

export const PkSettings = (props: PkSettingsProps) => {
  const { field, tableId } = props;

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  // Получаем методы из store
  const updateField = useSchemaStore((state) => state.updateField);
  const tables = useSchemaStore((state) => state.tables);
  const relations = useSchemaStore((state) => state.relations);
  const getFieldKeyType = useSchemaStore((state) => state.getFieldKeyType);
  const getReferencedInfo = useSchemaStore((state) => state.getReferencedInfo);
  const removeRelation = useSchemaStore((state) => state.removeRelation);
  const addRelation = useSchemaStore((state) => state.addRelation);
  const getCurrentTable = useSchemaStore((state) => state.getCurrentTable);

  // Определяем тип ключа на основе relations
  const currentKeyType = getFieldKeyType(tableId, field.id);
  const referencedInfo = getReferencedInfo(tableId, field.id);

  const [keyType, setKeyType] = useState<KeyType>(currentKeyType);
  const [referencedTableId, setReferencedTableId] = useState(
    referencedInfo?.referencedTableId || ""
  );
  const [referencedFieldId, setReferencedFieldId] = useState(
    referencedInfo?.referencedFieldId || ""
  );

  // Синхронизируем с relations
  useEffect(() => {
    const newKeyType = getFieldKeyType(tableId, field.id);
    const newRefInfo = getReferencedInfo(tableId, field.id);

    setKeyType(newKeyType);
    setReferencedTableId(newRefInfo?.referencedTableId || "");
    setReferencedFieldId(newRefInfo?.referencedFieldId || "");
  }, [field.id, tableId, getFieldKeyType, getReferencedInfo, relations]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Найти relation для текущего поля
  const findRelationForField = () => {
    return Object.values(relations).find(
      (rel) => rel.toTable === tableId && rel.toField === field.id
    );
  };

  const handleKeyTypeChange = (value: string) => {
    const newKeyType = value as KeyType;
    setKeyType(newKeyType);

    if (newKeyType === "primary") {
      // Удаляем relation если было FK
      const existingRelation = findRelationForField();
      if (existingRelation) {
        SchemaService.deleteRelation(props.projectId, existingRelation.id);
        removeRelation(existingRelation.id);
      }

      updateField(tableId, field.id, {
        isPrimaryKey: true,
        isForeignKey: false,
      });

      const currentTable = getCurrentTable();
      if (!currentTable) return;

      SchemaService.updateTable(
        props.projectId,
        currentTable.id,
        mapTableToApiPayload({
          ...currentTable,
          layout: getTableLayoutPayload(currentTable),
        })
      );

      setReferencedTableId("");
      setReferencedFieldId("");
    } else if (newKeyType === "foreign") {
      updateField(tableId, field.id, {
        isPrimaryKey: false,
      });
    } else {
      // regular
      const existingRelation = findRelationForField();
      if (existingRelation) {
        SchemaService.deleteRelation(props.projectId, existingRelation.id);
        removeRelation(existingRelation.id);
      }

      updateField(tableId, field.id, {
        isPrimaryKey: false,
        isForeignKey: false,
      });

      const currentTable = getCurrentTable();
      if (!currentTable) return;

      SchemaService.updateTable(
        props.projectId,
        currentTable.id,
        mapTableToApiPayload({
          ...currentTable,
          layout: getTableLayoutPayload(currentTable),
        })
      );

      setReferencedTableId("");
      setReferencedFieldId("");
    }
  };

  const handleReferencedTableChange = async (value: string | string[]) => {
    const newTableId = value as string;
    setReferencedTableId(newTableId);
    setReferencedFieldId("");

    // Удаляем старую relation если была
    const existingRelation = findRelationForField();
    if (existingRelation) {
      await SchemaService.deleteRelation(props.projectId, existingRelation.id);
      removeRelation(existingRelation.id);
    }
  };

  const handleReferencedFieldChange = async (value: string | string[]) => {
    const newFieldId = value as string;
    setReferencedFieldId(newFieldId);

    if (referencedTableId && newFieldId) {
      const existingRelation = findRelationForField();
      if (existingRelation) {
        removeRelation(existingRelation.id);
      }

      const newRelation = {
        fromTable: referencedTableId,
        toTable: tableId,
        fromField: newFieldId,
        toField: field.id,
        type: "one-to-many" as RelationType,
        fromHandle: "left" as "left" | "right",
        toHandle: "right" as "left" | "right",
      };

      const createdRelation = await SchemaService.createRelation(
        props.projectId,
        newRelation
      );

      addRelation(createdRelation.relation);
    }
  };

  const tableOptions = Object.values(tables)
    .filter((table: any) => table.id !== tableId)
    .map((table: any) => ({
      value: table.id,
      label: table.name,
    }));

  const referencedTable = tables[referencedTableId];
  const fieldOptions = referencedTable
    ? (referencedTable.fields || []).map((f: any) => ({
        value: f.id,
        label: f.name,
      }))
    : [];

  const iconColor =
    keyType === "primary"
      ? "oklch(0.681 0.162 75.834)"
      : keyType === "foreign"
      ? "oklch(0.546 0.245 262.881)"
      : "black";

  return (
    <>
      <IconButton
        sx={{
          width: "36px",
          display: "flex",
          justifySelf: "center",
        }}
        onClick={handleClick}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke={iconColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" />
          <path d="m21 2-9.6 9.6" />
          <circle cx="7.5" cy="15.5" r="5.5" />
        </svg>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        sx={{
          "& .MuiPopover-paper": {
            scrollbarWidth: "thin",
            scrollbarColor: "#ccc transparent",
            padding: "16px",
            minWidth: "300px",
          },
        }}
      >
        <FormControl component="fieldset" fullWidth>
          <FormLabel
            component="legend"
            sx={{ marginBottom: "12px", fontSize: "16px", fontWeight: 600 }}
          >
            Тип поля "{field.name}"
          </FormLabel>
          <RadioGroup
            value={keyType}
            onChange={(e) => handleKeyTypeChange(e.target.value)}
          >
            <FormControlLabel
              value="regular"
              control={<Radio />}
              label="Обычное поле"
            />
            <FormControlLabel
              value="primary"
              control={<Radio />}
              label="Первичный ключ"
            />
            <FormControlLabel
              value="foreign"
              control={<Radio />}
              label="Внешний ключ"
            />
          </RadioGroup>
        </FormControl>

        {keyType === "foreign" && (
          <div
            style={{
              marginTop: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <SelectField
              label="Связанная таблица"
              value={referencedTableId}
              options={tableOptions}
              onChange={handleReferencedTableChange}
            />

            {referencedTableId && (
              <SelectField
                label="Связанное поле"
                value={referencedFieldId}
                options={fieldOptions}
                onChange={handleReferencedFieldChange}
                disabled={fieldOptions.length === 0}
              />
            )}

            {referencedTableId && referencedFieldId && (
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "#e8f5e9",
                  border: "1px solid #4caf50",
                  borderRadius: "4px",
                  fontSize: "13px",
                  color: "#2e7d32",
                }}
              >
                Связь: <strong>{field.name}</strong> →{" "}
                <strong>
                  {referencedTable?.name}.
                  {
                    fieldOptions.find((f) => f.value === referencedFieldId)
                      ?.label
                  }
                </strong>
              </div>
            )}
          </div>
        )}
      </Popover>
    </>
  );
};
