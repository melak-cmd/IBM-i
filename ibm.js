const http = require('http');
const fs = require('fs');
const url = require('url');
// IBM i
const xt = require('itoolkit');

const DBname = "DATABASENAME";
const userId = "";
const passwd = "";
const ip = "LOCAL IP OF SERVER";
const port = 8080;

let webserver = http.createServer((req,res) => {
    let realPath = __dirname + url.parse(req.url).pathname;
    fs.exists(realPath, (exists) => {
        if(!exists){
            let cl = url.parse(req.url, true).query.cl;
            if(cl && cl.length > 0) {
                console.log("CL statement : " + cl);
                let conn = new xt.iConn(DBname, userId, passwd);
                conn.add(xt.iSh("system ‑i " + cl));
                conn.run((rs) => {
                    res.writeHead(200, {'Content‑Type': 'text/plain'});
                    res.end(xt.xmlToJson(rs)[0].data);
                });
            }
        } else {
            let file = fs.createReadStream(realPath);
            res.writeHead(200, {'Content‑Type':'text/html'});
            file.on('data', res.write.bind(res));
            file.on('close', res.end.bind(res));
            file.on('error', (err) => {
                res.writeHead(500, {'Content‑Type':'text/plain'});
                res.end("500 Internal Server Error");
            });
        }
    });
});
webserver.listen(port, ip);
console.log('Server running at http://' + ip + ':' + port);
