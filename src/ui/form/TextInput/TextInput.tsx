import { useField } from "formik";
import {
  TextInput as Input,
  type TextInputProps as InputProps,
} from "../../input/TextInput";
// import { TextField, type TextFieldProps } from "@mui/material";

interface FormTextInputProps extends Omit<InputProps, "error" | "helperText"> {
  name: string;
}

export const TextInput = (props: FormTextInputProps) => {
  const [field, meta] = useField(props.name);

  return (
    <Input
      {...props}
      {...field}
      error={meta.touched && !!meta.error} // Show error if touched and error exists
      helperText={meta.touched && meta.error ? meta.error : undefined} // Display error message
    />
  );
};
