import { decode } from "https://deno.land/x/pngs@0.1.1/mod.ts";

const img = await Deno.readFile(Deno.args[0]);
const pxSize = parseInt(Deno.args[1]) ?? 1;
const { height, width, image, colorType } = decode(img);
console.log(
  Deno.args[0].split(".")[1].replaceAll("/", "").replaceAll("\\", ""),
);
let boiler = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${
  Deno.args[0].split(".")[1].replaceAll("/", "").replaceAll("\\", "")
}</title>
  <style>
    body {
      width: ${pxSize}px;
      height: ${pxSize}px;
      display: flex;
      flex-direction: column
    }

    div .pixel {
      flex: 1;
      margin: 0px;
      padding: 0px;
      border-right: 1px solid black;
      border-top: 1px solid black;
    }

    div .first_pixel {
      border-left: 1px solid black;
    }

    div .last_row {
      border-bottom: 1px solid black;
    }

    .row {
      flex: 1;
      display: flex;
      flex-direction: row;
    }
    [STYLING WILDCARD]
  </style>
</head>

<body>
  [BODY WILDCARD]
</body>

</html>
`;

let additive = 4;
let y = 0;

const css: Record<string, string[]> = {};

const body: Record<string, string[]> = {};
if (colorType === 2) additive = 3;

for (let i = 0; i < image.length; i += additive) {
  if ((i / additive) % width === 0) {
    y += 1;
    body[`row${y}`] = [];
  }
  let r = image[i];
  let g = image[i + 1];
  let b = image[i + 2];
  const a = additive === 4 ? image[i + 4] : undefined;
  // deno-fmt-ignore
  if (r === 0 && g === 0 && b === 0) {
    r = 255;
    g = 255;
    b = 255;
  }
  let rh = r.toString(16);
  let gh = g.toString(16);
  let bh = b.toString(16);
  rh = rh.length === 1 ? rh + "0" : rh;
  gh = gh.length === 1 ? gh + "0" : gh;
  bh = bh.length === 1 ? bh + "0" : bh;
  const hex = `${rh}${gh}${bh}`;
  css[`id${hex}`] = ["background-color", `#${hex}`];
  const row = body[`row${y}`];
  const first = row.length === 0;
  const lastRow = y === height;
  row.push(
    // deno-fmt-ignore
    `<div class="id${hex} pixel${first ? " first_pixel" : ""}${lastRow ? " last_row" : ""}"></div>`,
  );
}

let bodyBuffer = "";
let cssBuffer = "";
for (const children of Object.values(body)) {
  let buff = "";
  for (const child of children) buff += `  ${child}\n`;

  bodyBuffer += `\n<div class="row">\n${buff}</div>`;
}

for (const [key, values] of Object.entries(css)) {
  cssBuffer += `\n.${key} {
    ${values[0]}: ${values[1]};
  }`;
}
// console.log(cssBuffer);
boiler = boiler.replace("[STYLING WILDCARD]", cssBuffer);
boiler = boiler.replace("[BODY WILDCARD]", bodyBuffer);

Deno.mkdirSync("./out", { recursive: true });
Deno.writeTextFileSync(`./out/${Deno.args[0]}.html`, boiler);
