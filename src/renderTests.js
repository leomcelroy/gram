import { render } from "solid-js/web";
import html from "solid-js/html";
import { createSignal, onMount } from "solid-js";

// import { o, observable, html } from 'sinuous';



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

  return html`<div class="thing" onclick=${onClick}>Hello ${name} and ${name2}, ${count}</div>`;
}

render(() => html`<${MyComponent} name="leo"/>`, document.querySelector("#root"));

render(() => html`<${View}/>`, document.querySelector("#root"));
