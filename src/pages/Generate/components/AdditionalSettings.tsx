import Popover from "@mui/material/Popover";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Checkbox,
} from "@mui/material";
import React, { useEffect, useState, useCallback } from "react";
import { useStyles } from "./AdditionalSettings.styles";
import { SelectField } from "./SelectField";
import { availableDataTypes } from "./constants/constants";
import useSchemaStore, { mapTableToApiPayload } from "@store/schemaStore";
import { getTableLayoutPayload } from "./PkSettings";
import { SchemaService } from "@services/api";

interface AdditionalSettingsProps {
  fieldId: string;
  projectId: string;
}

const lacaleSelectOptions = [
  { value: "LOCALE_RU_RU", label: "Русский (RU)" },
  { value: "LOCALE_EN_US", label: "Английский (EN)" },
];

const getUpdateFieldType = (type: string) => {
  switch (type) {
    case "COLUMN_TYPE_INT":
      return "int";
    case "COLUMN_TYPE_REAL":
      return "real";
    case "COLUMN_TYPE_BOOLEAN":
      return "bool";
    case "COLUMN_TYPE_UUID":
      return "uuid";
    case "COLUMN_TYPE_DATE":
      return "date";
    case "COLUMN_TYPE_TIME":
      return "time";
    case "COLUMN_TYPE_TIMESTAMP":
      return "timestamp";
    case "COLUMN_TYPE_TIMESTAMPTZ":
      return "timestamptz";
    default:
      return "text";
  }
};

