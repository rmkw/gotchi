# Gotchi

Virtual pet built with Angular. The app combines a Tamagotchi-style care loop, animated sprite states, inventory items, simple minigames, daily rewards, and an AI chat so the pet can respond with personality.

## Features

- Virtual pet stats: health, food, happiness, energy, cleanliness, sleep state, death state, and adventure counter.
- Day and night scenes driven by the current local time.
- Animated sprites for neutral, happy, sad, sleepy, sleeping, dirty, and sick states.
- Dedicated game-over scenes for day and night.
- Pet naming flow with a startup modal and reset modal.
- Inventory grouped by food, medicine, cleaning, toys, and special items.
- Daily special gift that can be claimed once per day.
- Minigame area with a reaction game.
- Sprite review page at `/revisarsprite` to compare all animation states.
- AI chat with Gemini or MiniMax provider selection.
- Local chat memory for user name, remembered notes, and recent conversation.

## AI Chat

The chat can use either Google Gemini or MiniMax. Open the AI setup modal from the chat status button and choose one provider.

Only one provider can be active at a time. To switch providers, disconnect the current one with `Apagar`, then configure the other provider.

Current defaults:

- Gemini: `gemini-flash-latest`
- MiniMax: `MiniMax-M2.7`

The app stores API keys in browser `localStorage` for local testing. This is convenient during development, but it is not safe for production. A production version should route AI calls through a backend or secure proxy so provider keys are not exposed in client-side code.

## Chat Memory

The AI service stores lightweight local memory in `localStorage`:

- Up to 24 remembered notes from phrases like `recuerda que...` or `no olvides que...`.
- Up to 20 recent user/pet exchanges.
- The user's name when detected from phrases like `me llamo...`, `mi nombre es...`, or `soy...`.

This memory is sent with each prompt so the pet can answer with more continuity.

## Assets

Main pet assets live in:

```bash
public/assets/gotchi
```

The current scene system uses:

- `escenario-dia.png`
- `escenario-noche.png`
- `dia-gameover.png`
- `noche-gameover.png`
- `animation-sequence-neutral.png`
- `animation-sequence-happy.png`
- `animation-sequence-triste.png`
- `animation-sequence-sueno.png`
- `animation-sequence-dormido.png`
- `animation-sequence-sucio.png`
- `animation-sequence-enfermo.png`

## Development

Install dependencies:

```bash
npm install
```

Start the local dev server:

```bash
npm start
```

Open:

```bash
http://localhost:4200/
```

Build the app:

```bash
npm run build
```

Run unit tests:

```bash
npm test
```

## Useful Routes

- `/` main pet screen
- `/minigames` minigames hub and daily gift
- `/minigames/reaction` reaction game
- `/revisarsprite` sprite comparison page

## Project Notes

- The current visual theme is based on the warm palette from the day scene.
- Some persistence keys still use the original `gotchi` name for compatibility with existing local data.
- A future low-impact rename to `OpenGotchii` should first update user-facing text and metadata, while leaving internal storage keys intact to avoid losing saved data.
