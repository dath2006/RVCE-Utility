import { useState, useEffect } from "react";

const WaveLoader = ({
  size = "16em",
  bgColor = "hsl(223,90%,90%)",
  fgColor = "hsl(223,90%,10%)",
  primaryColor = "hsl(193,90%,50%)",
  secondaryColor = "hsl(283,90%,50%)",
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if user prefers dark mode
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(mediaQuery.matches);

    // Add listener for changes
    const handleChange = (e) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Use dark mode colors if detected
  const bg = isDarkMode ? "hsl(223,90%,10%)" : bgColor;
  const fg = isDarkMode ? "hsl(223,90%,90%)" : fgColor;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: fg,
        transition: "background-color 0.3s, color 0.3s",
        width: "100%",
        height: "100%",
      }}
    >
      <svg
        className="pl"
        viewBox="0 0 128 128"
        width={size}
        height="auto"
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id="pl-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#000" />
            <stop offset="100%" stopColor="#fff" />
          </linearGradient>
          <mask id="pl-mask">
            <rect x="0" y="0" width="128" height="128" fill="url(#pl-grad)" />
          </mask>
        </defs>
        <g strokeLinecap="round" strokeWidth="8" strokeDasharray="32 32">
          <g stroke={primaryColor}>
            <line className="pl__line1" x1="4" y1="48" x2="4" y2="80" />
            <line className="pl__line2" x1="19" y1="48" x2="19" y2="80" />
            <line className="pl__line3" x1="34" y1="48" x2="34" y2="80" />
            <line className="pl__line4" x1="49" y1="48" x2="49" y2="80" />
            <line className="pl__line5" x1="64" y1="48" x2="64" y2="80" />
            <g transform="rotate(180,79,64)">
              <line className="pl__line6" x1="79" y1="48" x2="79" y2="80" />
            </g>
            <g transform="rotate(180,94,64)">
              <line className="pl__line7" x1="94" y1="48" x2="94" y2="80" />
            </g>
            <g transform="rotate(180,109,64)">
              <line className="pl__line8" x1="109" y1="48" x2="109" y2="80" />
            </g>
            <g transform="rotate(180,124,64)">
              <line className="pl__line9" x1="124" y1="48" x2="124" y2="80" />
            </g>
          </g>
          <g stroke={secondaryColor} mask="url(#pl-mask)">
            <line className="pl__line1" x1="4" y1="48" x2="4" y2="80" />
            <line className="pl__line2" x1="19" y1="48" x2="19" y2="80" />
            <line className="pl__line3" x1="34" y1="48" x2="34" y2="80" />
            <line className="pl__line4" x1="49" y1="48" x2="49" y2="80" />
            <line className="pl__line5" x1="64" y1="48" x2="64" y2="80" />
            <g transform="rotate(180,79,64)">
              <line className="pl__line6" x1="79" y1="48" x2="79" y2="80" />
            </g>
            <g transform="rotate(180,94,64)">
              <line className="pl__line7" x1="94" y1="48" x2="94" y2="80" />
            </g>
            <g transform="rotate(180,109,64)">
              <line className="pl__line8" x1="109" y1="48" x2="109" y2="80" />
            </g>
            <g transform="rotate(180,124,64)">
              <line className="pl__line9" x1="124" y1="48" x2="124" y2="80" />
            </g>
          </g>
        </g>
        <style jsx>{`
          .pl line {
            animation-duration: 3s;
            animation-timing-function: ease-in-out;
            animation-iteration-count: infinite;
          }
          .pl__line1,
          .pl__line9 {
            animation-name: line1;
          }
          .pl__line2,
          .pl__line8 {
            animation-name: line2;
          }
          .pl__line3,
          .pl__line7 {
            animation-name: line3;
          }
          .pl__line4,
          .pl__line6 {
            animation-name: line4;
          }
          .pl__line5 {
            animation-name: line5;
          }

          /* Animations */
          @keyframes line1 {
            from,
            8% {
              stroke-dashoffset: 31.99;
              transform: translate(0, 16px);
            }
            18% {
              stroke-dashoffset: 16;
              transform: translate(0, 8px);
            }
            28% {
              stroke-dashoffset: 31.99;
              transform: translate(0, 16px);
            }
            38% {
              stroke-dashoffset: 0;
              transform: translate(0, 0);
            }
            48% {
              opacity: 1;
              stroke-dashoffset: 31.99;
              transform: translate(0, 16px);
            }
            53% {
              opacity: 0;
              stroke-dashoffset: 31.99;
              transform: translate(8px, 16px);
            }
            56% {
              animation-timing-function: steps(1, start);
              opacity: 0;
              stroke-dashoffset: 32;
              transform: translate(0, 16px);
            }
            60% {
              animation-timing-function: ease-out;
              opacity: 1;
              stroke-dashoffset: 32;
              transform: translate(0, 16px);
            }
            70% {
              animation-timing-function: ease-in-out;
              stroke-dashoffset: 0;
              transform: translate(0, 0);
            }
            80% {
              stroke-dashoffset: 31.99;
              transform: translate(0, 16px);
            }
            90% {
              stroke-dashoffset: 16;
              transform: translate(0, 8px);
            }
            to {
              stroke-dashoffset: 31.99;
              transform: translate(0, 16px);
            }
          }
          @keyframes line2 {
            from,
            6% {
              stroke-dashoffset: 31.99;
              transform: translate(0, 16px);
            }
            16% {
              stroke-dashoffset: 16;
              transform: translate(0, 8px);
            }
            26% {
              stroke-dashoffset: 31.99;
              transform: translate(0, 16px);
            }
            36% {
              stroke-dashoffset: 0;
              transform: translate(0, 0);
            }
            46% {
              opacity: 1;
              stroke-dashoffset: 31.99;
              transform: translate(0, 16px);
            }
            51% {
              opacity: 0;
              stroke-dashoffset: 31.99;
              transform: translate(8px, 16px);
            }
            54% {
              animation-timing-function: steps(1, start);
              opacity: 0;
              stroke-dashoffset: 32;
              transform: translate(0, 16px);
            }
            58% {
              animation-timing-function: ease-out;
              opacity: 1;
              stroke-dashoffset: 32;
              transform: translate(0, 16px);
            }
            68% {
              animation-timing-function: ease-in-out;
              stroke-dashoffset: 0;
              transform: translate(0, 0);
            }
            78% {
              stroke-dashoffset: 31.99;
              transform: translate(0, 16px);
            }
            88% {
              stroke-dashoffset: 16;
              transform: translate(0, 8px);
            }
            98%,
            to {
              stroke-dashoffset: 31.99;
              transform: translate(0, 16px);
            }
          }
          @keyframes line3 {
            from,
            4% {
              stroke-dashoffset: 31.99;
              transform: translate(0, 16px);
            }
            14% {
              stroke-dashoffset: 16;
              transform: translate(0, 8px);
            }
            24% {
              stroke-dashoffset: 31.99;
              transform: translate(0, 16px);
            }
            34% {
              stroke-dashoffset: 0;
              transform: translate(0, 0);
            }
            44% {
              opacity: 1;
              stroke-dashoffset: 31.99;
              transform: translate(0, 16px);
            }
            49% {
              opacity: 0;
              stroke-dashoffset: 31.99;
              transform: translate(8px, 16px);
            }
            52% {
              animation-timing-function: steps(1, start);
              opacity: 0;
              stroke-dashoffset: 32;
              transform: translate(0, 16px);
            }
            56% {
              animation-timing-function: ease-out;
              opacity: 1;
              stroke-dashoffset: 32;
              transform: translate(0, 16px);
            }
            66% {
              animation-timing-function: ease-in-out;
              stroke-dashoffset: 0;
              transform: translate(0, 0);
            }
            76% {
              stroke-dashoffset: 31.99;
              transform: translate(0, 16px);
            }
            86% {
              stroke-dashoffset: 16;
              transform: translate(0, 8px);
            }
            96%,
            to {
              stroke-dashoffset: 31.99;
              transform: translate(0, 16px);
            }
          }
          @keyframes line4 {
            from,
            2% {
              stroke-dashoffset: 31.99;
              transform: translate(0, 16px);
            }
            12% {
              stroke-dashoffset: 16;
              transform: translate(0, 8px);
            }
            22% {
              stroke-dashoffset: 31.99;
              transform: translate(0, 16px);
            }
            32% {
              stroke-dashoffset: 0;
              transform: translate(0, 0);
            }
            42% {
              opacity: 1;
              stroke-dashoffset: 31.99;
              transform: translate(0, 16px);
            }
            47% {
              opacity: 0;
              stroke-dashoffset: 31.99;
              transform: translate(8px, 16px);
            }
            50% {
              animation-timing-function: steps(1, start);
              opacity: 0;
              stroke-dashoffset: 32;
              transform: translate(0, 16px);
            }
            54% {
              animation-timing-function: ease-out;
              opacity: 1;
              stroke-dashoffset: 32;
              transform: translate(0, 16px);
            }
            64% {
              animation-timing-function: ease-in-out;
              stroke-dashoffset: 0;
              transform: translate(0, 0);
            }
            74% {
              stroke-dashoffset: 31.99;
              transform: translate(0, 16px);
            }
            84% {
              stroke-dashoffset: 16;
              transform: translate(0, 8px);
            }
            94%,
            to {
              stroke-dashoffset: 31.99;
              transform: translate(0, 16px);
            }
          }
          @keyframes line5 {
            from {
              stroke-dashoffset: 31.99;
              transform: translate(0, 16px);
            }
            10% {
              stroke-dashoffset: 16;
              transform: translate(0, 8px);
            }
            20% {
              stroke-dashoffset: 31.99;
              transform: translate(0, 16px);
            }
            30% {
              stroke-dashoffset: 0;
              transform: translate(0, 0);
            }
            40% {
              stroke-dashoffset: -16;
              transform: translate(0, 15px);
            }
            50% {
              stroke-dashoffset: -31;
              transform: translate(0, -48px);
            }
            58% {
              stroke-dashoffset: -31;
              transform: translate(0, 8px);
            }
            65% {
              stroke-dashoffset: -31.99;
              transform: translate(0, -24px);
            }
            71.99% {
              animation-timing-function: steps(1);
              stroke-dashoffset: -31.99;
              transform: translate(0, -16px);
            }
            72% {
              animation-timing-function: ease-in-out;
              stroke-dashoffset: 31.99;
              transform: translate(0, 16px);
            }
            82% {
              stroke-dashoffset: 16;
              transform: translate(0, 8px);
            }
            92%,
            to {
              stroke-dashoffset: 31.99;
              transform: translate(0, 16px);
            }
          }
        `}</style>
      </svg>
    </div>
  );
};

export default WaveLoader;
