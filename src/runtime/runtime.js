import { Environment } from "./environment.js";
import { run } from "./run.js";
import { parse } from "./parse.js";

export async function runtime(string, builtIns, logLine = -1) {
  let env = new Environment(builtIns);
  
  const ast = parse(string);
  const result = await run(ast.prog, env, logLine);
  
  return { result, turtles: [...env.turtles, ...env.shown], env };
}

