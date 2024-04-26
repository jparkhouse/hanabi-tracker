# Hanabi tracker

Inspired by functionality found over on [hanab.live](https://hanab.live), I decided to embark on making a web app for tracking a single player's hand. I hope to build towards feature parity with hanab.live, with the addition of notes, marking cards as critical, etc, although there will be some functionality I cannot add, since this app will never have the full game state. The hosted app can be found [here](https://jparkhouse.github.io/hanabi-tracker/) assuming all is working well.

## Features

Currently, the app features the ability to:
- choose between 3-5 cards
- apply hints
- play or discard cards
- mark cards as critical (red border), chop moved (white\blue border), or finessed (aqua border)
    - hinted is automatically marked (orange border)
- undo actions (up to 5)

Variants currently supported:
- No variant (standard 5 suits)
- Rainbows (a multicolour suit)
- Black (a colourless suit)
- Rainbows and Blacks (both the multicolour and no colour suits).

## Technical

The app is built by me, Jake, and I am very much an amatuer coder. It uses Vite + Svelte, and is my first foray into this tech stack, my first full typescript project, and even my first web development project. If for whatever reason you want to help out, I'm likely happy to collaborate - please reach out to me on discord at morefriendsthanmost. As a Product Manager by day, I'm sure I can find you some requirements to work on :D

## ToDo

Next on the roadmap:
- Potentially improve UX
- Local storage to track configuration/last state
- Notes on cards
- Review feature?
