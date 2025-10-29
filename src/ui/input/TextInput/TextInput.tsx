import {
  TextField,
  type TextFieldProps,
  InputAdornment,
  Box,
  Typography,
} from "@mui/material";
import React from "react";
import { useStyles } from "./TextInput.styles";

export type TextInputProps = {
  name?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  required?: boolean;
  inputIcon?: React.ReactNode;
  labelIcon?: React.ReactNode;
  multiline?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  helperText?: string;
} & TextFieldProps;

export const TextInput = React.forwardRef<HTMLDivElement, TextInputProps>(
  (props, ref) => {
    const {
      inputIcon,
      labelIcon,
      label,
      required,
      multiline = false,
      error = false,
      helperText,
      ...rest
    } = props;

    const { classes } = useStyles();

    return (
      <Box sx={{ width: "100%" }}>
        {/* Label с иконкой */}
        {label && (
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            {labelIcon && (
              <InputAdornment position="start" sx={{ mr: 1 }}>
                {labelIcon}
              </InputAdornment>
            )}
            <Typography
              variant="body1"
              sx={{
                fontSize: "15px",
                fontWeight: "bold",
                color: "text.primary",
                "&.Mui-required:after": {
                  content: '" *"',
                  color: "error.main",
                },
              }}
              className={required ? "Mui-required" : ""}
            >
              {label}
            </Typography>
          </Box>
        )}

        {/* Поле ввода */}
        <TextField
          className={classes.root}
          ref={ref}
          {...rest}
          multiline={multiline}
          rows={multiline ? 6 : undefined}
          placeholder={props.placeholder || props.label}
          fullWidth
          required={required}
          error={error}
          helperText={helperText}
          // Иконка в начале поля
          InputProps={{
            startAdornment: inputIcon ? (
              <InputAdornment position="start">{inputIcon}</InputAdornment>
            ) : undefined,
            sx: {
              // Стилизация поля ввода
              backgroundColor: "#F3F3F5",
              borderRadius: "7px",
              "& .MuiOutlinedInput-notchedOutline": {
                border: "1px solid #ccc",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                border: "1px solid #ccc",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                border: "1px solid #ccc",
                borderWidth: "1px",
              },
              // Стили для текста
              "& .MuiInputBase-input": {
                fontSize: "14px",
                color: "black",
                padding: "10px 15px",
                height: multiline ? "auto" : "32px",
                minHeight: multiline ? "140px" : "auto",
                boxSizing: "border-box",
              },
              // Убираем стандартные стили MUI для textarea
              "& .MuiInputBase-inputMultiline": {
                resize: "none" as const,
                scrollbarWidth: "thin" as const,
                scrollbarColor: "#c0c0c0ff #F3F3F5",
              },
            },
          }}
          // Стилизация самого TextField
          sx={{
            "& .MuiFormHelperText-root": {
              color: "red",
              fontSize: "12px",
              marginTop: "4px",
              marginLeft: 0,
            },
          }}
        />
      </Box>
    );
  }
);

// TextInput.displayName = "TextInput";
