import { javascriptGenerator, Order } from "blockly/javascript";

export function installTurtleGenerators(generator = javascriptGenerator) {
  const forBlock = generator.forBlock;
  forBlock["pf"] = () => "jabutiPF(1);\n";
  forBlock["pt"] = () => "jabutiPT(1);\n";
  forBlock["pd"] = (block) => `jabutiPD(${block.getFieldValue("angulo")});\n`;
  forBlock["pe"] = (block) => `jabutiPE(${block.getFieldValue("angulo")});\n`;
  forBlock["pdv"] = (block, g) =>
    `jabutiPD(${g.valueToCode(block, "grau", Order.ATOMIC) || 0});\n`;
  forBlock["pev"] = (block, g) =>
    `jabutiPE(${g.valueToCode(block, "grau", Order.ATOMIC) || 0});\n`;
  forBlock["color"] = (block, g) =>
    `setColor(${g.valueToCode(block, "NAME", Order.ATOMIC) || "'#FFFFFF'"});\n`;
}
