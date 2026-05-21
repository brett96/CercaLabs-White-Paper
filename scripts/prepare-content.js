const fs = require("fs");

function replaceForm(file, formId, mountId) {
  let html = fs.readFileSync(file, "utf8");
  const re = new RegExp(
    `<form id="${formId}"[\\s\\S]*?</form>`,
    "i"
  );
  html = html.replace(re, `<div id="${mountId}"></div>`);
  fs.writeFileSync(file, html);
}

replaceForm("content/landing-body.html", "download-form", "whitepaper-form-mount");
replaceForm("content/do-not-sell-body.html", "dns-form", "dns-form-mount");
console.log("forms replaced");
