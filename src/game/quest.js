import { config } from "./config.js";
import content from "./content.json" with { type: "json" };

export const VENUE = config.venue;

// Marker ids stay fixed: treats 1–3, characters 4–7.
// Names and hints are the swappable pack in content.json.
const copyById = new Map(
  [...content.characters, ...content.treats].map((item) => [item.id, item]),
);

const finds = [
  {
    id: 4,
    kind: "elf",
    role: "The trail keeper",
    color: "#b9d778",
    greeting:
      "You found me! The wishing tree has gone dark. A little curiosity will help it glow again.",
    riddle: "I have rings, but no fingers. What am I?",
    choices: ["A tree", "A river", "A cloud"],
    answer: 0,
    reward: "Pip is coming to the moonlight picnic.",
  },
  {
    id: 5,
    kind: "elf",
    role: "The garden dreamer",
    color: "#f0b899",
    greeting:
      "Shhh… I was listening to the garden grow. Can you solve my tiny mystery?",
    riddle: "What gets bigger the more you take away?",
    choices: ["A flower", "A hole", "A cookie"],
    answer: 1,
    reward: "Clover has brought a pocketful of wishes.",
  },
  {
    id: 6,
    kind: "elf",
    role: "The cookie keeper",
    color: "#c2a9e4",
    greeting:
      "I was definitely guarding the cookies. Definitely not eating them. One question first!",
    riddle: "What has a face and hands, but no arms or legs?",
    choices: ["A mushroom", "A lantern", "A clock"],
    answer: 2,
    reward: "Bramble promises to save you a cookie.",
  },
  {
    id: 7,
    kind: "elf",
    role: "The lantern lighter",
    color: "#f3c968",
    greeting:
      "Every good adventure ends with a little light. Here is your last spark of wisdom.",
    riddle: "What can you catch, but never throw?",
    choices: ["A ball", "A cold", "A leaf"],
    answer: 1,
    reward: "Ember is ready to light the wishing tree.",
  },
  {
    id: 1,
    kind: "cookie",
    role: "A little moonlight",
    color: "#f3c968",
    greeting: "A golden cookie, still warm with a little woodland magic.",
  },
  {
    id: 2,
    kind: "cookie",
    role: "A little sweetness",
    color: "#eea595",
    greeting:
      "Sweet berries and a generous sprinkle of stardust. A picnic essential.",
  },
  {
    id: 3,
    kind: "cookie",
    role: "A little sunshine",
    color: "#cce1ac",
    greeting: "Someone saved the very best bite for the end of the adventure.",
  },
];

export const FINDS = Object.freeze(
  finds.map((find) => {
    const copy = copyById.get(find.id);
    if (!copy?.name?.trim() || !copy?.hint?.trim()) {
      throw new Error(
        `content.json needs a name and hint for marker ${find.id}`,
      );
    }
    return Object.freeze({ ...find, name: copy.name, hint: copy.hint });
  }),
);

export const findById = (id) => FINDS.find((find) => find.id === Number(id));
export const asset = (path) => `${import.meta.env.BASE_URL}${path}`;
