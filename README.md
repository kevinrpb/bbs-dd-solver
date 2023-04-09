# BBS Dungeons & Diagrams Solver

This is toy project that provides solvers for the 'Dungeons & Diagrams' game contained within Zachtronics' [Last Call BBS](https://www.zachtronics.com/last-call-bbs/).

## TODO

### Bugs

- [ ] Preview clues' state not matching preview board
- [ ] 'Stop' button does nothing

### Features

- [ ] Solvers.
  - [x] Bruteforce/Backtracking
  - [ ] Genetic pogramming
  - [ ] Q-Learn
  - [ ] ...
- [ ] Board import/export
- [ ] Board manager in-web
- [ ] Standalone app (via [Tauri](https://tauri.app/v1/guides/getting-started/setup/next-js/))
- [ ] ...

### UI

- [x] Choose UI Framework -> [NextUI](https://nextui.org/)
  - Not yet ready, they are [working on a new version](https://github.com/nextui-org/nextui/discussions/1035), with support for Next 13 and other goodies
- [ ] Solver dropdown
- [ ] Context messages
- [ ] ...

### Internals

- [x] Cleanup `page.tsx`
  - Moved the boards logic to its own `wrapper.tsx` component. Ideally, we don't need to change this file further.
- [ ] ...
