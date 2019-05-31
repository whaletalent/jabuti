//PRELOADER
window.addEventListener("load", function () {
  setTimeout(() => {
    var loaderPage = document.getElementById('preloader');
    loaderPage.style.opacity = 0
    setTimeout(() => {
      loaderPage.style.visibility = 'hidden'
    }, 500);
  }, 1000);
});
function highlightBlock(id) {
  workspace.highlightBlock(id);
}

//EXECUTA O INTERPRETADOR JS
function runInterpreter() {
	habilitaBotaoStop()
	desabilitaBotaoPlay()
	Blockly.JavaScript.STATEMENT_PREFIX = 'highlightBlock(%1);\n';
	Blockly.JavaScript.addReservedWords('highlightBlock');
	Blockly.JavaScript.addReservedWords('code');		
   	var code = Blockly.JavaScript.workspaceToCode(workspace);
	var myInterpreter = new Interpreter(code, initApi);
	function nextStep() {
		if (myInterpreter.step()) {
			pid = window.setTimeout(nextStep, speed);
			
		} 
	}	
	nextStep();	
	        
}
