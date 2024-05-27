// /lib/stores/notesOnCardsStore.ts

import { createManagedStore } from "./persistentDataManagerStore";
import { type CardNote } from "../models/card";

const defaultValue:CardNote =  {
    note: '',
}

const notesOnCardsStore = createManagedStore<CardNote>('cardNotes', defaultValue);

export default notesOnCardsStore;