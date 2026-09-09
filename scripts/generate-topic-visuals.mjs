import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

const outputDirectory = resolve(
  process.cwd(),
  "public/images/topic-previews"
);

const visuals = [
  [
    "cosmic-notebook.png",
    "The Cosmic Notebook",
    "Astronomy · Physics · Space science",
    "#aebdff",
    "notebook",
  ],
  [
    "astrobiology.png",
    "Astrobiology & Habitability",
    "Life, environments, and habitable worlds",
    "#83c9a7",
    "biosphere",
  ],
  [
    "black-holes.png",
    "Black Holes",
    "Gravity at its most extreme",
    "#bc9cff",
    "black-hole",
  ],
  [
    "cosmology.png",
    "Cosmology & Early Universe",
    "Tracing the universe back toward its beginning",
    "#d4a5ff",
    "cosmos",
  ],
  [
    "exoplanets.png",
    "Exoplanets",
    "Worlds orbiting other stars",
    "#8fc7ff",
    "exoplanet",
  ],
  [
    "galaxies.png",
    "Galaxies & Galactic Evolution",
    "How galaxies assemble, change, and collide",
    "#d7a0d8",
    "galaxy",
  ],
  [
    "gravity.png",
    "Gravity & Fundamental Physics",
    "The forces and particles beneath the universe",
    "#e2b77d",
    "gravity",
  ],
  [
    "planet-formation.png",
    "Planet Formation",
    "From disks of dust and gas to new worlds",
    "#d6a26f",
    "disk",
  ],
  [
    "solar-system.png",
    "Solar System & Planetary Science",
    "The diverse worlds in our cosmic neighbourhood",
    "#e5b985",
    "planets",
  ],
  [
    "stars.png",
    "Stars & Stellar Evolution",
    "How stars form, live, interact, and end",
    "#f0cc83",
    "stars",
  ],
  [
    "sun.png",
    "Sun & Space Weather",
    "Our star and the environment it creates",
    "#f2b568",
    "sun",
  ],
  [
    "telescopes.png",
    "Telescopes & Observatories",
    "The instruments that extend human sight",
    "#91b9e8",
    "telescope",
  ],
].map(([file, title, subtitle, accent, art]) => ({
  file,
  title,
  subtitle,
  accent,
  art,
}));

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function wrapLines(value, maximumLength) {
  const words = String(value).split(/\s+/);
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine
      ? `${currentLine} ${word}`
      : word;

    if (
      candidate.length > maximumLength &&
      currentLine
    ) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = candidate;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function textLines(
  value,
  x,
  startY,
  lineHeight,
  maximumLength
) {
  return wrapLines(value, maximumLength)
    .map(
      (line, index) =>
        `<tspan x="${x}" y="${
          startY + index * lineHeight
        }">${escapeXml(line)}</tspan>`
    )
    .join("");
}

function artwork(type, accent) {
  const line =
    `stroke="${accent}" stroke-width="5" ` +
    `fill="none" stroke-linecap="round" ` +
    `stroke-linejoin="round"`;

  const drawings = {
    notebook: `
      <path d="M700 190h148c33 0 62 12 86 36 24-24 53-36 86-36h148v270c-78-25-156-16-234 27-78-43-156-52-234-27V190Z" ${line}/>
      <path d="M934 226v260M740 260h146M740 302h146M982 260h146M982 302h146" ${line} opacity=".55"/>
    `,

    biosphere: `
      <circle cx="934" cy="326" r="154" ${line}/>
      <path d="M796 352c88-50 170-38 276 22M853 235c65 44 117 107 139 188" ${line} opacity=".55"/>
      <path d="M910 355c0-67 36-113 106-140-3 77-35 124-106 140Zm0 0c-45-42-91-51-138-27 34 48 80 57 138 27Z" fill="${accent}" opacity=".72"/>
    `,

    "black-hole": `
      <ellipse cx="934" cy="326" rx="232" ry="78" ${line} transform="rotate(-12 934 326)"/>
      <circle cx="934" cy="326" r="104" fill="#05070d" stroke="${accent}" stroke-width="7"/>
      <ellipse cx="934" cy="326" rx="177" ry="46" ${line} opacity=".65" transform="rotate(-12 934 326)"/>
    `,

    cosmos: `
      <circle cx="934" cy="326" r="46" fill="${accent}" opacity=".82"/>
      <circle cx="934" cy="326" r="105" ${line} opacity=".75"/>
      <circle cx="934" cy="326" r="176" ${line} opacity=".4"/>
      <path d="M755 208 1108 444M757 446 1106 206" ${line} opacity=".22"/>
    `,

    exoplanet: `
      <circle cx="934" cy="326" r="143" fill="${accent}" opacity=".22" stroke="${accent}" stroke-width="6"/>
      <path d="M818 275c70 34 148 36 238 8M824 385c88-30 166-28 224 3" ${line} opacity=".52"/>
      <ellipse cx="934" cy="326" rx="233" ry="63" ${line} transform="rotate(-14 934 326)"/>
      <circle cx="1104" cy="259" r="17" fill="${accent}"/>
    `,

    galaxy: `
      <path d="M715 358c74-170 362-208 438-70 51 93-98 190-230 126-98-47-25-145 79-130 73 11 69 72 19 91" ${line}/>
      <path d="M1139 293c-88 151-346 178-419 49-47-83 76-170 191-130" ${line} opacity=".46"/>
      <circle cx="955" cy="335" r="16" fill="${accent}"/>
    `,

    gravity: `
      <path d="M724 236c135-79 275-79 420 0-46 38-68 84-68 137 0 57 23 102 68 137-145 79-285 79-420 0 45-35 68-80 68-137 0-53-23-99-68-137Z" ${line}/>
      <circle cx="932" cy="372" r="48" fill="${accent}" opacity=".65"/>
      <path d="M738 259c127 58 260 58 395 0M738 487c127-58 260-58 395 0" ${line} opacity=".38"/>
    `,

    disk: `
      <circle cx="934" cy="326" r="43" fill="${accent}"/>
      <ellipse cx="934" cy="326" rx="220" ry="71" ${line} transform="rotate(-9 934 326)"/>
      <ellipse cx="934" cy="326" rx="156" ry="48" ${line} opacity=".56" transform="rotate(-9 934 326)"/>
      <circle cx="1088" cy="279" r="15" fill="#0b1120" stroke="${accent}" stroke-width="5"/>
    `,

    planets: `
      <circle cx="840" cy="350" r="80" fill="${accent}" opacity=".34" stroke="${accent}" stroke-width="5"/>
      <circle cx="1030" cy="276" r="118" fill="${accent}" opacity=".15" stroke="${accent}" stroke-width="5"/>
      <path d="M941 276h178M784 328c40 20 79 23 118 9" ${line} opacity=".65"/>
      <circle cx="752" cy="206" r="12" fill="${accent}"/>
    `,

    stars: `
      <circle cx="862" cy="329" r="76" fill="${accent}" opacity=".77"/>
      <circle cx="1058" cy="290" r="42" fill="${accent}" opacity=".53"/>
      <path d="M862 200v258M733 329h258M771 238l182 182M771 420l182-182M1058 212v156M980 290h156" ${line} opacity=".5"/>
    `,

    sun: `
      <circle cx="934" cy="326" r="122" fill="${accent}" opacity=".62" stroke="${accent}" stroke-width="7"/>
      <path d="M934 149V96M934 556v-53M757 326h-53M1164 326h-53M809 201l-38-38M1097 489l-38-38M809 451l-38 38M1097 163l-38 38" ${line}/>
      <path d="M862 289c47-35 96-35 145 0M861 363c49 34 98 34 147 0" ${line} opacity=".5"/>
    `,

    telescope: `
      <path d="m802 247 205-89 38 88-205 89-38-88Z" fill="${accent}" opacity=".26" stroke="${accent}" stroke-width="6"/>
      <path d="m833 330 77 79M910 409l-99 105M910 409l107 105M910 409v119" ${line}/>
      <path d="M1045 201c64-21 111-11 139 30M1145 143l11-41M1192 174l35-25" ${line} opacity=".5"/>
    `,
  };

  return drawings[type] ?? drawings.notebook;
}

function createSvg({
  title,
  subtitle,
  accent,
  art,
}) {
  return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1200"
      height="630"
      viewBox="0 0 1200 630"
    >
      <defs>
        <radialGradient
          id="sky"
          cx="76%"
          cy="38%"
          r="76%"
        >
          <stop
            offset="0"
            stop-color="${accent}"
            stop-opacity=".14"
          />
          <stop
            offset=".55"
            stop-color="#11182b"
          />
          <stop
            offset="1"
            stop-color="#070b15"
          />
        </radialGradient>

        <pattern
          id="paper"
          width="42"
          height="42"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 41.5H42"
            stroke="#aebdff"
            stroke-opacity=".035"
          />
        </pattern>
      </defs>

      <rect
        width="1200"
        height="630"
        fill="url(#sky)"
      />

      <rect
        width="1200"
        height="630"
        fill="url(#paper)"
      />

      <g fill="#eef2ff" opacity=".7">
        <circle cx="92" cy="88" r="2"/>
        <circle cx="216" cy="145" r="1.5"/>
        <circle cx="432" cy="77" r="2"/>
        <circle cx="605" cy="118" r="1.5"/>
        <circle cx="734" cy="73" r="2"/>
        <circle cx="1098" cy="97" r="1.5"/>
        <circle cx="1137" cy="402" r="2"/>
        <circle cx="625" cy="532" r="1.5"/>
        <circle cx="106" cy="513" r="2"/>
      </g>

      <g>
        ${artwork(art, accent)}
      </g>

      <rect
        x="68"
        y="88"
        width="7"
        height="402"
        rx="3.5"
        fill="${accent}"
      />

      <text
        x="108"
        y="154"
        fill="#aebdff"
        font-family="Arial, Helvetica, sans-serif"
        font-size="20"
        font-weight="700"
        letter-spacing="4"
      >
        THE COSMIC NOTEBOOK
      </text>

      <text
        fill="#f4f6fb"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="58"
        font-weight="700"
        letter-spacing="-2"
      >
        ${textLines(title, 108, 248, 62, 19)}
      </text>

      <text
        fill="#bac3d5"
        font-family="Arial, Helvetica, sans-serif"
        font-size="23"
      >
        ${textLines(subtitle, 108, 452, 31, 41)}
      </text>

      <text
        x="108"
        y="560"
        fill="#7786a7"
        font-family="Arial, Helvetica, sans-serif"
        font-size="18"
      >
        Source-linked notes by Ojaas Hampiholi
      </text>

      <rect
        x="24"
        y="24"
        width="1152"
        height="582"
        rx="24"
        fill="none"
        stroke="#b8c5e3"
        stroke-opacity=".12"
      />
    </svg>
  `;
}

await mkdir(outputDirectory, {
  recursive: true,
});

for (const visual of visuals) {
  await sharp(Buffer.from(createSvg(visual)))
    .png({
      compressionLevel: 9,
    })
    .toFile(
      resolve(
        outputDirectory,
        visual.file
      )
    );
}

console.log(
  `Generated ${visuals.length} distinct topic preview images in public/images/topic-previews.`
);