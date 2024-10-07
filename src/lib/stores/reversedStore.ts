import { createPersistentStore } from "./persistentStore";

const reversedStore =  createPersistentStore("reversedStore", false);

export { reversedStore };