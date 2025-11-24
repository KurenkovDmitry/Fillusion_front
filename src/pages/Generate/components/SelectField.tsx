import {
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
} from "@mui/material";
import React from "react";

interface SelectFieldProps {
  label?: string;
  margin?: boolean;
  value?: string;
  options: { value: string; label: string }[];
  onChange:
    | React.Dispatch<React.SetStateAction<string>>
    | ((value: string) => void)
    | React.Dispatch<React.SetStateAction<"LOCALE_RU_RU" | "LOCALE_EN_US">>; // Изменено: может быть строка или массив
  labelIcon?: React.ReactNode;
  multiple?: boolean;
  multipleValue?: string[];
  className?: string;
  displayLabel?: string; // Добавляем новое свойство для отображения в select
  disabled?: boolean;
}

export const SelectField = (props: SelectFieldProps) => {
  return (
    <div>
      {props.labelIcon ? (
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              marginRight: "8px",
              alignItems: "center",
              display: "flex",
            }}
          >
            {props.labelIcon}
          </div>
          <p style={{ fontSize: "15px", fontWeight: "bold", margin: "10px 0" }}>
            {props.label}
          </p>
        </div>
      ) : (
        props.label && (
          <h4
            style={{ margin: "10px 0", fontSize: "15px", lineHeight: "18px" }}
          >
            {props.label}
          </h4>
        )
      )}
      <FormControl
        fullWidth
        variant="outlined"
        className={props.className}
        sx={{
          background: "#F3F3F5",
          borderRadius: "7px",
          "& .MuiOutlinedInput-notchedOutline": {
            border: "1px solid #ccc",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            border: "1px solid #ccc",
          },
        }}
      >
        <Select
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          displayEmpty
          disabled={props.disabled}
          name="select"
          renderValue={
            props.displayLabel // Используем displayLabel если он есть
              ? () => props.displayLabel
              : (value) =>
                  props.options.find((opt) => opt.value === value)?.label ||
                  value
          }
          sx={{
            borderRadius: "7px",
            fontSize: "14px",
            color: "black",
            background: "#F3F3F5",
            height: props.multiple ? "auto" : "32px",
            minHeight: "32px",
            boxSizing: "border-box",
            outline: "none",
            "&:hover, &:focus": {
              outline: "none",
              boxShadow: "none",
              background: "#F3F3F5",
            },
            "&&.Mui-focused fieldset": {
              border: "1px solid #818181ff",
              transition: "border-color 0.2s ease",
            },
          }}
          MenuProps={{
            sx: {
              "& .MuiList-root": {
                paddingTop: 0,
                paddingBottom: 0,
              },
            },
          }}
        >
          {props.options.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              sx={{ height: "32px", fontSize: "14px", paddingLeft: "14px" }}
            >
              {props.multiple && (
                <Checkbox
                  checked={
                    (props.multipleValue || []).indexOf(option.value) > -1
                  }
                  size="small"
                />
              )}
              <ListItemText primary={option.label} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};
