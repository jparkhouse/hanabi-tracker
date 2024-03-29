interface IStack<T> {
    push(item: T): void;
    pop(): T;
    peek(): T;
    size(): number;
    clear(): void;
}

export class Stack<T> implements IStack<T> {
    private storage: T[] = [];

    constructor(private capacity: number = Infinity) {};

    push(item: T): void {
        if (this.storage.length >= this.capacity) { // if the stack is full
            let toDelete = this.storage.length - this.capacity + 1; // Calculate how many items to remove
            this.storage.splice(0, toDelete); // remove them from the bottom of the stack
        }
        this.storage.push(item); // add new item to top of stack
    };

    pop(): T {
        return this.storage.pop() // returns newest item and removes it from the stack
    };

    peek(): T {
        return this.storage[this.storage.length - 1] // returns newest item without removing it from the stack
    };

    size(): number {
        return this.storage.length // gets the current size of the stack
    };

    clear(): void {
        this.storage = []; // resets all data in the stack
    };
}