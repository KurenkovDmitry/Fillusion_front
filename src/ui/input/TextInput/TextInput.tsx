import {
  TextField,
  type TextFieldProps,
  InputAdornment,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import React, { useState } from "react";
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
  isPassword?: boolean; // Add new prop
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
      isPassword = false,
      ...rest
    } = props;

    const [showPassword, setShowPassword] = useState(false);
    const { classes } = useStyles();

    const handleClickShowPassword = () => {
      setShowPassword(!showPassword);
    };

    return (
      <Box sx={{ width: "100%" }}>
        {/* Label с иконкой */}
        {label && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {labelIcon && (
              <InputAdornment position="start" sx={{ mr: 1 }}>
                {labelIcon}
              </InputAdornment>
            )}
            <Typography
              variant="body1"
              sx={{
                fontSize: "15px",
                marginBottom: "3px",
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
          // Add type for password field
          type={isPassword ? (showPassword ? "text" : "password") : rest.type}
          InputProps={{
            startAdornment: inputIcon ? (
              <InputAdornment position="start">{inputIcon}</InputAdornment>
            ) : undefined,
            // Add end adornment for password toggle
            endAdornment: isPassword ? (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  edge="end"
                  size="small"
                  sx={{ color: "#666" }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
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
