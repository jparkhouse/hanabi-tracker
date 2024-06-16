# Changelog

## [2.0.0](https://github.com/jparkhouse/hanabi-tracker/compare/v1.5.0...v2.0.0) (2024-06-16)


### ⚠ BREAKING CHANGES

* **store:** The refactoring of the card store into multiple stores changes the structure of the state management. Ensure all related code is updated to use the new stores.

### Features

* reset zoom on menu close ([4b9d20b](https://github.com/jparkhouse/hanabi-tracker/commit/4b9d20b4e636207591adecaa3f0351bdfee70a61))


### Bug Fixes

* forced rerender of rainbow icon ([611e62f](https://github.com/jparkhouse/hanabi-tracker/commit/611e62fc12da9296f8fbecead289eed822141046))


### Code Refactoring

* **store:** separate card store into multiple stores and add local storage support ([51f35a3](https://github.com/jparkhouse/hanabi-tracker/commit/51f35a371de1738f7271256a0cbaa29ba178fd7e))

## [1.5.0](https://github.com/jparkhouse/hanabi-tracker/compare/v1.4.1...v1.5.0) (2024-05-26)


### Features

* add notes to cards ([1ef4f17](https://github.com/jparkhouse/hanabi-tracker/commit/1ef4f17bd2cbc65b9aa21a4991538b03b2a888bc))
* added version number to test ([64c6cf1](https://github.com/jparkhouse/hanabi-tracker/commit/64c6cf19bc2ab91bccfe68e0efdb9a80dbcc324b))


### Bug Fixes

* broken icon now rainbow ([17990e4](https://github.com/jparkhouse/hanabi-tracker/commit/17990e4d0f0828f719adb1816151fbb4ea342989))
* broken icon now rainbow ([d8ca500](https://github.com/jparkhouse/hanabi-tracker/commit/d8ca500475b6bb5c8b239dad3748de855100331c))
* set svelte store note value ([7a3288c](https://github.com/jparkhouse/hanabi-tracker/commit/7a3288cf8906d6f22a3ec7e3ee2b63087531c0af))

## [1.4.1](https://github.com/jparkhouse/hanabi-tracker/compare/v1.4.0...v1.4.1) (2024-05-01)


### Bug Fixes

* stop allowing hints that would leave a card with no possibilities ([52759f1](https://github.com/jparkhouse/hanabi-tracker/commit/52759f126d75d3ea72957aeb9ca0eb635e917f66))

## [1.4.0](https://github.com/jparkhouse/hanabi-tracker/compare/v1.3.2...v1.4.0) (2024-04-28)


### Features

* updated gameconfig to use local storage ([6f0b5c6](https://github.com/jparkhouse/hanabi-tracker/commit/6f0b5c664fbc5d3c51463ef2aeb2669a6fef4ec4))

## [1.3.2](https://github.com/jparkhouse/hanabi-tracker/compare/v1.3.1...v1.3.2) (2024-04-26)


### Bug Fixes

* added support for press-and-hold touch events ([9ce38e9](https://github.com/jparkhouse/hanabi-tracker/commit/9ce38e9b738737dabd76c5df9e9ddd14c942d454))
* blocked interactions with other cards while a menu is open ([2744ee4](https://github.com/jparkhouse/hanabi-tracker/commit/2744ee4ef264d91ce3e04f5f4be4db300b094a7e))
* on touch events now work ([2744ee4](https://github.com/jparkhouse/hanabi-tracker/commit/2744ee4ef264d91ce3e04f5f4be4db300b094a7e))

## [1.3.1](https://github.com/jparkhouse/hanabi-tracker/compare/v1.3.0...v1.3.1) (2024-04-23)


### Bug Fixes

* better colours ([6ecd13e](https://github.com/jparkhouse/hanabi-tracker/commit/6ecd13e84a0799be6e0fa9fc6237e2fb72ad7124))
* removed exta click from hint flow ([b601865](https://github.com/jparkhouse/hanabi-tracker/commit/b6018650d2dbe23db3e180326ddb0b5320262409))

## [1.3.0](https://github.com/jparkhouse/hanabi-tracker/compare/v1.2.2...v1.3.0) (2024-04-23)


### Features

* removed mark modal and integrated into card menus ([441e2de](https://github.com/jparkhouse/hanabi-tracker/commit/441e2de038706b65228dd6b83851742165af92ca))


### Bug Fixes

* added background colour states on selection ([91bbe3d](https://github.com/jparkhouse/hanabi-tracker/commit/91bbe3d58ab531422b2d028ad1c2d963c46d3ab4))
* added background colour states on selection ([5d41223](https://github.com/jparkhouse/hanabi-tracker/commit/5d41223f419d2976f87f67f36eeb37a8a1993d25))
* improved light/dark modes ([91bbe3d](https://github.com/jparkhouse/hanabi-tracker/commit/91bbe3d58ab531422b2d028ad1c2d963c46d3ab4))
* improved light/dark modes ([5d41223](https://github.com/jparkhouse/hanabi-tracker/commit/5d41223f419d2976f87f67f36eeb37a8a1993d25))

## [1.2.2](https://github.com/jparkhouse/hanabi-tracker/compare/v1.2.1...v1.2.2) (2024-04-19)


### Bug Fixes

* capitalise mark cards ([c755e8f](https://github.com/jparkhouse/hanabi-tracker/commit/c755e8f77bc3e0d040b7711813c0d0399ff22d29))
* underlined hyperlink for more standard styling ([c755e8f](https://github.com/jparkhouse/hanabi-tracker/commit/c755e8f77bc3e0d040b7711813c0d0399ff22d29))

## [1.2.1](https://github.com/jparkhouse/hanabi-tracker/compare/v1.2.0...v1.2.1) (2024-04-18)


### Bug Fixes

* went back to simple number icons, no variation in colours ([f0d4c80](https://github.com/jparkhouse/hanabi-tracker/commit/f0d4c8053e54c611f947e77da2c58a937cbbdfb0))

## [1.2.0](https://github.com/jparkhouse/hanabi-tracker/compare/v1.1.0...v1.2.0) (2024-04-18)


### Features

* added number icons ([b31ea50](https://github.com/jparkhouse/hanabi-tracker/commit/b31ea500f3ca0007c0e987388f2111bd5a2cc895))


### Bug Fixes

* fixed number icon scaling ([39a4d0b](https://github.com/jparkhouse/hanabi-tracker/commit/39a4d0bacd11012d4e65cb12dc837255d1108ae7))
* improving card styling wrt content spacing ([9759c60](https://github.com/jparkhouse/hanabi-tracker/commit/9759c6000db7b8c6b394f094083f66c4d9e66b62))
* removed hint modal component debug prints ([6867988](https://github.com/jparkhouse/hanabi-tracker/commit/686798844c6284365347308ff46f52c8b4f0f4f2))

## [1.1.0](https://github.com/jparkhouse/hanabi-tracker/compare/v1.0.0...v1.1.0) (2024-04-09)


### Features

* added selected styling to hintmodal buttons ([02464c0](https://github.com/jparkhouse/hanabi-tracker/commit/02464c0be0c7feaae59a5085f4b1ed4abdba325d))

## [1.0.0](https://github.com/jparkhouse/hanabi-tracker/compare/0.7.4...v1.0.0) (2024-04-09)


### ⚠ BREAKING CHANGES

* now using bitflags

### Features

* now using bitflags ([d433277](https://github.com/jparkhouse/hanabi-tracker/commit/d433277094967871b84bfe5d45efde8279f76d4b))
