// What each common diagnosis often looks like, shown on the answer card.
// General descriptions in our own words, from the public pages linked in each source.
// They describe the diagnosis, not the photo on screen. Awaiting review by a dermatologist.
const NOTES = [
  {
    match: /melanoma/i,
    title: "What melanoma often looks like",
    points: [
      "An uneven shape, often with two halves that don't match and ragged edges",
      "Two or more colors mixed together",
      "Often wider than 6 mm, about the size of a pencil eraser",
      "Changing in size, shape or color over time",
      "Sometimes itchy, sore, crusty or bleeding",
    ],
    source: ["NHS: melanoma symptoms", "https://www.nhs.uk/conditions/melanoma-skin-cancer/symptoms/"],
  },
  {
    match: /basal cell/i,
    title: "What basal cell carcinoma often looks like",
    points: [
      "A firm, raised, round bump: shiny pink or red on lighter skin, brown or black on darker skin",
      "A sore that doesn't heal, or heals and comes back",
      "A scaly patch, or a new mark that looks like a scar",
      "Usually on skin that gets a lot of sun, like the face",
    ],
    source: ["American Academy of Dermatology: basal cell carcinoma", "https://www.aad.org/public/diseases/skin-cancer/types/common/bcc/symptoms"],
  },
  {
    match: /squamous|keratoacanthoma/i,
    title: "What squamous cell carcinoma often looks like",
    points: [
      "A rough, scaly patch",
      "A firm, dome-shaped bump",
      "A sore with a raised edge, or one that bleeds or keeps coming back",
      "A growth like a wart or a small horn",
      "Red, pink, brown, black or the same color as the skin around it",
    ],
    source: ["American Academy of Dermatology: squamous cell carcinoma", "https://www.aad.org/public/diseases/skin-cancer/types/common/scc/symptoms"],
  },
  {
    match: /^nevus$/i,
    title: "What a harmless mole often looks like",
    points: [
      "Round or oval, with a smooth edge",
      "Flat or raised, smooth or rough, sometimes with hair",
      "Worth a doctor's look if it changes size, shape or color, or becomes itchy, sore, crusty or bleeding",
    ],
    source: ["NHS: moles", "https://www.nhs.uk/conditions/moles/"],
  },
  {
    match: /seborrheic/i,
    title: "What a seborrheic keratosis often looks like",
    points: [
      "Looks stuck on to the skin, with a waxy surface",
      "Usually brown, though anything from white to black",
      "Starts as a small rough bump and slowly thickens into a warty surface",
    ],
    source: ["American Academy of Dermatology: seborrheic keratoses", "https://www.aad.org/public/diseases/a-z/seborrheic-keratoses-symptoms"],
  },
];

function noteFor(dx) {
  return NOTES.find((n) => n.match.test(dx || "")) || null;
}
