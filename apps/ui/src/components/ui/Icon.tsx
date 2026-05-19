interface IconProps {
  name: string;
  size?: number;
  fill?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function Icon({ name, size = 20, fill = false, className, style }: IconProps) {
  return (
    <span
      className={`material-symbols-rounded${className ? ` ${className}` : ""}`}
      style={{
        fontSize: size,
        lineHeight: 1,
        userSelect: "none",
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
        display: "inline-flex",
        alignItems: "center",
        ...style,
      }}
    >
      {name}
    </span>
  );
}