export const AdditionalSettings = (props: AdditionalSettingsProps) => {
  const { fieldId, projectId } = props;
  const updateField = useSchemaStore((s) => s.updateField);
  const removeFieldProperties = useSchemaStore((s) => s.removeFieldProperties);
  const tables = useSchemaStore((s) => s.tables);
  const relations = useSchemaStore((s) => s.relations);
  const getAllRelations = useSchemaStore((state) => state.getAllRelations);
  const updateRelation = useSchemaStore((state) => state.updateRelation);

  const { classes } = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const findTableByFieldId = useCallback(
    (fieldId: string) => {
      return Object.values(tables).find((table) =>
        table.fields.some((f) => f.id === fieldId)
      );
    },
    [tables]
  );

  const currentTable = findTableByFieldId(fieldId);
  const currentTableId = currentTable?.id;
  const currentField = currentTable?.fields.find((f) => f.id === fieldId);

  // Локальное состояние для мгновенного UI
  const [approach, setApproach] = useState(
    currentField?.viaFaker ? "faker" : "ai"
  );
  const [checkedUnique, setCheckedUnique] = useState(
    currentField?.unique ?? false
  );
  const [checkedAutoincrement, setCheckedAutoincrement] = useState(
    currentField?.autoIncrement ?? false
  );

  const [hasRelation, setHasRelation] = useState(
    getAllRelations().some((r) => r.fromField === currentField?.id)
  );

  const [tablesToSaveOnClose, setTablesToSaveOnClose] = useState<Set<string>>(
    new Set()
  );

  const saveTableToServer = useCallback(
    async (tableId: string) => {
      if (!projectId) return;
      const table = useSchemaStore.getState().tables[tableId];
      if (!table) return;

      try {
        await SchemaService.updateTable(
          projectId,
          tableId,
          mapTableToApiPayload({
            ...table,
            layout: getTableLayoutPayload(table),
          })
        );
      } catch (err) {
        console.error("Failed to save table:", err);
      }
    },
    [projectId]
  );

  // Синхронизация при изменении поля
  useEffect(() => {
    if (!currentField) return;
    setApproach(currentField.viaFaker ? "faker" : "ai");
    setCheckedUnique(currentField.unique ?? false);
    setCheckedAutoincrement(currentField.autoIncrement ?? false);
  }, [currentField]);

  useEffect(() => {
    setHasRelation(
      getAllRelations().some((r) => r.fromField === currentField?.id)
    );
  }, [currentField?.id, getAllRelations, relations]);

  const [locale, setLocale] = useState<"LOCALE_RU_RU" | "LOCALE_EN_US">(
    currentField?.locale === "LOCALE_RU_RU" ? "LOCALE_RU_RU" : "LOCALE_EN_US"
  );
  const [fakerType, setFakerType] = useState(
    currentField?.fakerType ?? "COLUMN_TYPE_FIRST_NAME"
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = useCallback(
    (idsToSaveImmediately?: Set<string>) => {
      const finalSet = new Set(tablesToSaveOnClose);

      if (idsToSaveImmediately) {
        idsToSaveImmediately.forEach((id) => finalSet.add(id));
      }

      finalSet.forEach(async (tableId) => {
        await saveTableToServer(tableId);
      });

      setTablesToSaveOnClose(new Set());
      setAnchorEl(null);
    },
    [saveTableToServer, tablesToSaveOnClose]
  );

  const handleAutoIncrementChange = useCallback(() => {
    if (!currentTableId) return;

    const newValue = !checkedAutoincrement;
    setCheckedAutoincrement(newValue);

    updateField(currentTableId, fieldId, {
      autoIncrement: newValue,
    });
    setTablesToSaveOnClose((prev) => new Set(prev).add(currentTableId));
  }, [currentTableId, checkedAutoincrement, updateField, fieldId]);

  const handleUniqueChange = useCallback(() => {
    if (!currentTableId) return;

    const newValue = !checkedUnique;
    setCheckedUnique(newValue);

    updateField(currentTableId, fieldId, {
      unique: newValue,
    });
    if (newValue) {
      const relation = getAllRelations().find(
        (r) => r.toField === currentField?.id
      );
      console.log(relation);
      if (!relation) return;

      updateRelation(relation.id, { type: "one-to-one" });

      SchemaService.updateRelation(projectId, relation.id, {
        ...relation,
        type: "one-to-one",
      });
    }
    setTablesToSaveOnClose((prev) => new Set(prev).add(currentTableId));
  }, [
    currentTableId,
    checkedUnique,
    updateField,
    fieldId,
    getAllRelations,
    updateRelation,
    projectId,
    currentField?.id,
  ]);

  if (currentField?.isPrimaryKey && !currentField.unique) {
    handleUniqueChange();
  }

  const open = Boolean(anchorEl);

  const handleApproachChange = useCallback(
    (event: any, newApproach: string) => {
      if (newApproach === null || !currentTableId || approach === newApproach) {
        return;
      }

      setApproach(newApproach);

      const isSwitchingToAI = newApproach === "ai";
      const updates = isSwitchingToAI
        ? {
            unique: checkedUnique,
            autoIncrement: checkedAutoincrement,
            viaFaker: false,
          }
        : {
            viaFaker: true,
            fakerType: fakerType,
            locale: locale,
            type: getUpdateFieldType(fakerType),
          };

      const relations = getAllRelations().filter(
        (r) => r.fromField === fieldId // Это поле - PK
      );

      if (isSwitchingToAI) {
        removeFieldProperties(currentTableId, fieldId, [
          "viaFaker",
          "fakerType",
          "locale",
        ]);
        updateField(currentTableId, fieldId, updates);

        if (relations) {
          relations.forEach((relation) => {
            // toField - это FK
            removeFieldProperties(relation.toTable, relation.toField, [
              "viaFaker",
              "fakerType",
              "locale",
            ]);
            updateField(relation.toTable, relation.toField, updates);
          });
        }
        saveTableToServer(findTableByFieldId(props.fieldId)!.id);
      } else {
        removeFieldProperties(currentTableId, fieldId, ["autoIncrement"]);
        updateField(currentTableId, fieldId, updates);

        if (relations) {
          relations.forEach((relation) => {
            // toField - это FK
            removeFieldProperties(relation.toTable, relation.toField, [
              "autoIncrement",
            ]);
            updateField(relation.toTable, relation.toField, updates);
          });
        }
      }
    },
    [
      currentTableId,
      approach,
      checkedUnique,
      checkedAutoincrement,
      fakerType,
      locale,
      getAllRelations,
      saveTableToServer,
      findTableByFieldId,
      props.fieldId,
      fieldId,
      removeFieldProperties,
      updateField,
    ]
  );

  // обработчик типа faker
  const handleFakerTypeChange = useCallback(
    (type: string) => {
      if (!currentTableId) return;

      setFakerType(type);

      const update = {
        viaFaker: true,
        fakerType: type,
        locale: locale,
        type: getUpdateFieldType(type),
      };

      updateField(currentTableId, fieldId, update);

      const idsToSave = new Set<string>();
      idsToSave.add(currentTableId);

      const relations = getAllRelations().filter(
        (r) => r.fromField === fieldId
      );

      if (relations) {
        relations.forEach((relation) => {
          updateField(relation.toTable, relation.toField, update);
          idsToSave.add(relation.toTable);
        });
      }

      handleClose(idsToSave);
    },
    [currentTableId, locale, updateField, fieldId, getAllRelations, handleClose]
  );

  if (!currentTableId) {
    return null;
  }

  return (
    <>
      <IconButton size="small" onClick={handleClick}>
        <SettingsIcon sx={{ color: "#888" }} />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => handleClose()}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        sx={{
          "& .MuiPopover-paper": {
            scrollbarWidth: "thin",
            scrollbarColor: "#ccc transparent",
          },
        }}
      >
        <div
          style={{
            padding: "15px",
            width: "700px",
            maxHeight: "500px",
            transition: "max-height 0.3s ease",
          }}
        >
          <div
            style={{ display: "flex", gap: "10px", flexDirection: "column" }}
          >
            <p style={{ margin: 0, fontWeight: "bold" }}>
              {currentField?.isPrimaryKey || currentField?.isForeignKey
                ? "Дополнительные настройки"
                : "Способ генерации данных"}
            </p>
            {!currentField?.isPrimaryKey && !currentField?.isForeignKey && (
              <ToggleButtonGroup
                value={approach}
                exclusive
                onChange={handleApproachChange}
                aria-label="approach"
                sx={{
                  height: "32px",
                  width: "100%",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                }}
              >
                <ToggleButton
                  value="ai"
                  sx={{
                    fontFamily: "onest",
                    textTransform: "none",
                    height: "32px",
                  }}
                >
                  ИИ
                </ToggleButton>
                <ToggleButton
                  value="faker"
                  sx={{
                    fontFamily: "onest",
                    textTransform: "none",
                    height: "32px",
                  }}
                >
                  Faker
                </ToggleButton>
              </ToggleButtonGroup>
            )}
            <section style={{ marginBottom: "20px" }}>
              {approach === "faker" ? (
                <>
                  <div>
                    <SelectField
                      options={lacaleSelectOptions}
                      label="Язык (локаль)"
                      value={locale}
                      onChange={setLocale}
                    />
                  </div>
                  {Object.entries(availableDataTypes).map(
                    ([category, types]) => (
                      <article key={category} style={{ marginTop: "10px" }}>
                        <h4
                          style={{
                            margin: "10px 0",
                            borderBottom: "1px solid #ccc",
                            paddingBottom: "5px",
                            fontSize: "15px",
                          }}
                        >
                          {category === "personalInfo"
                            ? "Личные данные"
                            : category === "address"
                            ? "Адрес"
                            : category === "datetime"
                            ? "Дата и время"
                            : category === "workFinance"
                            ? "Работа и финансы"
                            : category === "internet"
                            ? "Интернет"
                            : category === "basicTypes"
                            ? "Базовые типы"
                            : category}
                        </h4>
                        <div className={classes.datatypeContainer}>
                          {types.map((type) => (
                            <div
                              key={type.value}
                              className={classes.dataTypeBox}
                              onClick={() => handleFakerTypeChange(type.value)}
                            >
                              <p
                                style={{
                                  margin: "0 0 4px 0",
                                  fontWeight: "500",
                                }}
                              >
                                {type.label}
                              </p>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: "12px",
                                  color: "#555",
                                }}
                              >
                                Примеры:{" "}
                                {locale === "LOCALE_RU_RU"
                                  ? type.examples.join(", ")
                                  : type.examples_en.join(", ")}
                              </p>
                            </div>
                          ))}
                        </div>
                      </article>
                    )
                  )}
                </>
              ) : (
                <article style={{ display: "flex", flexDirection: "column" }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                    }}
                  >
                    <div
                      className={classes.parametrs}
                      onClick={() => {
                        if (hasRelation || currentField?.isPrimaryKey) return;
                        handleUniqueChange();
                      }}
                    >
                      <Checkbox
                        checked={checkedUnique}
                        sx={{
                          transition: "all 0.1s ease-in-out",
                          "&:active": { transform: "scale(0.95)" },
                        }}
                        disabled={hasRelation || currentField?.isPrimaryKey}
                      />
                      <div
                        style={{
                          display: "grid",
                          gridTemplateRows: "1fr 1fr",
                        }}
                      >
                        <h5 style={{ margin: "4px 0 0 0", fontSize: "15px" }}>
                          Уникальное
                        </h5>
                        <span style={{ fontSize: "13px" }}>
                          Все значения будут уникальными
                        </span>
                      </div>
                    </div>
                    <div
                      className={classes.parametrs}
                      onClick={handleAutoIncrementChange}
                    >
                      <Checkbox
                        checked={checkedAutoincrement}
                        sx={{
                          transition: "all 0.1s ease-in-out",
                          "&:active": { transform: "scale(0.95)" },
                        }}
                      />
                      <div
                        style={{
                          display: "grid",
                          gridTemplateRows: "1fr 1fr",
                        }}
                      >
                        <h5 style={{ margin: "4px 0 0 0", fontSize: "15px" }}>
                          Автоинкремент
                        </h5>
                        <span style={{ fontSize: "13px" }}>
                          Автоматическое увеличение значения
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              )}
            </section>
          </div>
        </div>
      </Popover>
    </>
  );
};
