import { useState } from "react";

interface SliderWithInputProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  label: string;
  onChange?: (value: number) => void;
}

export const SliderWithInput = (props: SliderWithInputProps) => {
  const [value, setValue] = useState(props.value);

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setValue(newValue as number);
    if (props.onChange) {
      props.onChange(newValue as number);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value === "" ? 0 : Number(event.target.value);
    setValue(newValue);
    if (props.onChange) {
      props.onChange(newValue);
    }
  };

  const handleBlur = () => {
    if (value < props.min) {
      setValue(props.min);
      if (props.onChange) {
        props.onChange(props.min);
      }
    } else if (value > props.max) {
      setValue(props.max);
      if (props.onChange) {
        props.onChange(props.max);
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        margin: "10px 0",
      }}
    >
      <h4
        style={{
          margin: "0",
          fontSize: "15px",
          lineHeight: "18px",
          alignSelf: "flex-start",
        }}
      >
        {props.label}
      </h4>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          style={{
            width: "auto",
            padding: "10px 15px",
            height: "32px",
            borderRadius: "7px",
            border: "1px solid #ccc",
            fontSize: "14px",
            boxSizing: "border-box",
            outline: "none",
            background: "#F3F3F5",
            color: "black",
          }}
          min={props.min}
          max={props.max}
        />
        <input
          type="range"
          value={value}
          onChange={(e) =>
            handleSliderChange(
              e as unknown as Event,
              Number((e.target as HTMLInputElement).value)
            )
          }
          min={props.min}
          max={props.max}
          step={props.step}
          style={{
            flex: 1,
            borderRadius: "7px",
            height: "9px",
            appearance: "none",
            cursor: "pointer",
            border: "1px solid #ccc",
            background: `linear-gradient(
                        to right,
                        #4f8cff 0%,
                        #4f8cff ${
                          (100 * (value - props.min)) / (props.max - props.min)
                        }%,
                        #F3F3F5 ${
                          (100 * (value - props.min)) / (props.max - props.min)
                        }%,
                        #F3F3F5 100%
                    )`,
          }}
        />
      </div>
    </div>
  );
};
