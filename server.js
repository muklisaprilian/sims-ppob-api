const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const bodyParser = require('body-parser');
const format = require("date-format");
const termkit = require("terminal-kit");
const term = termkit.terminal;
var Box = require("cli-box");
var cors = require('cors')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./db/swagger.json');
const { KeiLog } = require("./lib/Logger");

const port = 3000;
var fs = require("fs");
var path = require("path");
const { synchronizeModels } = require('./app/models');

synchronizeModels();
// app.use(cors());
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(200).send('An error occurred');
});

app.set('trust proxy', true);

app.use(bodyParser.json({
  verify: (req, res, buf) => {
      req.rawBody = buf;
  }
}));
app.use((req, res, next) => {
    const ip =  req.ip;
    KeiLog('ACCESS', `Akses api dari IP [${ip}] ${req.method} ${req.url}`);
    next();
});
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// == Auto include router == //
var b4 = Box("70x5", {
  text: "API Contract SIMS PPOB \n Author : Muklis Apriliansyah",
  stretch: true,
  autoEOL: true,
  vAlign: "center",
  hAlign: "center",
});
console.log(b4.toString());
term.color("green", "INDEX ROUTER \n");

let rout = [["# Nama Router", " #Nama File"]];
function includeRouter(folderName) {
  fs.readdirSync(folderName).forEach(function (file) {
    var fullName = path.join(folderName, file);
    var stat = fs.lstatSync(fullName);

    if (stat.isDirectory()) {
      includeRouter(fullName);
    } else if (file.toLowerCase().indexOf(".js")) {
      require("./" + fullName)(app);
      rout.push([file, fullName]);
    }
  });
}
includeRouter("app/router/");
// == Auto include router == //

term.table(rout, {
  hasBorder: true,
  contentHasMarkup: true,
  borderChars: "lightRounded",
  borderAttr: { color: "blue" },
  textAttr: { bgColor: "default" },
  //firstCellTextAttr: { bgColor: 'blue' } ,
  firstRowTextAttr: { bgColor: "RED" },
  //firstColumnTextAttr: { bgColor: 'red' } ,
  width: 60,
  //height: 20 ,
  fit: true, // Activate all expand/shrink + wordWrap
});
console.log(" ==================  SUCCESS!  ===================== ")

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


