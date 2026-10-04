import { useId } from "react";

export function Elf({ color = "#b9d778", className = "", happy = false }) {
  const uid = useId().replaceAll(":", "");
  return (
    <svg
      className={`elf-illustration ${className}`}
      viewBox="0 0 260 310"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`${uid}skin`}
          x1="78"
          y1="108"
          x2="190"
          y2="184"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ffe6ba" />
          <stop offset="1" stopColor="#e7a577" />
        </linearGradient>
        <linearGradient
          id={`${uid}hat`}
          x1="90"
          y1="30"
          x2="177"
          y2="152"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={color} />
          <stop offset="1" stopColor="#43643f" />
        </linearGradient>
        <linearGradient
          id={`${uid}body`}
          x1="90"
          y1="199"
          x2="161"
          y2="274"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={color} />
          <stop offset="1" stopColor="#527851" />
        </linearGradient>
      </defs>
      <ellipse cx="132" cy="287" rx="65" ry="12" fill="#081d18" opacity=".3" />
      <g className="elf-body">
        <path
          d="M105 255L99 281Q70 283 75 268L89 247M151 252L158 281Q187 284 183 270L167 246"
          fill="#382d25"
        />
        <path
          d="M105 258L100 274M154 258L159 274"
          stroke="#e9a162"
          strokeWidth="7"
        />
        <path
          d="M100 266L97 284Q63 288 63 273Q77 280 86 269ZM157 269L162 284Q195 288 195 273Q181 280 172 269Z"
          fill="#6e4635"
        />
        <path
          d="M99 191Q79 209 80 255Q127 276 177 255Q174 213 157 194Z"
          fill={`url(#${uid}body)`}
        />
        <path
          d="M96 205Q75 208 65 237L77 244L103 220M163 204Q184 204 192 229L180 238L154 219"
          fill={color}
        />
        <ellipse
          cx="66"
          cy="242"
          rx="12"
          ry="14"
          transform="rotate(15 66 242)"
          fill={`url(#${uid}skin)`}
        />
        <g className="elf-hand">
          <path
            d="M183 229Q198 227 196 214Q198 204 205 211Q216 216 213 231Q210 245 196 246L183 239Z"
            fill={`url(#${uid}skin)`}
          />
        </g>
        <path
          d="M104 187L88 199L116 215L129 198L145 216L169 197L154 187"
          fill="#fff1cc"
        />
        <path
          d="M83 238Q129 250 173 238L174 252Q128 263 81 251Z"
          fill="#684f35"
        />
        <rect x="118" y="242" width="24" height="17" rx="3" fill="#ecc569" />
        <rect x="123" y="246" width="14" height="9" rx="1" fill="#684f35" />
        <circle cx="128" cy="220" r="3" fill="#eed292" />
        <path
          d="M83 137Q53 113 59 141Q64 164 84 163M176 138Q208 113 202 141Q197 164 178 164"
          fill={`url(#${uid}skin)`}
        />
        <path
          d="M66 135L80 151M192 135L180 151"
          stroke="#d18d72"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M86 117Q102 91 144 101Q183 109 179 153Q180 196 132 201Q85 197 80 157Z"
          fill={`url(#${uid}skin)`}
        />
        <path
          d="M82 148Q73 121 89 112L110 114L99 151L92 139L86 159ZM155 110Q184 106 181 151L169 144L164 158L159 135L145 120Z"
          fill="#a76432"
        />
        <path
          d="M95 122Q108 108 136 114L119 134L115 119L104 136Z"
          fill="#bf7839"
        />
        <ellipse
          cx="101"
          cy="171"
          rx="12"
          ry="7"
          fill="#e68c75"
          opacity=".65"
        />
        <ellipse
          cx="161"
          cy="171"
          rx="12"
          ry="7"
          fill="#e68c75"
          opacity=".65"
        />
        {happy ? (
          <g stroke="#323728" strokeWidth="4" strokeLinecap="round">
            <path d="M106 155Q111 149 116 155M146 155Q151 149 156 155" />
          </g>
        ) : (
          <g fill="#29392d">
            <ellipse cx="111" cy="155" rx="4.5" ry="7" />
            <ellipse cx="151" cy="155" rx="4.5" ry="7" />
            <circle cx="113" cy="152" r="1.5" fill="white" />
            <circle cx="153" cy="152" r="1.5" fill="white" />
          </g>
        )}
        <path
          d="M105 142Q111 138 117 141M144 141Q152 137 157 141"
          stroke="#85552e"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <ellipse cx="132" cy="167" rx="7" ry="5" fill="#dc9c70" />
        <path d="M119 180Q132 194 146 179" fill="#925037" />
        <path d="M121 180L143 180Q134 187 125 183" fill="#fff9df" />
        <path
          d="M78 123Q82 63 146 26Q174 9 195 36Q163 33 157 52Q178 87 184 125Z"
          fill={`url(#${uid}hat)`}
        />
        <path
          d="M93 104Q99 69 144 41"
          stroke="#eef3c3"
          strokeWidth="5"
          strokeLinecap="round"
          opacity=".22"
        />
        <path
          d="M77 119Q128 103 185 120L186 135Q132 120 77 135Z"
          fill={color}
        />
        <path
          d="M83 125Q131 113 179 126"
          stroke="#ebebac"
          strokeWidth="2"
          strokeDasharray="4 5"
        />
        <circle cx="195" cy="40" r="10" fill="#f4ce76" />
        <path
          d="M192 46L198 46"
          stroke="#a67837"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path d="M160 96Q172 66 180 76Q185 87 160 96Z" fill="#d5e5a9" />
        <path d="M160 96L175 81" stroke="#78955c" strokeWidth="2" />
      </g>
    </svg>
  );
}

