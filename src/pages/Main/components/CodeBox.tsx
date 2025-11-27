import { useStyles } from "./CodeBox.styles";

export const CodeBox = ({ code }: { code: string }) => {
  const { classes } = useStyles();

  const lines = code.trim().split("\n");

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <div className={classes.dots}>
          <div className={classes.dot} style={{ backgroundColor: "#ff5f56" }} />
          <div className={classes.dot} style={{ backgroundColor: "#ffbd2e" }} />
          <div
            className={classes.dot}
            style={{ backgroundColor: "#16d633ff" }}
          />
        </div>

        <span className={classes.export}>Пример экспорта</span>
      </div>

      <div className={classes.content}>
        <div className={classes.lineNumbers} aria-hidden="true">
          {lines.map((_, i) => (
            <span key={i} className={classes.numberLine}>
              {i + 1}
            </span>
          ))}
        </div>

        <pre className={classes.codeBlock}>
          <code>
            {lines.map((line, i) => (
              <span key={i} className={classes.codeLine}>
                {line.length === 0 ? "\u00A0" : line}
              </span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
};
