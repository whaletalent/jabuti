

window.onload = function() {
    // Cria o cenário
    game = new Phaser.Game(game_width, game_height, Phaser.CANVAS, 'simulacao', {
        preload: carregaAssets,
        create: criaCenario,
        update: atualizaJogo
    }, null, false, false);
}
 

/**
 *  Carrega imagens
 */
function carregaAssets() {
    // Código da função virá aqui
	game.load.image('fundo', 'public/assets/fundo.png')
	game.load.spritesheet('trail', '/public/assets/trail.png', 16, 16);
	game.load.spritesheet('dude', 'public/assets/jabuti.png', 16, 16);
	
}
function criaFundo(){
    // Adiciona o fundo
	game.add.tileSprite(0, 0, game_width, game_height, 'fundo');
	//traillll
	texture = game.add.renderTexture(game_width, game_height, 'rastro');
	rastro = game.make.sprite(0, 0, 'trail');
	rastro.anchor.set(0.5);
    game.add.sprite(0, 0, texture);
}
 
/**
 *  Cria cenário do jogo
 */
function criaCenario() {
    // Código da função virá aqui
	criaFundo();
	
	// Cria o jabuti
    criaJogador();
	
	
	
}
function criaJogador(){
    // Cria o player e o adiciona no jogo (x,y)
    jogador = game.add.sprite((game.world.width/2), (game.world.height/2), 'dude');
 
   // É necessário adicionar a física no jogador
    game.physics.arcade.enable(jogador);
	jogador.anchor.setTo(0.5, 0.5);
    
   
 
    // Nâo deixa jogador "fugir" do mundo
    jogador.body.collideWorldBounds = true;
 
   
 
    // Nâo deixa jogador "fugir" do mundo
    jogador.body.collideWorldBounds = true;
 
    // Define duas animações (esquerda e direita) para caminhar
    // 'nome', posições no quadro, quantas atualizações por segundo
    jogador.animations.add('left', [0, 1, 2, 3], 10, true);
    jogador.animations.add('right', [5, 6, 7, 8], 10, true);
}
function stopPlayer(){
	jogador.body.velocity.x = 0;
	jogador.body.velocity.y = 0;
}
function resetSimulacao(){
	window.clearTimeout(pid);
	angle = 0;
	jogador.kill();
	texture.render(rastro, jogador.x, jogador.y, true);
	criaJogador();
	setColor('#FFFFFF');
	habilitaBotaoPlay()
	desabilitaBotaoStop()

	
}
/**
 *  Atualiza jogo. Esta função roda em torno de 60 vezes em 1 segundo, ou seja,
 *  60 FPS (FPS = Frames Por Segundo)
 */
function atualizaJogo() {
	jogador.angle = angle;
	//if (!game.input.activePointer.position.isZero())
    //{
        texture.renderXY(rastro, jogador.x, jogador.y);
    //}
	
}
function setColor(cor){
	rastro.tint = '0x'+cor.substr(1);;
}
function moveJabuti(valor){
	if(valor == 'F'){
		//moveTo(tempo, quantidade, angulo)
		jogador.body.moveTo(2, 1, angle);
		valor = '0';
	}
	if(valor == 'T'){
		//moveTo(tempo, quantidade, angulo)
		jogador.body.moveTo(2, -1, angle);
		valor = '0';
	}
}
function giraJabuti(valor, quanto){
	quanto = parseInt(quanto);
	angle = parseInt(angle);
	if(valor == 'D'){
		//moveTo(tempo, quantidade, angulo)
		angle = angle+quanto;
		
	}
	if(valor == 'E'){
		//moveTo(tempo, quantidade, angulo)
		angle = angle-quanto;
	}
}