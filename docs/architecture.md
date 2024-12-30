## Intro
Throughout this document, I will assume that you are here because you already have a love for Hanabi. If you are still learning the game, then it may be best to hold off on contributing to this project.

This project is a static site, but I like to think of it still having a backend, even if not a conventional one.

The app is broken down into two main parts: the components, which live in `src/lib/components`, forming the 'front end'; and the stores, which live in `src/lib/stores`, forming the 'back end'. There are also some additional shared models in `src/lib/models`.

## Components

The components represent much of the app that a user interacts with. There is a hierarchy to these:

- 0: `App`
  - 1: `GameControls` - the top panel where all the buttons and configuration lives. It has two different modes depending on if the user is in game, or doing a review.
    - 2: `ConfigModal` - the modal panel that opens from the settings button, which is responsible for changing the `gameConfigStore` on settings change, or using the `gameConfigStore` to reset the game knowledge
    - 2: `HintModal` - the modal panel responsible for providing the user with the available hints for cards selected (which can be read from the `cardsSelectedStore`), allowing the user to save a hint, and updating the saved information (colour and number information in `informationOnCardsStore` and the `isHinted` flag in the `contextOnCardsStore`)
    - 2: PlayDiscardSelectedCard - responsible for removing a card from the hand  and adding the next new card (stored in the `cardsInHandStore`)
    - 2: Undo button -  lives in the `GameControls` component here, and undoes the most recent game action (from the `actionStore`) - more on that later.
    - 2: Review toggle - toggles between in game and reviewing game modes - more on that later.
    - 2: `MoreActionsMenu` - the three dots menu at the end of the `GameConfig` component, which allows for future/secondary actions to be added without cluttering the top bar. Currently houses the wakelock toggle, and bulk actions for changing flags  and card notes (the `MarkModal` and `NotesModal` components, respectively, which update the `contextOnCardsStore`)
  - 1: `Hand` - The hand component is responsible for collecting information and giving it to the `Card` child components. It controls how many cards are shown, the order in which they are displayed, and the information given to them. One important aspect of this is managing the in-game/review state, and choosing whether to give the cards the live game information from the various stores, or to create a local copy of that data for review manipulation.
    - 2: `Card` - responsible for an individual card. This displays the relevant information available for the card, and allows user interaction with the card either by selection or the card's menu. For completeness, the numbers and colours shown on the cards are in the `Colour` and `Number` components, which in turn choose what to show from the `/colour-icons` and `/number-icons` folders.

## Stores

