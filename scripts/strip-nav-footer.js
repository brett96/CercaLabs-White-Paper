const fs = require("fs");

const files = [
  "content/landing-body.html",
  "content/privacy-policy-body.html",
  "content/do-not-sell-body.html",
];

for (const file of files) {
  let html = fs.readFileSync(file, "utf8");
  html = html.replace(/<!-- NAV -->[\s\S]*?<\/nav>\s*/i, "");
  html = html.replace(/<!-- FOOTER -->[\s\S]*?<\/footer>\s*/i, "");
  fs.writeFileSync(file, html.trim() + "\n");
  console.log("stripped", file);
}
