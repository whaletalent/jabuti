function initApi(interpreter, scope) {
    // API ALERT
    var wrapper = function(text) {
      text = text ? text.toString() : '';
      return interpreter.createPrimitive(alert(text));
    };
    interpreter.setProperty(scope, 'alert',
        interpreter.createNativeFunction(wrapper));
  
    // API PROMPT
    wrapper = function(text) {
      text = text ? text.toString() : '';
      return interpreter.createPrimitive(prompt(text));
    };
    interpreter.setProperty(scope, 'prompt',
        interpreter.createNativeFunction(wrapper));
      
  
  }
  
  function initApi(interpreter, scope) {
    // API HIGHLIGHT
    var wrapper = function(id) {
      id = id ? id.toString() : '';
      return interpreter.createPrimitive(workspace.highlightBlock(id));
    };
    interpreter.setProperty(scope, 'highlightBlock',
        interpreter.createNativeFunction(wrapper));
      // API PF
    wrapper = function(text) {
      text = text ? text.toString() : '';
      
      //function structure
      return interpreter.createPrimitive(jabutiPF(text));
    };
    interpreter.setProperty(scope, 'jabutiPF',
      interpreter.createNativeFunction(wrapper));
      // API PT
    wrapper = function(text) {
      text = text ? text.toString() : '';
      
      //function structure
      return interpreter.createPrimitive(jabutiPT(text));
    };
    interpreter.setProperty(scope, 'jabutiPT',
      interpreter.createNativeFunction(wrapper));
      // API PD
    wrapper = function(text) {
      text = text ? text.toString() : '';
      
      //function structure
      return interpreter.createPrimitive(jabutiPD(text));
    };
    interpreter.setProperty(scope, 'jabutiPD',
      interpreter.createNativeFunction(wrapper));
      // API PA
    wrapper = function(text) {
      text = text ? text.toString() : '';
      
      //function structure
      return interpreter.createPrimitive(jabutiPE(text));
    };
    interpreter.setProperty(scope, 'jabutiPE',
    interpreter.createNativeFunction(wrapper));
    // API SETCOLOR
    wrapper = function(text) {
      text = text ? text.toString() : '';
      
      //function structure
      return interpreter.createPrimitive(setColor(text));
    };
    interpreter.setProperty(scope, 'setColor',
      interpreter.createNativeFunction(wrapper));
  }
      
  
  //--------------FUNCOES PRIMITIVAS------
  function jabutiPF(){
    moveJabuti('F');
  }
  function jabutiPT(){
      moveJabuti('T');
  }
  function jabutiPD(quanto){
      giraJabuti('D', quanto);
  }
  function jabutiPE(quanto){
      giraJabuti('E', quanto);
  }
  