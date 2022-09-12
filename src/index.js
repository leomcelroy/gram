import { render } from "solid-js/web";
// import html from "solid-js/html";
import { createSignal, onMount } from "solid-js";

import { parse } from "./parse-comb.js";
import { parse as p } from "./parse.js";

import { View } from "./view.js";

import { o, observable, html } from 'sinuous';

const [name2, setName2] = createSignal("leo");


function MyComponent({ name }) {
  const [ count, setCount ] = createSignal(0);

  const onClick = () => {
    setCount(c => c+1);
    setCount(count()+1);
    console.log("clicked", count());

    setName2("bob");
  };

  onMount(() => {
    const thing = document.querySelector(".thing");
    console.log(thing);
  })

  return html`<div class="thing" on:click=${onClick}>Hello ${name} and ${name2}, ${count}</div>`;
}

// render(() => html`<${MyComponent} name="leo"/>`, document.querySelector("#root"));

// render(() => html`<${View}/>`, document.querySelector("#root"));

document.querySelector("#root").append(html`<${View}/>`);

const test = `
width = 5
height = 7
thickness = 0.4
tabs = 8
bottabs = 3

tabSize = height/(2*tabs)
width = width - (thickness*2)

def tabGroup num:
  for num:
    forward tabSize
    left 90
    forward thickness
    right 90
    forward tabSize
    right 90
    forward thickness
    left 90

side = layer:
  forward width
  right 90
  tabGroup tabs
  right 90
  forward width
  right 90
  tabGroup tabs
  move this.lt [0 0]
  side = this
  
  holes = layer:
    bottabwidth = width/(bottabs*2)
    rectangle bottabwidth thickness
    copypaste bottabs-1:
      translate this.width + bottabwidth 0
    copypaste 1:
      translate 0 ~side.height+thickness
    move this.ct side.ct
  difference
  
  copypaste 3:
    translate this.width+1 0



`
const test2 = `
top = layer:
  forward 90
  right 30
  forward 32

if a == 3:
  forward this.length
  right this.(90)
elif a == 4 and true:
  left 13
else:
  right 43


for 10 {
  forward 32
}

for 30 as i {
  a = i
  if a < 3: skip
  elif a > 5: break
  else: print i "art"

}

`

console.log(p(test));


// const ast = parse(test);

// console.log(ast);



// function Root() {
//   const count = o(0);

//   return html`
//     <div onClick=${() => count(count() + 1)}>Hello world! Count is ${count}</div>
//   `
// }


// document.querySelector("#root").append(html`<${Root}/>`)