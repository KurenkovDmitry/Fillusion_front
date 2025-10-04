import { useField } from "formik";
import { useStyles } from "./InputField.styles";

interface InputFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  value?: string;
  required?: boolean;
  inputIcon?: React.ReactNode;
  labelIcon?: React.ReactNode;
  multiline?: boolean;
}

export const InputField = (props: InputFieldProps) => {
  //   const [text, setText] = useState("");
  //   const handleChange = (
  //     event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  //   ) => {
  //     setText(event.target.value);
  //   };

  const { classes } = useStyles();
  const [field, meta] = useField(props);

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
          <p
            className={props.required ? classes.requiredLabel : undefined}
            style={{ fontSize: "15px", fontWeight: "bold", margin: "10px 0" }}
          >
            {props.label}
          </p>
        </div>
      ) : (
        <h4
          className={props.required ? classes.requiredLabel : undefined}
          style={{ margin: "10px 0", fontSize: "15px", lineHeight: "18px" }}
        >
          {props.label}
        </h4>
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
            {...field}
            placeholder={props.value || props.placeholder || props.label}
            style={{
              width: "100%",
              padding: "10px 15px",
              borderRadius: "7px",
              border: "1px solid #ccc",
              fontSize: "14px",
              minHeight: "140px",
              boxSizing: "border-box",
              outline: "none",
              background: "#F3F3F5",
              color: "black",
              resize: "none",
            }}
          />
        ) : (
          <input
            type="text"
            {...field}
            placeholder={props.value || props.placeholder || props.label}
            style={{
              width: "100%",
              padding: "10px 15px",
              borderRadius: "7px",
              border: "1px solid #ccc",
              fontSize: "14px",
              height: "32px",
              boxSizing: "border-box",
              outline: "none",
              background: "#F3F3F5",
              color: "black",
            }}
          />
        )}
      </div>
      {meta.touched && meta.error && (
        <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>
          {meta.error}
        </div>
      )}
    </div>
  );
};
