# Reflect

Reflect is a minimalist personal journaling and reflection application designed to help you capture your thoughts with clarity and mindfulness. It provides a focused writing environment combined with insightful metrics to help you understand your patterns over time.

## Features

- **Personalized Onboarding**: Get started quickly with a setup process tailored to you.
- **Rich Text Journaling**: A distraction-free writing experience powered by the Tiptap editor.
- **Mood Tracking**: Log your emotional state with each entry to track your wellbeing.
- **Insights & Stats**: Visualize your journaling habits and mood trends with beautiful charts.
- **Manual Dark Mode**: A fully integrated dark theme for comfortable low-light reflection.
- **Privacy First**: All your data is stored locally in your browser using IndexedDB (Dexie), ensuring your private thoughts stay private.
- **Fully Responsive**: Optimized for seamless use across mobile, tablet, and desktop devices.
- **Smooth Animations**: A tactile and polished interface built with Motion.

## Tech Stack

- **Frontend**: React 18+ with Vite
- **Styling**: Tailwind CSS
- **Database**: Dexie.js (IndexedDB)
- **Animations**: Motion (formerly Framer Motion)
- **Icons**: Lucide React
- **Editor**: Tiptap
- **Routing**: React Router

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- A package manager — [Bun](https://bun.sh/) was used throughout development and is recommended, though npm, pnpm, or yarn will also work

### Setup

Install dependencies:

```bash
bun install
# or: npm install
```

### Running locally

Start the development server:

```bash
bun run dev
# or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the site.

### Other commands

| Command | Description |
|---|---|
| `bun run build` | Create a production build |
| `bun run start` | Start the production server |
| `bun run lint` | Run ESLint |

## Contributing

Contributions are welcome! Feel free to open an issue to report a bug or suggest an improvement, or submit a pull request with your changes. Since this is a demo project there are no strict contribution guidelines — just keep changes focused and descriptive.

## License

This project is released under the [GPL 3](./LICENSE).
