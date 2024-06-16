//lib/src/models/stack.ts
interface IStack<T> {
  push(item: T): void;
  pop(): T | undefined;
  peek(): T;
  size(): number;
  clear(): void;
  toJSON(): string;
  fromJSON(json: string): void;
}

export class Stack<T> implements IStack<T> {
  private storage: T[] = [];

  constructor(private capacity: number = Infinity) {}

  push(item: T): void {
    if (this.storage.length >= this.capacity) {
      // if the stack is full
      let toDelete = this.storage.length - this.capacity + 1; // Calculate how many items to remove
      this.storage.splice(0, toDelete); // remove them from the bottom of the stack
    }
    this.storage.push(item); // add new item to top of stack
  }

  pop(): T | undefined {
    if (this.size() > 0) {
      return this.storage.pop(); // returns newest item and removes it from the stack
    }
    throw console.error("empty stack popped");
  }

  peek(): T {
    return this.storage[this.storage.length - 1]; // returns newest item without removing it from the stack
  }

  size(): number {
    return this.storage.length; // gets the current size of the stack
  }

  clear(): void {
    this.storage = []; // resets all data in the stack
  }

  toJSON(): string {
    return JSON.stringify(this.storage);
  }

  fromJSON(json: string): void {
    let parsed = JSON.parse(json);
    parsed.forEach((item: any) => {
      if (item as T) {
        this.push(item);
      } else {
        console.log('unknown item pushed into stack');
      }
    });
  }
}
