export const DEFAULT_PROMPTS = [
  {
    emoji: "🏠",
    title: "Build an Airbnb clone",
    prompt:
      "Build a modern Airbnb style homepage with a search option (make it functional, people should be able to choose check in and checkout dates, number of guests, and destination), use shadcn ui calendar or datepicker for checkin and checkout times, if a screenshot or design image is provided, generate the app exactly like that image or screenshot. make it functional as much as you can.",
  },
  {
    emoji: "📒",
    title: "Build a kanban board",
    prompt:
      "Build a modern kanban board with drag and drop using dnd-kit. Use consistent spacing, column widths, and hover effects for a polished UI.",
  },
  {
    emoji: "📄",
    title: "Build a landing page",
    prompt: "Build a landing page for a SAAS business with pricing section",
  },
  {
    emoji: "📹",
    title: "Build a youtube clone",
    prompt:
      "Build a youtube clone with search options, subscribe, like a video and comment under a video options, make as functional as you can.",
  },
  {
    emoji: "🎥",
    title: "Build a Netflex clone",
    prompt:
      "Build a Netflex clone with search options, and a modal to open the movie preview, make as functional as you can.",
  },
] as const;
