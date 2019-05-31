//inicializa botoes
var btnStop = document.getElementById("stop");
var btnPlay = document.getElementById("play");

//simulacao
var rastro;
var texture;
var angle = 0;

//pega o tamanho da tela para iniciar o phaser
let game_height = document.getElementById("simulacao").clientHeight;
let game_width = document.getElementById("simulacao").clientWidth;

//inicializa pid do interpreter
var pid = 0;

//Velocidade inicial da simulacao
var speed = 25;