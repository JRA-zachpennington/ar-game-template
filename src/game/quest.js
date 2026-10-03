export const VENUE = Object.freeze({
  name: "The Brierbrook Grove",
  address: "1860 Brierbrook Rd, Germantown, TN 38138",
  // Property map pin, cross-checked against the Census street-address match.
  // This is a proximity fence, not a surveyed property boundary. See README.
  latitude: 35.0982848,
  longitude: -89.7970858,
  radiusMeters: 60,
  maxAccuracyMeters: 35,
  maxFixAgeMs: 30_000,
});

// Original Hide and Seek barcode IDs are preserved: cookies 1–3, elves 4–7.
export const FINDS = Object.freeze([
  {
    id: 4,
    kind: "elf",
    name: "Pip",
    role: "The trail keeper",
    color: "#b9d778",
    greeting:
      "You found me! The wishing tree has gone dark. A little curiosity will help it glow again.",
    riddle: "I have rings, but no fingers. What am I?",
    choices: ["A tree", "A river", "A cloud"],
    answer: 0,
    hint: "Pip likes a place where leaves make a little shade.",
    reward: "Pip is coming to the moonlight picnic.",
  },
  {
    id: 5,
    kind: "elf",
    name: "Clover",
    role: "The garden dreamer",
    color: "#f0b899",
    greeting:
      "Shhh… I was listening to the garden grow. Can you solve my tiny mystery?",
    riddle: "What gets bigger the more you take away?",
    choices: ["A flower", "A hole", "A cookie"],
    answer: 1,
    hint: "Clover feels at home near a pot or a garden bed.",
    reward: "Clover has brought a pocketful of wishes.",
  },
  {
    id: 6,
    kind: "elf",
    name: "Bramble",
    role: "The cookie keeper",
    color: "#c2a9e4",
    greeting:
      "I was definitely guarding the cookies. Definitely not eating them. One question first!",
    riddle: "What has a face and hands, but no arms or legs?",
    choices: ["A mushroom", "A lantern", "A clock"],
    answer: 2,
    hint: "Bramble prefers a cozy place to sit and rest.",
    reward: "Bramble promises to save you a cookie.",
  },
  {
    id: 7,
    kind: "elf",
    name: "Ember",
    role: "The lantern lighter",
    color: "#f3c968",
    greeting:
      "Every good adventure ends with a little light. Here is your last spark of wisdom.",
    riddle: "What can you catch, but never throw?",
    choices: ["A ball", "A cold", "A leaf"],
    answer: 1,
    hint: "Ember waits near a welcoming doorway, away from the road.",
    reward: "Ember is ready to light the wishing tree.",
  },
  {
    id: 1,
    kind: "cookie",
    name: "Moon chip",
    role: "A little moonlight",
    color: "#f3c968",
    greeting: "A golden cookie, still warm with a little woodland magic.",
    hint: "Look for a marker near the start of the host’s trail.",
  },
  {
    id: 2,
    kind: "cookie",
    name: "Berry button",
    role: "A little sweetness",
    color: "#eea595",
    greeting:
      "Sweet berries and a generous sprinkle of stardust. A picnic essential.",
    hint: "A splash of color may be hiding this cookie’s marker.",
  },
  {
    id: 3,
    kind: "cookie",
    name: "Honey star",
    role: "A little sunshine",
    color: "#cce1ac",
    greeting: "Someone saved the very best bite for the end of the adventure.",
    hint: "Check a low, easy-to-reach spot along the host’s trail.",
  },
]);

export const findById = (id) => FINDS.find((find) => find.id === Number(id));
export const asset = (path) => `${import.meta.env.BASE_URL}${path}`;