// Pip's cap and ginger hair, simplified into a round portrait for the 48px HUD.
export function ElfAvatar() {
  const uid = useId().replaceAll(":", "");
  return (
    <svg
      className="elf-avatar"
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${uid}skin`} x1=".3" y1="0" x2=".7" y2="1">
          <stop stopColor="#ffe6ba" />
          <stop offset="1" stopColor="#e7a577" />
        </linearGradient>
        <linearGradient id={`${uid}cap`} x1=".2" y1="0" x2=".8" y2="1">
          <stop stopColor="#b9d778" />
          <stop offset="1" stopColor="#43643f" />
        </linearGradient>
      </defs>
      {/* Soft pointed ears sit behind the generous cheeks. */}
      <path
        d="M21 43Q12 44 3 36Q4 57 21 60M59 43Q68 44 77 36Q76 57 59 60"
        fill="#efb384"
      />
      <path
        d="M9 44L19 51M71 44L61 51"
        stroke="#cd8268"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M40 26C24 26 17 36 17 47C8 58 18 76 40 76C62 76 72 58 63 47C63 36 56 26 40 26Z"
        fill={`url(#${uid}skin)`}
      />
      <path
        d="M17 47Q12 30 25 28L33 31L23 48L21 41L18 53ZM55 29Q68 31 63 50L60 46L58 53L54 39Z"
        fill="#a76432"
      />
      <path d="M24 32Q34 25 48 31L38 43L36 35L28 43Z" fill="#bf7839" />
      <ellipse cx="24" cy="58" rx="8" ry="5.5" fill="#e88979" opacity=".7" />
      <ellipse cx="56" cy="58" rx="8" ry="5.5" fill="#e88979" opacity=".7" />
      <path
        d="M25 44Q29 41 33 43M47 43Q51 41 55 44"
        stroke="#85552e"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <g fill="#29392d">
        <ellipse cx="29" cy="50" rx="3" ry="4" />
        <ellipse cx="51" cy="50" rx="3" ry="4" />
      </g>
      <g fill="#fff9df">
        <circle cx="30" cy="49" r="1" />
        <circle cx="52" cy="49" r="1" />
      </g>
      <ellipse cx="40" cy="56" rx="5.5" ry="4" fill="#df996e" />
      <path
        d="M29 62Q40 66 51 62C49 76 31 76 29 62Z"
        fill="#874635"
      />
      <path d="M31 63Q40 66 49 63L47 67Q40 69 33 67Z" fill="#fff9df" />
      <path d="M35 71Q40 67 45 71Q40 74 35 71Z" fill="#e58f80" />
      {/* Floppy green cap, leaf and golden bell echo the full-size Pip. */}
      <path
        d="M16 33Q19 14 40 6Q59-1 70 13Q53 9 55 22L64 35Z"
        fill={`url(#${uid}cap)`}
      />
      <path
        d="M24 26Q28 16 42 11"
        stroke="#eef3c3"
        strokeWidth="3"
        strokeLinecap="round"
        opacity=".35"
      />
      <path d="M16 32Q40 25 64 33L65 40Q40 33 15 40Z" fill="#b9d778" />
      <path
        d="M20 35Q40 30 60 36"
        stroke="#ebebac"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="2 4"
      />
      <path d="M54 30Q53 18 62 19Q65 27 54 30Z" fill="#d5e5a9" />
      <path d="M54 30L59 23" stroke="#78955c" strokeWidth="1.5" />
      <circle cx="70" cy="15" r="5.5" fill="#f4ce76" />
      <path d="M68 18H72" stroke="#a67837" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CookieMark() {
  const uid = useId().replaceAll(":", "");
  return (
    <svg className="cookie-mark" viewBox="0 0 64 64" aria-hidden="true">
      <mask id={`${uid}bite`}>
        <circle cx="30" cy="34" r="22" fill="white" />
        <circle cx="46" cy="18" r="9" fill="black" />
      </mask>
      <g mask={`url(#${uid}bite)`}>
        <circle cx="30" cy="36" r="22" fill="#a86b32" />
        <circle cx="30" cy="33" r="22" fill="#f0c36a" />
        <path
          d="M16 28a14 12 0 0 1 20-10"
          fill="none"
          stroke="#ffe7a8"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.8"
        />
        <circle cx="22" cy="30" r="5" fill="#5c3424" />
        <circle cx="36" cy="28" r="4" fill="#5c3424" />
        <circle cx="28" cy="42" r="5" fill="#5c3424" />
        <circle cx="40" cy="40" r="3.5" fill="#6e4330" />
      </g>
    </svg>
  );
}

export function Cookie({ variant = 1, className = "" }) {
  const uid = useId().replaceAll(":", "");
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={uid} cx=".36" cy=".25">
          <stop stopColor="#fbe3a1" />
          <stop offset="1" stopColor="#ce8846" />
        </radialGradient>
      </defs>
      <ellipse cx="61" cy="106" rx="35" ry="7" fill="#0b291f" opacity=".18" />
      <path
        d="M103 62Q101 105 60 106Q18 104 17 63Q14 21 56 15Q99 13 103 62Z"
        fill="#aa6837"
      />
      <path
        d="M103 56Q101 97 60 98Q18 96 17 56Q14 14 56 9Q98 8 103 56Z"
        fill={`url(#${uid})`}
      />
      <path
        d="M26 52Q27 25 54 19"
        stroke="#fff2c4"
        strokeWidth="5"
        strokeLinecap="round"
        opacity=".6"
      />
      {[
        [42, 36],
        [78, 36],
        [32, 65],
        [61, 58],
        [77, 79],
        [51, 83],
      ].map(([x, y], i) => (
        <path
          key={i}
          d={`M${x - 5} ${y - 4}l8 -2l5 7l-5 5l-9 -3Z`}
          fill={variant === 2 ? "#9a4856" : "#664432"}
        />
      ))}
      <g fill="#e6ae62">
        {[
          [55, 27],
          [88, 59],
          [44, 56],
          [59, 73],
          [25, 46],
          [70, 24],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2" />
        ))}
      </g>
      {variant === 3 && (
        <path
          d="M64 27L68 37L80 37L71 45L74 55L64 49L54 55L57 45L48 37L60 37Z"
          fill="#fff0b5"
        />
      )}
    </svg>
  );
}

export function Forest({ lit = false }) {
  return (
    <svg
      viewBox="0 0 760 720"
      className={`forest-art ${lit ? "forest-lit" : ""}`}
      aria-hidden="true"
      fill="none"
    >
      <defs>
        <radialGradient id="forest-glow">
          <stop stopColor="#8aa771" stopOpacity=".35" />
          <stop offset="1" stopColor="#17382d" stopOpacity="0" />
        </radialGradient>
        <linearGradient
          id="forest-ground"
          x1="350"
          y1="430"
          x2="350"
          y2="720"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#55745b" />
          <stop offset="1" stopColor="#152f27" />
        </linearGradient>
        <linearGradient id="forest-trunk">
          <stop stopColor="#846a47" />
          <stop offset="1" stopColor="#423c2b" />
        </linearGradient>
      </defs>
      <circle cx="399" cy="310" r="314" fill="url(#forest-glow)" />
      <circle cx="440" cy="165" r="85" fill="#cfca97" opacity=".06" />
      <circle cx="440" cy="165" r="64" fill="#e3dba1" opacity=".09" />
      <path
        d="M478 112A61 61 0 1 0 482 207A67 67 0 0 1 478 112Z"
        fill="#f0deb0"
      />
      {[
        [-30, 90, 0.9],
        [60, 150, 0.8],
        [142, 135, 0.65],
        [590, 70, 1.2],
        [680, 20, 1.4],
        [480, 250, 0.6],
      ].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`} opacity=".6">
          <path
            d="M70 0L22 121L46 118L0 210L35 206L-17 305L150 305L104 207L137 212L91 117L117 122Z"
            fill={i % 2 ? "#294b3e" : "#244335"}
          />
          <path d="M66 131L66 385" stroke="#375346" strokeWidth="10" />
        </g>
      ))}
      <path d="M0 520Q172 427 313 467Q533 398 760 495V720H0Z" fill="#284b3c" />
      <path
        d="M0 590Q150 488 359 538Q588 453 760 563V720H0Z"
        fill="url(#forest-ground)"
      />
      <path
        d="M391 504Q641 537 440 581Q288 618 527 720H735Q443 622 567 594Q740 537 437 501Z"
        fill="#b3ac7a"
        opacity=".18"
      />
      <g className="wishing-tree">
        <path
          d="M523 502Q557 435 548 331L520 261L554 292L568 216L574 332Q601 301 620 263L593 352L574 376Q570 455 610 510Z"
          fill="url(#forest-trunk)"
        />
        <path
          d="M565 484L564 375M558 347L541 299"
          stroke="#bea56a"
          strokeWidth="3"
          opacity=".35"
        />
        <path
          d="M478 291Q432 260 463 227Q454 184 508 180Q524 139 563 158Q611 125 632 176Q689 179 675 225Q713 266 661 291Q634 330 595 304Q528 333 478 291Z"
          fill="#547351"
        />
        <path
          d="M468 244Q477 196 530 209Q554 169 585 203Q638 163 662 228Q603 215 583 247Q532 221 494 272Z"
          fill="#6e8c58"
        />
        <path d="M477 268Q563 309 651 258" stroke="#aa9970" strokeWidth="2" />
        {[
          [494, 278],
          [537, 292],
          [581, 289],
          [626, 275],
        ].map(([x, y], i) => (
          <g
            className="lantern"
            key={i}
            style={{ animationDelay: `${i * 0.7}s` }}
          >
            <path d={`M${x} ${y}v24`} stroke="#bdae80" />
            <circle
              cx={x}
              cy={y + 30}
              r="19"
              fill="#ffdd8b"
              opacity={lit ? ".26" : ".05"}
            />
            <rect
              x={x - 7}
              y={y + 22}
              width="14"
              height="18"
              rx="5"
              fill={lit ? "#ffe5a1" : "#baa775"}
            />
            <path
              d={`M${x - 3} ${y + 25}v11`}
              stroke="#fff2be"
              strokeWidth="2"
            />
          </g>
        ))}
      </g>
      <g transform="translate(133 455)">
        <path d="M0 103L19 40L52 39L71 100Z" fill="#7b6146" />
        <path d="M-26 47Q33 -31 95 48Q37 64 -26 47Z" fill="#c88261" />
        <path d="M-25 46Q33 57 95 47" stroke="#e9b588" strokeWidth="5" />
        <ellipse cx="22" cy="25" rx="11" ry="6" fill="#f4ddba" />
        <ellipse cx="65" cy="34" rx="9" ry="5" fill="#f4ddba" />
        <path d="M26 76Q36 57 47 76V98H26Z" fill="#4b4433" />
      </g>
      <g transform="translate(600 577) scale(.5)">
        <path d="M21 86L28 25H55L59 87Z" fill="#e9d4ae" />
        <path d="M-12 33Q35 -33 85 33Q37 55 -12 33Z" fill="#c97955" />
        <circle cx="24" cy="17" r="7" fill="#f3d9ac" />
        <ellipse cx="57" cy="28" rx="8" ry="5" fill="#f3d9ac" />
      </g>
      <g stroke="#7e9869" strokeWidth="3" strokeLinecap="round">
        <path d="M111 603L105 567M109 587L90 575M109 592L124 574M680 639L683 600M682 618L699 606M681 628L665 612M311 688L302 659M306 674L319 657" />
      </g>
      <g fill="#cfbb7a">
        {[
          [103, 555],
          [669, 592],
          [311, 645],
          [520, 602],
          [242, 590],
          [648, 497],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="3" />
            <circle cx={x + 6} cy={y + 4} r="2" />
          </g>
        ))}
      </g>
      <g className="fireflies">
        {[
          [270, 140],
          [347, 228],
          [253, 361],
          [433, 378],
          [658, 153],
          [119, 334],
          [582, 580],
          [672, 428],
          [383, 101],
          [90, 451],
          [325, 478],
          [490, 433],
        ].map(([x, y], i) => (
          <g key={i} style={{ animationDelay: `${i * 0.32}s` }}>
            <circle cx={x} cy={y} r="8" fill="#e8d784" opacity=".07" />
            <circle cx={x} cy={y} r="2" fill="#e8d784" opacity=".8" />
          </g>
        ))}
      </g>
      <path
        d="M26 712Q16 631 49 614Q80 635 50 683Q87 643 111 660Q97 706 62 715M709 720Q660 668 680 644Q713 656 728 700Q712 624 742 610Q772 658 743 719"
        fill="#234d3e"
      />
    </svg>
  );
}
