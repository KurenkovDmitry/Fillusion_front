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
import useSchemaStore from "../../../store/schemaStore";

interface AdditionalSettingsProps {
  fieldId: string;
}

const lacaleSelectOptions = [
  { value: "RU_RU", label: "Русский (RU)" },
  { value: "EN_US", label: "Английский (EN)" },
];

export const AdditionalSettings = (props: AdditionalSettingsProps) => {
  const updateField = useSchemaStore((s) => s.updateField);
  const removeFieldProperties = useSchemaStore((s) => s.removeFieldProperties);
  const currentTableId = useSchemaStore((s) => s.currentTableId);
  const getCurrentTable = useSchemaStore((state) => state.getCurrentTable);

  const { classes } = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const currentField = getCurrentTable()?.fields.find(
    (f) => f.id === props.fieldId
  );

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

  // Синхронизация при изменении поля
  useEffect(() => {
    if (!currentField) return;
    setApproach(currentField.viaFaker ? "faker" : "ai");
    setCheckedUnique(currentField.unique ?? false);
    setCheckedAutoincrement(currentField.autoIncrement ?? false);
  }, [currentField]);

  const [locale, setLocale] = useState<"RU_RU" | "EN_US">("RU_RU");
  const [fakerType, setFakerType] = useState("name");

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAutoIncrementChange = useCallback(() => {
    if (!currentTableId) return;

    const newValue = !checkedAutoincrement;
    setCheckedAutoincrement(newValue);

    updateField(currentTableId, props.fieldId, {
      autoIncrement: newValue,
    });
  }, [currentTableId, props.fieldId, checkedAutoincrement, updateField]);

  const handleUniqueChange = useCallback(() => {
    if (!currentTableId) return;

    const newValue = !checkedUnique;
    setCheckedUnique(newValue);

    updateField(currentTableId, props.fieldId, {
      unique: newValue,
    });
  }, [currentTableId, props.fieldId, checkedUnique, updateField]);

  const open = Boolean(anchorEl);

  const handleApproachChange = useCallback(
    (event: any, newApproach: string) => {
      if (newApproach === null || !currentTableId || approach === newApproach) {
        return;
      }

      setApproach(newApproach);

      const isSwitchingToAI = newApproach === "ai";

      if (isSwitchingToAI) {
        removeFieldProperties(currentTableId, props.fieldId, [
          "viaFaker",
          "fakerType",
          "locale",
        ]);
        updateField(currentTableId, props.fieldId, {
          unique: checkedUnique,
          autoIncrement: checkedAutoincrement,
        });
      } else {
        removeFieldProperties(currentTableId, props.fieldId, [
          "unique",
          "autoIncrement",
        ]);
        updateField(currentTableId, props.fieldId, {
          viaFaker: true,
          fakerType: fakerType,
          locale: locale,
        });
      }
    },
    [
      currentTableId,
      props.fieldId,
      approach,
      checkedUnique,
      checkedAutoincrement,
      fakerType,
      locale,
      removeFieldProperties,
      updateField,
    ]
  );

  // ОПТИМИЗИРОВАННЫЙ обработчик типа faker
  const handleFakerTypeChange = useCallback(
    (type: string) => {
      if (!currentTableId) return;

      setFakerType(type);
      handleClose();

      const update = {
        viaFaker: true,
        fakerType: type,
        locale: locale,
        type: "string",
      };
      updateField(currentTableId, props.fieldId, update);
    },
    [currentTableId, props.fieldId, locale, updateField]
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
        <div style={{ padding: "15px", width: "700px", maxHeight: "500px" }}>
          <div
            style={{ display: "flex", gap: "10px", flexDirection: "column" }}
          >
            <p style={{ margin: 0, fontWeight: "bold" }}>
              Способ генерации данных
            </p>
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
                                {locale === "RU_RU"
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
        </div>
      </Popover>
    </>
  );
};
