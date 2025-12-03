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

export const AdditionalSettings = (props: AdditionalSettingsProps) => {
  const { fieldId, projectId } = props;
  const updateField = useSchemaStore((s) => s.updateField);
  const removeFieldProperties = useSchemaStore((s) => s.removeFieldProperties);
  const tables = useSchemaStore((s) => s.tables);
  const getAllRelations = useSchemaStore((state) => state.getAllRelations);

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

  const [tablesToSaveOnClose, setTablesToSaveOnClose] = useState<Set<string>>(
    new Set()
  );

  const saveTableToServer = async (tableId: string) => {
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
  };

  // Синхронизация при изменении поля
  useEffect(() => {
    if (!currentField) return;
    setApproach(currentField.viaFaker ? "faker" : "ai");
    setCheckedUnique(currentField.unique ?? false);
    setCheckedAutoincrement(currentField.autoIncrement ?? false);
  }, [currentField]);

  const [locale, setLocale] = useState<"LOCALE_RU_RU" | "LOCALE_EN_US">(
    currentField?.locale === "LOCALE_RU_RU" ? "LOCALE_RU_RU" : "LOCALE_EN_US"
  );
  const [fakerType, setFakerType] = useState(
    currentField?.fakerType ?? "COLUMN_TYPE_FIRST_NAME"
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    tablesToSaveOnClose.forEach((tableId) => saveTableToServer(tableId));
    setTablesToSaveOnClose(new Set());
  };

  const handleAutoIncrementChange = useCallback(() => {
    if (!currentTableId) return;

    const newValue = !checkedAutoincrement;
    setCheckedAutoincrement(newValue);

    updateField(currentTableId, fieldId, {
      autoIncrement: newValue,
    });
    setTablesToSaveOnClose((prev) => prev.add(currentTableId));
  }, [currentTableId, fieldId, checkedAutoincrement, updateField]);

  const handleUniqueChange = useCallback(() => {
    if (!currentTableId) return;

    const newValue = !checkedUnique;
    setCheckedUnique(newValue);

    updateField(currentTableId, fieldId, {
      unique: newValue,
    });
    setTablesToSaveOnClose((prev) => prev.add(currentTableId));
  }, [currentTableId, fieldId, checkedUnique, updateField]);

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
            type: fakerType === "COLUMN_TYPE_INT" ? "int" : "text",
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
      } else {
        removeFieldProperties(currentTableId, fieldId, [
          "unique",
          "autoIncrement",
        ]);
        updateField(currentTableId, fieldId, updates);

        if (relations) {
          relations.forEach((relation) => {
            // toField - это FK
            removeFieldProperties(relation.toTable, relation.toField, [
              "unique",
              "autoIncrement",
            ]);
            updateField(relation.toTable, relation.toField, updates);
          });
        }
      }
    },
    [
      currentTableId,
      fieldId,
      approach,
      checkedUnique,
      checkedAutoincrement,
      fakerType,
      locale,
      removeFieldProperties,
      updateField,
      getAllRelations,
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
        type: type === "COLUMN_TYPE_INT" ? "int" : "text",
      };
      updateField(currentTableId, fieldId, update);
      setTablesToSaveOnClose((prev) => prev.add(currentTableId));
      const relations = getAllRelations().filter(
        (r) => r.fromField === fieldId
      );
      if (relations) {
        relations.forEach((relation) => {
          updateField(relation.toTable, relation.toField, update);
          setTablesToSaveOnClose((prev) => prev.add(relation.toTable));
        });
      }
      handleClose();
    },
    [currentTableId, fieldId, locale, updateField, getAllRelations]
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
        onClose={handleClose}
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
          {currentField?.isForeignKey ? (
            <strong>
              Нельзя менять тип внешнего ключа, он наследуется от поля, на
              которое ссылается
            </strong>
          ) : (
            <div
              style={{ display: "flex", gap: "10px", flexDirection: "column" }}
            >
              <p style={{ margin: 0, fontWeight: "bold" }}>
                {currentField?.isPrimaryKey
                  ? "Дополнительные настройки"
                  : "Способ генерации данных"}
              </p>
              {!currentField?.isPrimaryKey && (
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
                          <div
                            style={{
                              display: "grid",
                              gap: "10px",
                              gridTemplateColumns: "1fr 1fr",
                            }}
                          >
                            {types.map((type) => (
                              <div
                                key={type.value}
                                className={classes.dataTypeBox}
                                onClick={() =>
                                  handleFakerTypeChange(type.value)
                                }
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
                        onClick={handleUniqueChange}
                      >
                        <Checkbox
                          checked={checkedUnique}
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
          )}
        </div>
      </Popover>
    </>
  );
};
