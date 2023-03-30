import { evaluate } from "./run.js";

function overlapping(p0, p1) {
  const EPSILON = 0.0001;
  return Math.abs(p0.x - p1.x) < EPSILON && Math.abs(p0.y-p1.y) < EPSILON;
}

const encloseInLayer = (func, env) => {
  env.setMergeMarker();
  env.newTurtle();
  func()
  const result = env.turtle(); // TODO: is this the right thing to return?
  env.mergeFromMarker(1);
  return result;
}

let builtIns = {
  eval: {
    arity: 1,
    value(body, env) {
      return evaluate(body, env);
    }
  },
  originate: {
    arity: 0,
    value(env) {
      const turtle = env.turtle();
      return turtle.move(turtle.cc, {x: 0, y: 0} );
    }
  },
  copypaste: {
    arity: 2,
    value(number, body, env) {
      env.setMergeMarker();
      for (let i = 0; i < number; i++) {
        env.newTurtle(env.turtle().copy())
        evaluate(body, env);
      }
      env.mergeFromMarker();
      if (env.turtles.length < 2) throw "Less than two shapes, can't merge in \"grouplast\"."
      if (number >= 1) env.merge(2);

      return env.turtle();
    }
  },
  layer: {
    arity: 1,
    value(body, env) {
      env.setMergeMarker();
      env.newTurtle();
      evaluate(body, env);
      const result = env.turtle(); // TODO: is this the right thing to return?
      env.mergeFromMarker(1);
      return result;
    }
  },
  forward: {
    arity: 1,
    value(dist, env) {
      return env.turtle().forward(dist)
    },
  },
  turn: {
    arity: 1,
    value(angle, env) {
      return env.turtle().turn(angle)
    },
  },
  right: {
    arity: 1,
    value(angle, env) {
      return env.turtle().turn(-angle)
    },
  },
  left: {
    arity: 1,
    value(angle, env) {
      return env.turtle().turn(angle)
    },
  },
  turnforward: {
    arity: 2,
    value(angle, dist, env) {
      return env.turtle().turnForward(angle, dist)
    }
  },
  fillcolor: {
    arity: 1,
    value(color, env) {
      return env.turtle().fillColor(color)
    }
  },
  floodfill: {
    arity: 1,
    value(color, env) {
      return env.turtle().floodFill(color)
    }
  },
  strokewidth: {
    arity: 1,
    value(width, env) {
      return env.turtle().strokeWidth(width)
    }
  },
  strokelinecap: {
    arity: 1,
    value(type, env) {
      return env.turtle().strokeLinecap(type)
    }
  },
  strokelinejoin: {
    arity: 1,
    value(type, env) {
      return env.turtle().strokeLinejoin(type)
    }
  },
  strokecolor: {
    arity: 1,
    value(color, env) {
      return env.turtle().strokeColor(color)
    }
  },
  rotate: {
    arity: 2,
    value(point, angle, env) {
      return env.turtle().rotate(point, angle)
    }
  },
  translate: {
    arity: 2,
    value(x, y, env) {
      return env.turtle().translate(x, y)
    }
  },
  scale: {
    arity: 2,
    value(x, y, env) {
      return env.turtle().scale(x, y)
    }
  },
  move: {
    arity: 2,
    value(draggedPoint, targetPoint, env) {
      return env.turtle().translate(targetPoint, draggedPoint)
    }
  },
  goto: {
    arity: 1,
    value(point, env) {
      return env.turtle().goTo(point)
    }
  },
  flatgoto: {
    arity: 2,
    value: (point, axis, env) => env.turtle().flatGoTo(point, axis)
  },
  closepath: {
    arity: 0,
    value(env) {
      return env.turtle().closePath()
    },
  },
  setangle: {
    arity: 1,
    value(angle, env) {
      return env.turtle().setAngle(angle)
    }
  },
  reverse: {
    arity: 0,
    value(env) {
      return env.turtle().reverse()
    },
  },
  "this": {
    arity: 0,
    value(env) {
      return env.turtle()
    },
  },
  // lt: { arity: 1, value: (turtle, env) => turtle.lt },
  // lc: { arity: 1, value(turtle, env) { return turtle.lc }},
  // lb: { arity: 1, value(turtle, env) { return turtle.lb }},
  // ct: { arity: 1, value(turtle, env) { return turtle.ct }},
  // cc: { arity: 1, value(turtle, env) { return turtle.cc }},
  // cb: { arity: 1, value(turtle, env) { return turtle.cb }},
  // rt: { arity: 1, value(turtle, env) { return turtle.rt }},
  // rc: { arity: 1, value(turtle, env) { return turtle.rc }},
  // rb: { arity: 1, value(turtle, env) { return turtle.rb }},
  // centroidof: { arity: 1, value(turtle, env) { return turtle.centroid }},
  arc: {
    arity: 2,
    value(angle, radius, env) {
      return env.turtle().arc(angle, radius)
    }
  },
  circle: {
    arity: 1,
    value(radius, env) {
      const body = () => {
        const turtle = env.turtle();
        turtle.arc(360, radius);
        turtle.translate({x: 0, y: 0}, turtle.cc);
      }

      return encloseInLayer(body, env);
    }
  },
  flip: {
    arity: 1,
    value(direction, env) {
      return env.turtle().flip(direction)
    }
  },
  fillet: {
    arity: 1,
    value(radius, env) {
      return env.turtle().fillet(radius)
    }
  },
  repeat: {
    arity: 1,
    value(number, env) {
      return env.turtle().repeat(number)
    }
  },
  vec: {
    arity: 2,
    value(x, y, env) {
      return env.turtle().vec(x, y);
    }
  },
  bezier: {
    arity: 1,
    value(string, env) {
      return env.turtle().bezier(string);
    }
  },
  slide: {
    arity: 2,
    value(angle, distance, env) {
      return env.turtle().slide(angle, distance);
    }
  },
  rectangle: {
    arity: 2,
    value(width, height, env) {
      const body = () => {
        const turtle = env.turtle();
        turtle.forward(width)
          .right(90)
          .forward(height)
          .right(90)
          .repeat(1)
        turtle.move(turtle.cc, {x: 0, y: 0} );
      }

      return encloseInLayer(body, env);
    }
  },
  mirror: {
    arity: 0,
    value(env) {
      return env.turtle().mirror()
    }
  },
  alignhead: {
    arity: 0,
    value(env) {
      return env.turtle().alignHead();
    },
  },
  union: {
    arity: 0,
    value(env) {                 
      return env.turtle().union();
    }
  },
  difference: { 
    arity: 0,
    value(env) {                
      return env.turtle().difference();
    }
  },
  intersect: { 
    arity: 0,
    value(env) {              
      return env.turtle().intersect();
    }
  },
  offset: {
    arity: 2,
    value(distance, options, env) {                
      return env.turtle().offset( distance, options );
    }
  },
  outline: {
    arity: 0,
    value: (env) => env.turtle().outline()
  },
  thicken: {
    arity: 1,
    value: (distance, env) => env.turtle().thicken(distance)
  },
  newstroke: {
    arity: 1,
    value: (startPoint, env) => env.turtle().newStroke(startPoint)
  },
  show: {
    arity: 1,
    value: (_color, env) => env.show(_color)
  },
  roundcorners: {
    arity: 1,
    value: (radius, env) => env.turtle().roundCorners(radius)
  },
  dogbone: {
    arity: 1,
    value: (radius, env) => env.turtle().dogbone(radius)
  },
  expand: {
    arity: 1,
    value: (distance, env) => env.turtle().expand(distance)
  },
  construction: {
    arity: 0,
    value(env) {
      return env.turtle().construction();
    },
  },
  dashed: {
    arity: 1,
    value(number, env) {
      return env.turtle().dashed(number);
    },
  },
  // angleof: {
  //   arity: 1,
  //   value(shape) {
  //     return shape.angle;
  //   },
  // }, 
  // not using env below here
  range: {
    arity: 3,
    value(start, stop, step) {
      if (typeof stop == 'undefined') {
        // one param defined
        stop = start;
        start = 0;
      }

      if (typeof step == 'undefined') {
        step = start < stop ? 1 : -1;
      };

      if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) return [];

      var result = [];
      for (var i = start; step > 0 ? i < stop : i > stop; i += step) result.push(i);

      return result;
    }
  },
  neg: {
    arity: 1,
    value(a) {
      return -a
    },
  },
  length: {
    arity: 1,
    value(list) {
      return list.length
    }
  },
  pick: {
    arity: 1,
    value(arr) {
      return arr[Math.floor(Math.random() * arr.length)]
    }
  },
  // operate on turtle
  // endof: {
  //   arity: 1,
  //   value(turtle) {
  //     const { x, y } = turtle.point("end");
  //     return [x, y];
  //   },
  // },
  // startof: {
  //   arity: 1,
  //   value(turtle) {
  //     const { x, y } = turtle.start;
  //     return [x, y];
  //   },
  // },
  // pointsof: {
  //   arity: 1,
  //   value(turtle) { return turtle.points.map( ({x, y}) => [x, y] ) },
  // },
  // widthof: {
  //   arity: 1,
  //   value(turtle) { return turtle.width }
  // },
  // heightof: {
  //   arity: 1,
  //   value(turtle) { return turtle.height }
  // },
  index: {
    arity: 2,
    value(index, list) {
      return index >= 0 ? list[index] : list[index + list.length];
    },
  },
  sin: {
    arity: 1,
    value(number) { return Math.sin(number) }
  },
  cos: {
    arity: 1,
    value(number) { return Math.cos(number) }
  },
  tan: {
    arity: 1,
    value(number) { return Math.tan(number) }
  },  
  asin: {
    arity: 1,
    value(number) { return Math.asin(number) }
  },
  acos: {
    arity: 1,
    value(number) { return Math.acos(number) }
  },
  atan: {
    arity: 1,
    value(number) { return Math.atan(number) }
  },
  ln: {
    arity: 1,
    value(number) { return Math.log(number) }
  },
  pi: {
    arity: 0,
    value() { return Math.PI }
  },
  sqrt: {
    arity: 1,
    value(number) { return Math.sqrt(number) }
  },
  abs: {
    arity: 1,
    value(number) { return Math.abs(number) }
  },
  print: {
    arity: 1,
    value(value, env) { 
      env.log(value);
      console.log(value)
      return value; // this is so printed functions aren't called, fixed that issue with the extend approach in funcCall
    }
  },
  // xof: {
  //   arity: 1,
  //   value(point) { return point[0] }
  // },
  // yof: {
  //   arity: 1,
  //   value(point) { return point[1] }
  // },
  head: {
    arity: 1,
    value(list) { return list[0] }
  },
  tail: {
    arity: 1,
    value(list) { return list.slice(1) }
  },
  init: {
    arity: 1,
    value(list) { return list.slice(0, -1) }
  },
  take: {
    arity: 2,
    value(number, list) { return list.slice(0, number) }
  },
  drop: {
    arity: 2,
    value(number, list) { return list.slice(number) }
  },
  rev: {
    arity: 1,
    value(list) { return list.reverse() }
  },
  text: {
    arity: 1,
    value(text, env) { return env.turtle().text(text) }
  },
  xor: { 
    arity: 0,
    value(env) {                 
      return env.turtle().xor();
    }
  },
  // concat: {
  //   arity: 2,
  //   value(list1, list2) { return list1.concat(list2) }
  // },
  // maybe want?
  // foreach: {
  //   arity: 2,
  //   value: (list, fun) => {
  //     list.forEach( (x, i) => fun(x, i) );
  //   }
  // },
  placealong: {
    arity: 1,
    value(turtle, env) {
      return env.turtle().placeAlong(turtle)
    }
  },
  trim: {
    arity: 2,
    value: (start, end, env) => {
      return env.turtle().trim(start, end);
    }
  },
  gettabs: {
    arity: 0,
    value: (env) => {
      return env.turtle().getTabs();
    }
  }
  // wrap: {
  //   arity: 1,
  //   value(turtle, env) {
  //     return wrap(turtle, env.turtle())
  //   },
  // },
  // subdivide: {
  //   arity: 1,
  //   value(stepsize, env) {
  //     return subdivide(stepsize, env.turtle())
  //   },
  // },
}


for (const entry in builtIns) { // if env.turtle() is array then map function if mappable
  builtIns[entry] = {
    ...builtIns[entry],
    builtIn: true,
    type: "function"
  }
}

export {
  builtIns
};