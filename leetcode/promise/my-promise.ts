type PromiseHandler = (resolve: (value: unknown) => void) => void;
type PromiseFullfilledCallback = (value: unknown) => void;

class MPromise {
  #status = "pending";
  #value: unknown;
  #fulfilledCallbacks: PromiseFullfilledCallback[] = [];

  constructor(handle: PromiseHandler) {
    this.#status = "pending";

    const resolve = (value: unknown) => {
      if (this.#status === "pending") {
        this.#status = "fulfilled";
        this.#value = value;
        this.#fulfilledCallbacks.forEach((fn) => {
          this.#value = fn(this.#value);
        });
      }
    };

    handle(resolve);
  }

  then(onFulfilled: PromiseFullfilledCallback) {
    if (this.#status === "pending") {
      this.#fulfilledCallbacks.push(onFulfilled);
    }

    if (this.#status === "fulfilled") {
      this.#value = onFulfilled(this.#value);
    }
  }
}

const p1 = new MPromise((resolve) => {
  setTimeout(() => {
    resolve(1);
  }, 5_000);
});
p1.then((value) => {
  console.log("p1 outside");
  console.log(value);
  return value;
});

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

async function main() {
  while (true) {
    await wait(1000);
  }
}

main();