The stores are separated out to try to minimise overlapping concerns. They all use the [svelte reactive store functionality](https://svelte.dev/docs/svelte/stores). There are three types of store, which for the purpose of this I will label a **pure store**, a **persistent store**, and a **persistent managed store**.

A **pure store** simply uses a svelte store, for example a `writable<number>` store.

A **persistent store** (src/lib/stores/persistentStore.ts) is a svelte store that has been wrapped in custom functionality to also be updated to Local Storage, so that it will persist between sessions. It offers some custom methods to ensure that the svelte store used for web app reactivity and Local Storage are kept in sync:
- subscribe to the svelte store for reactivity
- set a new value to the store, which will then be updated in local storage
- get the current value from the store (non-reactive)
- reset the store to either the start value, or the provIDed method for calculating the default value.
One important design decision is that a **persistent store** can be set up to automatically update when the `gameConfigStore` changes. There are many examples of how this is useful in the following list of all stores. Technically, this works by provIDing a optional function to the `createPersistentStore` function, which must take in the new `GameConfig` object and return a compatible value. If provIDed, the store automatically subscribes to the `gameConfigStore`, and updates to this calculated value on change.

A **persistent managed store** is a svelte store that leverages some data structure to manage complex data, and is also persisted to local memory - these either use my custom `Stack` implementation, or my custom `Dictionary` implementation. They make either the `Stack` methods (pop, insert, get, etc) or the `Dictionary` methods (getValueOrDefault, set) available, ensuring that the reactive store and Local Storage are kept in sync. For the dictionary implementation, there is also the ability to pass in a function that calculates the default data from a given `GameConfig` - however rather than intending to set the value of the whole store, as above, this gives the default value that the `Dictionary` should return. This is important as the default `CardInformation` requires knowledge of which suits are currently in play. It will always reset to an empty `Stack`/`Dictionary` on `gameConfigStore` change, as the card information will no longer be relevant.

Here is a complete list of the used stores, in sensible categories:

**Core game state**:
- `gameConfigStore`: This is a **persistent store** of type `GameConfig`, a custom type that keeps track of how many cards the player has in their hand (a `number`), and which suits are in play (a `SuitEnum` bitflag, explained later). This store is arguably the most important store of all, since it is both responsible for keeping track of that information for the scope of the current game, and any change to it - either updating or simply overwriting - is consIDered the start of a new game, and triggers the reset of many other stores. The user can do this from the `ConfigModal`, allowing them to specify how many cards are in their hand, and which suits they are using. They can also quickly reset the tracker here if their game was restarted, for example.

**Action tracking**:
- `actionStore`: This is the only **persistent managed store** to use a `Stack`. It is responsible for storing `GameAction` (a play/discard, a colour hint, or a number hint) objects in a stack, which can then be popped to undo an action, or read to recreate the flow of information in the review functionality. Note that this contains no information about any notes or flags applied.

**Card handling**:
- `cardIDCounterStore`: This is a **persistent store** of type `number`, used to keep track of the next unused card ID. It offers a custom function called `incrementAndGet` that allows the `PlayDiscardSelectedCard` component to ensure it is always getting a previously unseen card. It is de-incremented when a play/discard action is undone, and reset whenever the `gameConfigStore` changes.
- `cardsInHandStore`: This is a **persistent store** of type `set<number>`, used to keep track of the card IDs currently in the players hand. It is updated when a play/discard is used or undone, and resets on change to the `gameConfigStore`.
- `cardsSelectedStore`: this is a **pure store** of type `set<number>`, and keeps track of the card IDs currently selected. The `Hand` uses it to pass the selected state to the relevant cards. It is updated by selecting or deselecting cards, and is reset to an empty set on many game actions being completed, and also when the `gameConfigStore` changes.

**Card information**:
- `contextOnCardsStore`: This is a **persistent managed store** of type `Dictionary<CardContext>`. The dictionary takes in a card ID as a `number` and returns the relevant `CardContext` (`note`, `isHinted`, `isFinessed`, `isChopMoved` and `isCritical`), or the default value, if that ID has not yet had any information recorded about it. The `Hand` uses it to query and pass on information for the `Card`s using the `cardsInHandStore`'s IDs. It is updated by the user interacting with the `Card` menu, which offers the ability to toggle most flags and also edit or set the card's note; the `NoteModal` and `MarkModal`; and finally applying or undoing a hint will update the `isHinted` flag, which is the only system controlled flag.
- `informationOnCardsStore`: This is a **persistent managed store** of type `Dictionary<CardInfomation>`. It is responsible for keeping track of the `colourInformation` (the deduced colour information, of type `SuitEnum`), `knownColourInformation` (the given colour information, also a `SuitEnum`), the `numberInformation` (the deduced number information, of type `NumberEnum`) and the `knownNumberInformation` (the given number information, also a `NumberEnum`). This is queried by the `Hand`, and fed to the `Card`s. It is updated by the `HintModal` when a user applies given hints to their hand in game. It is reset when the `gameConfigStore` is updated.

**UI state**:
- `gameOrReviewStore`: This is a simple **pure store** that keeps track of whether we are in-game (`true`) or in review (`false`). It is controlled by the review button in the `GameControls` panel.
- `menuStore`: this is a **pure store** of type `number | null` that keeps track of which `Card` menu is open (the card's ID), or `null` if no card menu is open. `Card`s can compare their given ID to it to know when to display their menu, or set it as their menu is opened or closed. Since it can only contain one number, it follows that only one card menu can be open at a time.
- `reversedStore`: this is a **persistent store** of type `boolean`, which allows the user to set their preference of newest cards entering their hand on the left (`true`) or the right (`false`). It does not reset on `gameConfigStore` changes, and is only read by the `Hand` to change the display direction of the `cardsInHandStore`. All logic for the app is written as if cards enter the hand from the right, since this is the way I play, and also the way pushing to arrays work.
- `reviewTurnStore`: this is a **pure store** of type `number`, which simply keeps track of which turn the user is currently reviewing when in the review mode. It is set to the current turn when entering the review mode, and can be updated by the review controls in the `GameControl` panel.

## Suits and Numbers

The meat of the 'business logic' in this project is managed by two enums, the `SuitEnum` and the `NumberEnum`. These represent a bitflag system. For example, the suits are currently as follows:
```ts
// src/lib/models/variantEnums.ts
export enum SuitEnum {
  Red = 1,
  Yellow = 1 << 1,
  Blue = 1 << 2,
  White = 1 << 3,
  Green = 1 << 4,
  Rainbow = 1 << 5,
  Black = 1 << 6,
}
```
By using a bitflag system, we can effectively represent the known state of a card. Each bit corresponds to a suit, and if that bit is on, we know that the card could be that suit; if the bit is off, we know that the card cannot be that suit. Applying hints can then use binary operators to handle the logic, which while less readable, is very performant, and an interesting challenge for (my personal) development. Numbers and their corresponding hints use a similar system, whereby the number 1 is the first bit, 2 is the second, etc.

For suits, we also store some information about each suit, which is read from for various parts of the apps logic. For example:
```ts
// src/lib/models/variantEnums.ts
export const suitProperties: Record<SuitEnum, SuitProperties> = {
  [SuitEnum.Red]: {
    string: 'Red',
    stringHint: "Red",
    colourHint: SuitEnum.Red,
    positiveColourHintModifier: null,
    negativeColourHintModifier: null,
    positiveNumberHintModifier: null,
    negativeNumberHintModifier: null,
  },
  ...
}
```

The `SuitProperties` interface keeps track of:
- `string`: the human-readible string of the Suit, which can be used to convert the relevant `SuitEnum` for the UI
- `stringHint`: if the suit is hintable, then setting this to a string will ask the hint logic to check for and apply relevant hints; otherwise, leaving it null implies this suit is not hintable.
- `colourHint`: the SuitEnum that should be applied when giving a colourHint. Can be set to null for unhintable suits
- `positiveColourHintModifier`: When a colour hint is applied to a selected card (a 'positive hint'), if this suit is in play it has the option to apply a modifier to that hint. The easiest way to think about this is with the rainbow suit, where learning a card is green implies that the card is green or rainbow. This allows the rainbow suit to apply an 'or rainbow' modifier to the green (or any other hintable colour) hint.
- `negativeColourHintModifier`: As above, but for unselected cards (a 'negative hint'). The useful example here is also for the rainbow suit: if a card is not green, it is also necessarily not rainbow.
- `positiveNumberHintModifier`: As above, but in the case of being selected for a number hint. This may be useful in the future for suits that can recieve any number hints (see [hanab.live](https://hanab.live)'s pink or omni suits).
- `negativeNumberHintModifier`: As above, but when not being selected for a number hint.

There are some future extensions I may choose to make here: for example, [hanab.live](https://hanab.live)'s brown suit takes no number clues, and so if a card recieves a number clue, it is not brown. This implies a `positiveNumberHintToColourModifier` in the current implementation, which I am in no rush to implement.

Finally, each enum provides a helper function to deconstruct a composite enum into the individual ones. For example a red or rainbow card (`0b0100001`) would return `[0b0000001, 0b0100000]`, for both red and rainbow respectively.

## Action tracking and undoing

TODO

## Conclusion

Hopefully that gives a helpful run down of how the codebase works, for either you as someone new to it, or myself in the future when I have no clue how it works anymore. Any questions, please don't hesitate to raise a github issue or reach out to me - this documentation will be at it's most useful when it answers as many questions as can reasonably be answered.