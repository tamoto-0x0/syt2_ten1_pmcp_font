import { generateFonts, FontAssetType, OtherAssetType } from 'fantasticon';
import * as fs from 'fs';
(async function() {
const fix_path = "glyphs";
const out_path = `fonts`;
const glyph_map: { [key: string]: number } = {};
const files = fs.readdirSync(`${fix_path}/`);
files.forEach((file, index) => {
  if (file.slice(-4) !== ".svg") return;
  if (file.slice(0, 2).toUpperCase() === "U+") {
    // U+002F.svg
    //   ^^^^
    const codepoint = file.slice(2, -4);
    glyph_map[file.slice(0, -4)] = parseInt(codepoint, 16);
    console.log(file.slice(0, -4), codepoint);
  } else {
    glyph_map[file[0]] = file.codePointAt(0)!;
    console.log(file[0], file.codePointAt(0)!.toString(16))
  }
});
if (!fs.existsSync(out_path)) {
  fs.mkdirSync(out_path);
}
generateFonts({
  inputDir: `${fix_path}/`,
  outputDir: `${out_path}/`,
  name: `syt2ten1`,
  fontTypes: [FontAssetType.TTF, FontAssetType.WOFF],
  assetTypes: [
    OtherAssetType.CSS,
    OtherAssetType.HTML,
    OtherAssetType.JSON,
   /* OtherAssetType.TS */ // The TS asset is buggy; remove
  ],
  fontHeight: 480,
  codepoints: glyph_map
}).then(results => {
  console.log(results);
  
  fs.readFile(`${out_path}/syt2ten1.html`, 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    const result = replace_problematic_css(data);
    fs.writeFile(`${out_path}/syt2ten1.html`, result, 'utf8', function (err) {
       if (err) return console.log(err);
    });
  });

  fs.readFile(`${out_path}/syt2ten1.css`, 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    const result = replace_problematic_css(data);
    fs.writeFile(`${out_path}/syt2ten1.css`, result, 'utf8', function (err) {
       if (err) return console.log(err);
    });
  });

});
})();

// CSS が壊れたり HTML でワーニングが出たりするやつを CSS と HTML から除く
function replace_problematic_css(data: string) {
  return data
    .replaceAll('U+', 'U-')
    .replaceAll('icon-!', 'icon-exclamation')
    .replaceAll('icon-,', 'icon-comma')
    .replaceAll('icon-(', 'icon-left-paren')
    .replaceAll('icon-)', 'icon-right-paren')
    .replaceAll('icon-[', 'icon-left-square-bracket')
    .replaceAll('icon-]', 'icon-right-square-bracket')
    .replaceAll('icon-{', 'icon-left-curly-brace')
    .replaceAll('icon-}', 'icon-right-curly-brace')
    .replaceAll("class='label'", `class="label"`)
  ;
}
