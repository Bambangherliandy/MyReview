export default function Logo({ height = 40, dark = false, tagline = false, className = "" }) {
    const h = tagline ? 48 : 40;
    const w = tagline ? 170 : 160;
  
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={(height / h) * w}
        height={height}
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label="MyReview"
        className={className}
      >
        <title>MyReview</title>
        <g transform={`scale(${h / 60})`}>
          <rect width="60" height="60" rx="15" fill="#F97316" />
          <polygon
            points="24,19 26.7,26.28 34.46,26.6 28.38,31.42 30.47,38.9 24,34.6 17.53,38.9 19.62,31.42 13.54,26.6 21.3,26.28"
            fill="#FFFFFF"
          />
          <path d="M40 22 A10 10 0 0 1 40 38" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          <path d="M46 15 A18 18 0 0 1 46 45" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        </g>
        <text
          x={tagline ? 58 : 50}
          y={tagline ? 26 : 27.5}
          fontFamily="Inter, 'Segoe UI', Helvetica, Arial, sans-serif"
          fontSize="22"
          fontWeight="700"
          letterSpacing="-0.3"
        >
          <tspan fill={dark ? "#FB923C" : "#F97316"}>My</tspan>
          <tspan fill={dark ? "#FFFFFF" : "#1F2430"}>Review</tspan>
        </text>
        {tagline && (
          <text
            x="58"
            y="40"
            fontFamily="Inter, 'Segoe UI', Helvetica, Arial, sans-serif"
            fontSize="9.5"
            fill={dark ? "#CBD5E1" : "#667085"}
          >
            Tap. Scan. Dapat ulasan.
          </text>
        )}
      </svg>
    );
  }