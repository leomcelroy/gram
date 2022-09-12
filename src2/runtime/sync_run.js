import { Environment } from "./environment.js";
import { evaluate } from "./run.js";
import { parse } from "./parse.js";
import { builtIns } from "./builtIns.js";

export function sync_runtime(string) {
  let env = new Environment(builtIns);
  const ast = parse(string);
  const result = evaluate(ast.prog, env);
  
  return { result, turtles: [...env.turtles, ...env.shown], env };
}
