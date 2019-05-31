const express = require('express');
const app = express();
const port = require('./app/config/port')
const path = require('path');



app.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/public/turtle.html'));
  //__dirname : It will resolve to your project folder.
});

app.use(express.static(__dirname + 'public'));

app.use('/public', express.static('public'));


app.listen(port);

console.log(`Servidor rodando na porta ${port}...`);