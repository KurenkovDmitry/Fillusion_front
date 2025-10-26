import Popover from "@mui/material/Popover";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Checkbox,
} from "@mui/material";
import React, { useState } from "react";
import { useStyles } from "./AdditionalSettings.styles";
import { SelectField } from "./SelectField";
import { availableDataTypes } from "./constants/constants";
import useSchemaStore from "../../../store/schemaStore";

interface AdditionalSettingsProps {
  fieldId: string;
}

export const AdditionalSettings = (props: AdditionalSettingsProps) => {
  const updateField = useSchemaStore((s) => s.updateField);
  const removeFieldProperties = useSchemaStore((s) => s.removeFieldProperties);
  const { classes } = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [approach, setApproach] = useState("ai");

  const [checkedUnique, setCheckedUnique] = useState(false);
  const [checkedAutoincrement, setCheckedAutoincrement] = useState(false);

  const [locale, setLocale] = useState<"RU_RU" | "EN_US">("RU_RU");
  const [fakerType, setFakerType] = useState("name");

  const lacaleSelectOptions = [
    { value: "RU_RU", label: "Русский (RU)" },
    { value: "EN_US", label: "Английский (EN)" },
  ];

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAutoIncrementChange = () => {
    updateField(props.fieldId, { autoIncrement: !checkedAutoincrement });
    setCheckedAutoincrement((pr) => !pr);
  };

  const handleUniqueChange = () => {
    updateField(props.fieldId, { unique: !checkedUnique });
    setCheckedUnique((pr) => !pr);
  };

  const open = Boolean(anchorEl);

  const handleApproachChange = (event: any, newApproach: string) => {
    if (newApproach === null) {
      return;
    }
    removeFieldProperties(
      props.fieldId,
      // Инвертированая логика изза того, что approach еще не поменялся
      approach === "ai"
        ? ["unique", "autoIncrement"]
        : ["viaFaker", "fakerType", "locale"]
    );
    updateField(
      props.fieldId,
      approach === "ai"
        ? { viaFaker: true, fakerType: fakerType, locale: locale }
        : { unique: checkedUnique, autoIncrement: checkedAutoincrement }
    );
    setApproach(newApproach);
  };

  const handleFakerTypeChange = (type: string) => {
    const update = {
      viaFaker: true,
      fakerType: type,
      locale: locale,
      type: "string",
    };
    updateField(props.fieldId, update);
    setFakerType(type);
    handleClose();
  };

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
            <section
              style={{
                marginBottom: "20px",
              }}
            >
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
                      <Checkbox checked={checkedUnique} />
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
                      <Checkbox checked={checkedAutoincrement} />
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
