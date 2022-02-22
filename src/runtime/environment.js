import { Turtle, group } from "../../myLibs/gram-js.js";

export class Environment {

  constructor(builtIns) {
    this.scopes = [{}];
    this.turtles = [new Turtle()]; // [new Turtle()];
    this.shown = [];
    this.mergeMarker = [];
    this.logs = [];
    
    Object.entries(builtIns).forEach(([name, value]) => {
      this.add(name, value);
    })
  }
  
  add(name, value, constant = false) {
    this.scopes[0][name] = { value, constant };
    return value;
  }

  remove(name) {
    delete this.scopes[0][name];
  }

  addGlobal(name, value) {
    this.scopes[this.scopes.length - 1][name] = value;
    return value;
  }

  isConstant(name) {
    const value = this.scopes[0][name];
    return value ? value.constant : false;
  }

  find(name) {
    // checks top scope if it can't find it goes to next
    let i = 0;
    let value;
    // let contained = false;
    while (i < this.scopes.length) {
      value = this.scopes[i][name];
      // if (name in this.scopes[i]) contained = true;
      if (value !== undefined) break;
      i++;
    } 

    return value ? value.value : value;
  }

  newScope(scope = {}) {
    this.scopes.unshift(scope);
  }

  closeScope() {
    this.scopes.shift();
  }

  currentScope() {
    return { ...this.scopes[0] };
  }

  isFunction(name) {
    let value = this.find(name);
    return value !== undefined && value.type === "function";
  }

  clean() {
    this.scopes[0] = Object.fromEntries(Object.entries(this.scopes[0]).filter(([k, v]) => v.builtIn));
  }

  // turtle methods

  turtle() {
    if (this.turtles.length === 0) throw "No shape exists.";
    return this.turtles[this.turtles.length - 1];
  }

  newTurtle(turtle = new Turtle()) {
    this.turtles.push(turtle);
    return turtle;
  }

  show(color) {
    color = color ? color : "orange";
    const showTurtle = this.turtle().copy();
    showTurtle.strokeColor(color);
    this.shown.push(showTurtle);
    // return this.turtle();
    return showTurtle;
  }

  log(value) {
    this.logs.push(value);
    return value;
  }

  setMergeMarker() {
    this.mergeMarker.push(this.turtles.length);
  }

  mergeFromMarker(offset = 0) {
    this.merge(this.turtles.length - this.mergeMarker.pop() + offset);
  }

  merge(num) {
    if (num === 0) return;
    const l = this.turtles.length;
    const turtles = [];
    for (let i = l - 1; i >= l - num; i--) {
      let current = this.turtles.pop();
      turtles.unshift(current);
    };
    const final = group(...turtles);
    this.newTurtle(final);
  }
}