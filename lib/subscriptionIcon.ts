const EXISTING_SUBSCRIPTION_COLORS = new Set([
  "#f5c542",
  "#e8def8",
  "#b8d4e3",
  "#b8e8d0",
  "#d4e4bc",
  "#c7d2fe",
  "#fbcfe8",
  "#e5e7eb",
]);

const CREATED_SUBSCRIPTION_COLORS = [
  "#ffd6a5",
  "#fdffb6",
  "#caffbf",
  "#9bf6ff",
  "#a0c4ff",
  "#bdb2ff",
  "#ffc6ff",
  "#ffadad",
  "#d0f4de",
  "#fefae0",
  "#e2ece9",
  "#f8edeb",
  "#dfe7fd",
  "#edffbe",
  "#ffc8dd",
];

const BRAND_ALIASES: Record<string, string> = {
  "adobe creative cloud": "adobe",
  "github pro": "github",
  "claude pro": "anthropic",
  "canva pro": "canva",
  openai: "openai",
  chatgpt: "openai",
  "google one": "google",
  "google drive": "googledrive",
  "apple music": "applemusic",
  "apple tv": "appletv",
  "disney plus": "disneyplus",
  "disney+": "disneyplus",
  "hbo max": "hbomax",
  "prime video": "primevideo",
  "xbox game pass": "xbox",
  "playstation plus": "playstation",
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .replace(/^-|-$/g, "");

export const getBrandIconUri = (name: string) => {
  const normalizedName = name.trim().toLowerCase();
  const slug =
    BRAND_ALIASES[normalizedName] ??
    BRAND_ALIASES[normalizedName.split(" ")[0]] ??
    slugify(name);

  return `https://cdn.simpleicons.org/${slug}/081126?viewbox=auto`;
};

export const getRandomSubscriptionColor = () => {
  const availableColors = CREATED_SUBSCRIPTION_COLORS.filter(
    (color) => !EXISTING_SUBSCRIPTION_COLORS.has(color)
  );

  const palette =
    availableColors.length > 0 ? availableColors : CREATED_SUBSCRIPTION_COLORS;

  return palette[Math.floor(Math.random() * palette.length)];
};
