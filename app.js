const express = require('express');
const app = express();
const port = require('./app/config/port')


app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.static(__dirname + "/public/"))
app.use('/public', express.static('public'));

app.get("/", (req, res) => {
    res.sendFile(__dirname+'/public/turtle.html')
})


app.listen(port);

console.log(`Servidor rodando na porta ${port}...`);