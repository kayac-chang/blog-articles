function _new(Constructor, ...args) {
  const obj = new Object();
  Object.setPrototypeOf(obj, Constructor.prototype);
  const result = Constructor.call(obj, ...args);
  return result instanceof Object ? result : obj;
}

function Person(name, age) {
  this.name = name;
  this.age = age;
}

const person = _new(Person, "John", 30);
console.log(person.name); // John
console.log(person.age); // 30
console.log(person instanceof Person); // true
