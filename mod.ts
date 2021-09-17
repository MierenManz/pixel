import { decode } from "https://deno.land/x/pngs@0.1.1/mod.ts";

const img = await Deno.readFile(Deno.args[0]);
const pxSize = parseInt(Deno.args[1]) ?? 1;

const { width, image, colorType } = decode(img);

let boiler = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    div {
      position: absolute;
      margin: 0px;
      padding: 0px;
      width: ${pxSize}px;
      height: ${pxSize}px;
    }
  </style>
</head>

<body>
`;

let additive = 4;
let y = 0;

if (colorType === 2) additive = 3;

for (let i = 0; i < image.length; i += additive) {
  if ((i / additive) % width === 0) {
    y += 1;
  }
  const r = image[i];
  const g = image[i + 1];
  const b = image[i + 2];
  const a = additive === 4 ? image[i + 4] : undefined;
  // deno-fmt-ignore
  if ((r === 255 && g === 255 && b === 255 && a === 255) || (r === 0 && g === 0 && b === 0)) continue;
  // deno-fmt-ignore
  const div = `<div style="left:${i / additive % width * pxSize}px;top:${y * pxSize}px;background-color:${rgba(r, g, b, a)}"></div>\n`;
  boiler += div;
}

function rgba(r: number, g: number, b: number, a?: number) {
  if (a) return `rgba(${r}, ${g}, ${b}, ${a})`;
  return `rgb(${r}, ${g}, ${b})`;
}
boiler += `\n</body>\n</html>`;
Deno.mkdirSync("./out", { recursive: true });
Deno.writeTextFileSync(`./out/${Deno.args[0]}.html`, boiler);
