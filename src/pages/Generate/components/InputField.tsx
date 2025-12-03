import { useField } from "formik";
import { useStyles } from "./InputField.styles";
import React from "react";

interface InputFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "name"> {
  name?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  required?: boolean;
  inputIcon?: React.ReactNode;
  labelIcon?: React.ReactNode;
  multiline?: boolean;
  onChange?: (e?: any | undefined) => void;
  onBlur?: (e?: any | undefined) => void; // Добавлено
  useFormik?: boolean;
  error?: boolean; // Добавлено
  helperText?: string; // Добавлено
}

export const InputField = (props: InputFieldProps) => {
  const { classes } = useStyles();

  // Используй Formik только если useFormik !== false и onChange не передан
  const shouldUseFormik = props.useFormik && !props.onChange;

  // Условно вызывай useField
  let field, meta;
  if (shouldUseFormik) {
    //eslint-disable-next-line
    [field, meta] = useField(props);
  }

  const controlledProps = !shouldUseFormik
    ? {
        value: props.value || "",
        onChange: props.onChange,
        onBlur: props.onBlur, // Добавлено
        name: props.name,
      }
    : field;

  // Определяем, есть ли ошибка
  const hasError = shouldUseFormik ? meta?.touched && meta?.error : props.error;

  // Определяем текст ошибки
  const errorText = shouldUseFormik ? meta?.error : props.helperText;

  // Стили для input с ошибкой
  const inputStyle = {
    width: "100%",
    padding: "10px 15px",
    borderRadius: "7px",
    fontSize: "14px",
    boxSizing: "border-box" as const,
    outline: "none",
    background: "#F3F3F5",
    color: "black",
    border: hasError ? "1px solid #d32f2f" : undefined, // Красная граница при ошибке
  };

  return (
    <div>
      {props.labelIcon && props.label ? (
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
          <p
            className={props.required ? classes.requiredLabel : undefined}
            style={{ fontSize: "15px", fontWeight: "bold", margin: "10px 0" }}
          >
            {props.label}
          </p>
        </div>
      ) : (
        props.label && (
          <h4
            className={props.required ? classes.requiredLabel : undefined}
            style={{ margin: "10px 0", fontSize: "15px", lineHeight: "18px" }}
          >
            {props.label}
          </h4>
        )
      )}
      <div style={{ display: "flex", alignItems: "center" }}>
        {props.inputIcon && (
          <div
            style={{
              marginRight: "8px",
              alignItems: "center",
              display: "flex",
            }}
          >
            {props.inputIcon}
          </div>
        )}
        {props.multiline ? (
          <textarea
            {...controlledProps}
            placeholder={props.placeholder || props.label}
            className={classes.input__border}
            style={{
              ...inputStyle,
              minHeight: "140px",
              resize: "none",
              scrollbarWidth: "thin",
              scrollbarColor: "#c0c0c0ff #F3F3F5",
            }}
          />
        ) : (
          <input
            type="text"
            {...props}
            {...controlledProps}
            className={classes.input__border}
            placeholder={props.placeholder || props.label}
            style={{
              ...inputStyle,
              height: "32px",
            }}
          />
        )}
      </div>
      {/* Показываем ошибку как от Formik, так и от пропсов */}
      {hasError && errorText && (
        <div style={{ color: "#d32f2f", fontSize: 12, marginTop: 4 }}>
          {errorText}
        </div>
      )}
    </div>
  );
};
