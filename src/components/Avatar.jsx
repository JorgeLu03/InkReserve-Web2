export default function Avatar({ initials, color, size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      style={{ flexShrink: 0, borderRadius: "50%" }}
    >
      <circle cx="20" cy="20" r="20" fill={color} opacity="0.25" />
      <circle cx="20" cy="20" r="18" fill={color} opacity="0.15" stroke={color} strokeWidth="1.5" />
      <text
        x="50%" y="54%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill={color}
        fontSize="13"
        fontWeight="700"
        fontFamily="system-ui"
      >
        {initials}
      </text>
    </svg>
  );
}
