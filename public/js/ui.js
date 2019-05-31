function desabilitaBotaoStop(){
    btnStop.disabled = true;
}
function desabilitaBotaoPlay(){
    btnPlay.disabled = true;
}
function habilitaBotaoStop(){
    btnStop.disabled = false;
}
function habilitaBotaoPlay(){
    btnPlay.disabled = false;
}
function getSpeed(){
	speed = 55 - document.getElementById("velocidade").value;
}