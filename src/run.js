// import { parse } from "./parse3.js"
import { parse } from "./parse4.js";

const walk = (node, replacements)  => {
  if (Array.isArray(node)) return node.map(n => walk(n, replacements));
  else if (`${node}` in replacements) return replacements[`${node}`];
  else return node;
}

const createEval = turtle => { // continuation, higher-order function
  const funcs = {
    eval: function (...args) { // Do I really nead this?     
      return evaluate(args[0]);
    },
    run: function (...args) {
      const [ block ] = args;

      let result = null;
      for (let i = 0; i < block.length; i++) {
        result = evaluate(block[i]);
      }

      return result;
    },
    replace: (replacements, node) => { // should this be dict or array?
      return walk(node, replacements);
    },
    dict: (...args) => {
      const result = {};

      if (args.length % 2 !== 0) console.error("Dictionary arguments must have even length.");

      for (let i = 0; i < args.length; i+=2) {
        const key = args[i];
        const value = args[i+1];

        result[key] = value;
      }

      return result;
    },
    arr: (...args) => args,
    add: function (...args) { 
      return args.reduce((acc, cur) => acc + cur, 0) 
    },
    print: function (...args) { // but this isn't?
      return args.map(x => { console.log(x); return x; });
    },
    forward: function (distance) { // why is this a generator
      return turtle.forward(distance);
    },
    right: function (angle) { // why is this a generator
      return turtle.right(angle);
    },
    left: function (angle) { // why is this a generator
      return turtle.left(angle);
    }
  }

  function evaluate(node) {
    // console.log("node", node);
    if (Array.isArray(node)) {
      const [ head, ...tail ] = node;
      if (head === "quote" || head === undefined) return tail[0];
      // has to be ^this so I can return something other than array

      if (!(head in funcs)) console.error("Unknown function:", head);

      const func = funcs[head];

      const args = [];
      for (const val of tail) {
        const evalVal = evaluate(val);
        args.push(evalVal);
      }

      const val = func(...args);

      return val
    } else {
      return node;
    }
  };

  return evaluate;
}


export const run = (string, turtle) => {
  const ast = parse(`{ ${string} }`);

  console.log("ast", ast);

  // const prog = createEval(turtle)(["run", ["quote", ast] ]);

  const prog = createEval(turtle)([ "run", ast ]);

  return prog;
}