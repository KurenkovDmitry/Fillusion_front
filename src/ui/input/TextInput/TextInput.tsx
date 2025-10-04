import { TextField, type TextFieldProps } from "@mui/material";
import { useField } from "formik";

interface TextInputProps {
  label: string;
}

export const TextInput = ({
  label,
  ...props
}: TextInputProps & TextFieldProps) => {
  // useField() returns [field, meta, helpers]
  // field contains { name, value, onChange, onBlur }
  // meta contains { touched, error, initialValue, initialTouched, initialError }
  // helpers contains { setValue, setTouched, setError }
  const [field, meta] = useField(props);

  return (
    <TextField
      {...field} // Spreads Formik's field props (name, value, onChange, onBlur)
      {...props} // Spreads any other props passed to MyMuiTextField
      label={label}
      error={meta.touched && !!meta.error} // Show error if touched and error exists
      helperText={meta.touched && meta.error ? meta.error : null} // Display error message
    />
  );
};
