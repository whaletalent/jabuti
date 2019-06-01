//_____ESTRUTURA E APARENCIA DO BLOCO
Blockly.Blocks['pf'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("public/assets/pf.png", 26, 26, "*"));
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(185);
 this.setTooltip("Move-o para frente");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['pt'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("public/assets/pt.png", 26, 26, "*"));
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(185);
 this.setTooltip("Move-o para trás");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['pd'] = {
  init: function() {
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(new Blockly.FieldImage("public/assets/pd.png", 26, 26, "*"))
        .appendField(new Blockly.FieldAngle(90), "angulo");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
 this.setTooltip("Gira-o para a direita");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['pe'] = {
  init: function() {
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(new Blockly.FieldImage("public/assets/pe.png", 26, 26, "*"))
        .appendField(new Blockly.FieldAngle(90), "angulo");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
 this.setTooltip("Gira-o para a esquerda");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['color'] = {
  init: function() {
    this.appendValueInput("NAME")
        .appendField(new Blockly.FieldImage("public/assets/tint.png", 26, 26, "*"));
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(20);
    this.setTooltip('Modifica a cor do Rastro');
    this.setHelpUrl('');
  }
};
Blockly.Blocks['pdv'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("/public/assets/pd.png", 26, 26, "*"));
    this.appendValueInput("grau")
        .setCheck("Number");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip('Gira-o para direita (Aceita blocos e variáveis)');
    this.setHelpUrl('');
  }
};
Blockly.Blocks['pev'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("/public/assets/pe.png", 26, 26, "*"));
    this.appendValueInput("grau")
        .setCheck("Number");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip('Gira-o para esquerda (Aceita blocos e variáveis)');
    this.setHelpUrl('');
  }
};


//JS INJECT
Blockly.JavaScript['pf'] = function(block) {
  var code = "jabutiPF(1);\n";
  return code;
};

Blockly.JavaScript['pt'] = function(block) {
  var code = 'jabutiPT(1);\n';
  return code;
};

Blockly.JavaScript['pd'] = function(block) {
  var angle_angulo = block.getFieldValue('angulo');
  var code = 'jabutiPD('+angle_angulo+');\n';
  return code;
};

Blockly.JavaScript['pe'] = function(block) {
  var angle_angulo = block.getFieldValue('angulo');
  var code = 'jabutiPE('+angle_angulo+');\n';
  return code;
};


Blockly.JavaScript['color'] = function(block) {
  var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
  var code = 'setColor('+value_name+');\n';
  return code;
};

Blockly.JavaScript['pdv'] = function(block) {
  var value_grau = Blockly.JavaScript.valueToCode(block, 'grau', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = 'jabutiPD('+value_grau+');\n';
  return code;
};
Blockly.JavaScript['pev'] = function(block) {
  var value_grau = Blockly.JavaScript.valueToCode(block, 'grau', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = 'jabutiPE('+value_grau+');\n';
  return code;
};