import fs from "fs";
import Handlebars from "handlebars";
import path from "path";

export const renderHtmlTemplate = (name: string, vars: any) => {
  const template = Handlebars.compile(
    fs.readFileSync(path.join(__dirname, "..", "..", "html", name)).toString()
  );

  return template(vars);
};
