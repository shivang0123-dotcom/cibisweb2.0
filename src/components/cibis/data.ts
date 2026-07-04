// CIBISWEB — Demo content. Original, interconnected Italian-food dataset.
// Relationships (which restaurants serve a dish, related dishes, etc.) are
// derived in search-utils from city / category / cuisine links.

const IMGS = [
  "photo-1517248135467-4c7edcad34c4",
  "photo-1414235077428-338989a2e8c0",
  "photo-1559339352-11d035aa65de",
  "photo-1565299624946-b28f40a0ae38",
  "photo-1556760544-74068565f05c",
  "photo-1481931098730-318b6f776db0",
  "photo-1551183053-bf91a1d81141",
  "photo-1556909212-d5b604d0c90d",
];
export function img(i: number, w = 800, h = 600) {
  return `https://images.unsplash.com/${IMGS[((i % IMGS.length) + IMGS.length) % IMGS.length]}?w=${w}&h=${h}&fit=crop&auto=format`;
}

export type DishCategory =
  | "Pizza" | "Pasta" | "Desserts" | "Seafood" | "Vegetarian" | "Fine Dining"
  | "Main Course" | "Street Food" | "Antipasti";

export type City = {
  id: string; name: string; region: string; image: string; blurb: string;
  culture: string; famous: string[];
};
export type Difficulty = "Easy" | "Medium" | "Hard";
export type WineType = "Red" | "White" | "Sparkling" | "Dessert" | "None";
export type Nutrition = { calories: number; protein: number; carbs: number; fat: number; fiber: number; sugar: number };
export type Dish = {
  id: string; name: string; cityId: string; category: DishCategory;
  description: string; rating: number; image: string; vegetarian: boolean;
  history: string; ingredients: string[]; steps: string[];
  difficulty: Difficulty; prepMinutes: number; cookMinutes: number; servings: number;
  nutrition: Nutrition; allergens: string[];
  wine: { type: WineType; name: string; note: string };
  funFacts: string[];
};
export type Restaurant = {
  id: string; name: string; cityId: string; cuisine: string; rating: number;
  price: 1 | 2 | 3 | 4; image: string; blurb: string; michelin: 0 | 1 | 2 | 3;
  openNow: boolean; vegetarian: boolean; fineDining: boolean;
  signatureDishes: string[]; story: string; gallery: string[];
  reviews: { name: string; rating: number; text: string }[];
  hours: { days: string; time: string }[];
  chef: { name: string; title: string; bio: string };
  address: string;
};
export type Story = {
  id: string; title: string; category: "Article" | "Video" | "News" | "Fun";
  readTime: string; image: string; excerpt: string; date: string; dishId?: string; cityId?: string;
};
export type Video = { id: string; title: string; duration: string; thumb: string; channel: string; dishId?: string };
export type News = { id: string; title: string; date: string; image: string; excerpt: string; tag: string };

/* ── Cities (10) ─────────────────────────────────────────────────── */
export const CITIES: City[] = [
  { id: "rome", name: "Rome", region: "Lazio", image: img(0, 1200, 800), blurb: "The eternal city — home of carbonara, cacio e pepe and Roman trattoria tradition.", culture: "Roman cooking is built on cucina povera: few ingredients, big flavour, pasta and pecorino at the heart of it.", famous: ["Carbonara", "Cacio e Pepe", "Amatriciana", "Supplì"] },
  { id: "naples", name: "Naples", region: "Campania", image: img(3, 1200, 800), blurb: "The birthplace of pizza and a street-food capital on the Bay of Naples.", culture: "Naples gave the world the pizza margherita. Wood-fired, blistered, and fiercely protected by tradition.", famous: ["Margherita Pizza", "Sfogliatella", "Baba", "Panzerotti"] },
  { id: "milan", name: "Milan", region: "Lombardy", image: img(1, 1200, 800), blurb: "Italy's design capital, with a rich, buttery Lombard kitchen.", culture: "Milanese food is golden and refined — saffron risotto, breaded veal, and aperitivo culture.", famous: ["Risotto alla Milanese", "Osso Buco", "Cotoletta"] },
  { id: "florence", name: "Florence", region: "Tuscany", image: img(2, 1200, 800), blurb: "Renaissance city with a rustic, meat-forward Tuscan table.", culture: "Tuscan cooking celebrates bread, beans and the famous bistecca — simple, generous and seasonal.", famous: ["Bistecca alla Fiorentina", "Ribollita", "Pappa al Pomodoro"] },
  { id: "bologna", name: "Bologna", region: "Emilia-Romagna", image: img(4, 1200, 800), blurb: "La Grassa — the fat one — Italy's undisputed pasta heartland.", culture: "Emilia-Romagna is the home of ragù, mortadella, parmigiano and hand-folded tortellini.", famous: ["Tagliatelle al Ragù", "Tortellini in Brodo", "Lasagne alla Bolognese"] },
  { id: "venice", name: "Venice", region: "Veneto", image: img(6, 1200, 800), blurb: "Floating city of cicchetti bars and lagoon seafood.", culture: "Venetian cooking leans on the sea and on cicchetti — small bites eaten standing at the bàcaro.", famous: ["Spaghetti alle Vongole", "Fritto Misto", "Baccalà"] },
  { id: "turin", name: "Turin", region: "Piedmont", image: img(5, 1200, 800), blurb: "Elegant Piedmont capital of truffles, chocolate and vermouth.", culture: "Piedmontese food is aristocratic — white truffles, agnolotti and slow-braised beef.", famous: ["Agnolotti", "Bagna Cauda", "Vitello Tonnato"] },
  { id: "palermo", name: "Palermo", region: "Sicily", image: img(7, 1200, 800), blurb: "Sicily's chaotic, sun-drenched street-food kingdom.", culture: "Sicilian cooking is a crossroads of Arab, Greek and Norman flavours — sweet, fried and vibrant.", famous: ["Arancini", "Caponata", "Cannoli", "Pasta alla Norma"] },
  { id: "genoa", name: "Genoa", region: "Liguria", image: img(1, 1200, 800), blurb: "Ligurian port city and birthplace of pesto.", culture: "Ligurian cooking is green and fragrant — basil pesto, focaccia and herbs from the coast.", famous: ["Trofie al Pesto", "Focaccia Genovese"] },
  { id: "bari", name: "Bari", region: "Puglia", image: img(2, 1200, 800), blurb: "Puglia's coastal capital of orecchiette and olive oil.", culture: "Pugliese food is the food of the sun — durum wheat pasta, greens, seafood and superb olive oil.", famous: ["Orecchiette alle Cime di Rapa", "Panzerotti", "Burrata"] },
];

/* ── Dishes (40) ─────────────────────────────────────────────────── */
type DSeed = [name: string, cityId: string, cat: DishCategory, veg: boolean, desc: string];
const DISH_SEED: DSeed[] = [
  ["Carbonara", "rome", "Pasta", false, "Traditional Roman pasta with eggs, Pecorino Romano, black pepper and guanciale."],
  ["Cacio e Pepe", "rome", "Pasta", true, "Silky Roman pasta of just pecorino and cracked black pepper."],
  ["Amatriciana", "rome", "Pasta", false, "Bucatini in a tomato, guanciale and pecorino sauce from Amatrice."],
  ["Gricia", "rome", "Pasta", false, "The 'white amatriciana' — guanciale and pecorino, no tomato."],
  ["Supplì", "rome", "Street Food", false, "Fried rice croquettes with a molten mozzarella heart."],
  ["Saltimbocca", "rome", "Main Course", false, "Veal with prosciutto and sage — it 'jumps in the mouth'."],
  ["Margherita Pizza", "naples", "Pizza", true, "Wood-fired pizza of tomato, mozzarella and basil — the Neapolitan icon."],
  ["Marinara Pizza", "naples", "Pizza", true, "Tomato, garlic, oregano and oil — pizza in its purest form."],
  ["Sfogliatella", "naples", "Desserts", true, "Shell-shaped pastry with sweet ricotta and candied peel."],
  ["Baba", "naples", "Desserts", true, "Rum-soaked sponge cake, a Neapolitan sweet obsession."],
  ["Panzerotti", "naples", "Street Food", true, "Fried half-moon pockets of tomato and mozzarella."],
  ["Risotto alla Milanese", "milan", "Main Course", true, "Golden saffron risotto finished with butter and parmigiano."],
  ["Osso Buco", "milan", "Main Course", false, "Braised veal shank with gremolata over risotto."],
  ["Cotoletta alla Milanese", "milan", "Main Course", false, "Bone-in veal cutlet breaded and fried in butter."],
  ["Bistecca alla Fiorentina", "florence", "Main Course", false, "Towering T-bone grilled rare over embers."],
  ["Ribollita", "florence", "Vegetarian", true, "Hearty Tuscan bread-and-bean soup, 'reboiled'."],
  ["Pappa al Pomodoro", "florence", "Vegetarian", true, "Thick Tuscan tomato and bread soup."],
  ["Tagliatelle al Ragù", "bologna", "Pasta", false, "Egg ribbons in a slow-cooked Bolognese meat ragù."],
  ["Tortellini in Brodo", "bologna", "Pasta", false, "Hand-folded stuffed pasta in golden capon broth."],
  ["Lasagne alla Bolognese", "bologna", "Pasta", false, "Layers of pasta, ragù and béchamel baked golden."],
  ["Mortadella", "bologna", "Antipasti", false, "The silky pink cured pork of Bologna."],
  ["Spaghetti alle Vongole", "venice", "Seafood", false, "Spaghetti with clams, garlic, white wine and parsley."],
  ["Fritto Misto", "venice", "Seafood", false, "Lightly fried mixed seafood from the lagoon."],
  ["Baccalà Mantecato", "venice", "Seafood", false, "Whipped salt cod on grilled polenta, a cicchetti classic."],
  ["Agnolotti del Plin", "turin", "Pasta", false, "Tiny pinched Piedmontese pasta filled with roast meat."],
  ["Bagna Cauda", "turin", "Vegetarian", true, "Warm anchovy-garlic dip for raw vegetables."],
  ["Vitello Tonnato", "turin", "Antipasti", false, "Cold sliced veal under a creamy tuna sauce."],
  ["Arancini", "palermo", "Street Food", false, "Golden fried rice balls stuffed with ragù or cheese."],
  ["Caponata", "palermo", "Vegetarian", true, "Sweet-and-sour Sicilian aubergine relish."],
  ["Cannoli", "palermo", "Desserts", true, "Crisp shells piped with sweet sheep's-milk ricotta."],
  ["Pasta alla Norma", "palermo", "Pasta", true, "Pasta with fried aubergine, tomato and ricotta salata."],
  ["Cassata", "palermo", "Desserts", true, "Ornate sponge cake with ricotta and candied fruit."],
  ["Trofie al Pesto", "genoa", "Pasta", true, "Twisted Ligurian pasta in basil pesto with potato and beans."],
  ["Focaccia Genovese", "genoa", "Street Food", true, "Dimpled olive-oil flatbread, golden and salty."],
  ["Orecchiette alle Cime di Rapa", "bari", "Vegetarian", true, "Ear-shaped pasta with turnip tops, garlic and chilli."],
  ["Burrata", "bari", "Antipasti", true, "Fresh mozzarella pouch oozing with cream."],
  ["Tiramisu", "venice", "Desserts", true, "Coffee-soaked savoiardi layered with mascarpone."],
  ["Panna Cotta", "turin", "Desserts", true, "Silky set cream with berries or caramel."],
  ["Gelato Artigianale", "florence", "Desserts", true, "Dense, small-batch Italian ice cream."],
  ["Porchetta", "rome", "Street Food", false, "Herb-stuffed slow-roasted pork, sliced into rolls."],
];
/* Deterministic enrichment helpers (no RNG — stable across renders) */
const has = (name: string, ...words: string[]) => words.some((w) => name.toLowerCase().includes(w));

function difficultyFor(name: string, cat: DishCategory): Difficulty {
  if (has(name, "tortellini", "agnolotti", "sfogliatella", "cassata", "osso buco", "lasagne")) return "Hard";
  if (cat === "Street Food" || cat === "Antipasti" || has(name, "focaccia", "burrata", "mortadella", "bruschetta")) return "Easy";
  if (cat === "Desserts" || cat === "Main Course" || cat === "Seafood") return "Medium";
  return has(name, "carbonara", "cacio") ? "Medium" : "Easy";
}
function timesFor(cat: DishCategory, i: number): { prep: number; cook: number } {
  const base: Record<DishCategory, [number, number]> = {
    Pasta: [20, 25], Pizza: [30, 12], Desserts: [35, 30], Seafood: [20, 20],
    Vegetarian: [15, 35], "Fine Dining": [40, 45], "Main Course": [25, 60],
    "Street Food": [20, 15], Antipasti: [15, 5],
  };
  const [p, c] = base[cat];
  return { prep: p + ((i * 5) % 15), cook: c + ((i * 7) % 20) };
}
function nutritionFor(cat: DishCategory, i: number): Nutrition {
  const base: Record<DishCategory, Nutrition> = {
    Pasta: { calories: 620, protein: 22, carbs: 78, fat: 22, fiber: 4, sugar: 5 },
    Pizza: { calories: 810, protein: 30, carbs: 96, fat: 30, fiber: 5, sugar: 8 },
    Desserts: { calories: 430, protein: 8, carbs: 54, fat: 20, fiber: 2, sugar: 34 },
    Seafood: { calories: 470, protein: 34, carbs: 26, fat: 22, fiber: 2, sugar: 3 },
    Vegetarian: { calories: 380, protein: 13, carbs: 52, fat: 12, fiber: 8, sugar: 9 },
    "Fine Dining": { calories: 540, protein: 30, carbs: 34, fat: 28, fiber: 3, sugar: 6 },
    "Main Course": { calories: 580, protein: 44, carbs: 16, fat: 34, fiber: 2, sugar: 4 },
    "Street Food": { calories: 460, protein: 15, carbs: 50, fat: 22, fiber: 3, sugar: 6 },
    Antipasti: { calories: 320, protein: 16, carbs: 12, fat: 24, fiber: 2, sugar: 3 },
  };
  const b = base[cat];
  const j = (n: number) => Math.round(n * (0.92 + ((i * 13) % 17) / 100));
  return { calories: j(b.calories), protein: j(b.protein), carbs: j(b.carbs), fat: j(b.fat), fiber: Math.max(1, j(b.fiber)), sugar: Math.max(1, j(b.sugar)) };
}
function allergensFor(name: string, cat: DishCategory, veg: boolean): string[] {
  const a = new Set<string>();
  if (cat === "Pasta" || cat === "Pizza" || cat === "Street Food" || cat === "Desserts" || has(name, "focaccia", "lasagne", "supplì", "arancini")) a.add("Gluten");
  if (has(name, "carbonara", "tortellini", "tagliatelle", "lasagne", "agnolotti", "tiramisu", "cassata", "sfogliatella", "baba", "panna")) a.add("Egg");
  if (has(name, "carbonara", "cacio", "amatriciana", "gricia", "margherita", "burrata", "risotto", "tiramisu", "cannoli", "cassata", "sfogliatella", "panna", "supplì", "panzerotti", "gelato", "cotoletta", "norma", "pesto", "mortadella")) a.add("Milk");
  if (cat === "Seafood" || has(name, "bagna cauda", "vitello tonnato", "baccalà", "vongole")) a.add("Seafood");
  if (has(name, "pesto", "cassata", "cannoli", "agnolotti")) a.add("Nuts");
  if (!veg && !a.has("Seafood") && cat !== "Desserts") a.add("May contain pork");
  return [...a];
}
function wineFor(name: string, cat: DishCategory, cityId: string): { type: WineType; name: string; note: string } {
  if (has(name, "tiramisu", "cannoli", "cassata", "sfogliatella", "baba", "panna", "gelato"))
    return { type: "Dessert", name: cityId === "palermo" ? "Passito di Pantelleria" : "Moscato d'Asti", note: "Sweet, aromatic and gentle — it lifts the dessert without overwhelming it." };
  if (cat === "Seafood")
    return { type: "White", name: cityId === "venice" ? "Soave Classico" : "Vermentino di Sardegna", note: "Crisp acidity and saline minerality to mirror the seafood." };
  if (cat === "Pizza")
    return { type: has(name, "marinara") ? "Red" : "Sparkling", name: has(name, "marinara") ? "Aglianico" : "Franciacorta Brut", note: "Bubbles or rustic red cut through the char and mozzarella." };
  if (cat === "Street Food" || cat === "Antipasti")
    return { type: "Sparkling", name: "Prosecco Superiore DOCG", note: "Light and refreshing alongside fried or cured bites." };
  const byCity: Record<string, [string, string]> = {
    rome: ["Cesanese del Piglio", "A Lazio red with soft tannins that loves pecorino and guanciale."],
    naples: ["Piedirosso", "A volcanic Campanian red, juicy and food-friendly."],
    milan: ["Barbera d'Asti", "Bright cherry acidity to balance butter and saffron."],
    florence: ["Chianti Classico Riserva", "Sangiovese structure made for grilled meat and Tuscan herbs."],
    bologna: ["Sangiovese di Romagna", "Medium-bodied and savoury — ragù's oldest companion."],
    venice: ["Valpolicella Ripasso", "Round and warming next to lagoon-side plates."],
    turin: ["Barolo", "The king of Nebbiolo for Piedmont's richest dishes."],
    palermo: ["Nero d'Avola", "Sun-ripened Sicilian fruit with a Mediterranean backbone."],
    genoa: ["Pigato", "A herbal Ligurian white that echoes basil and olive oil."],
    bari: ["Primitivo di Manduria", "Ripe southern red with the depth for durum-wheat classics."],
  };
  const [w, note] = byCity[cityId] || byCity.rome;
  return { type: cat === "Vegetarian" ? "White" : "Red", name: cat === "Vegetarian" ? "Verdicchio dei Castelli di Jesi" : w, note };
}
function ingredientsFor(name: string, cat: DishCategory): string[] {
  const base: Record<DishCategory, string[]> = {
    Pasta: ["400 g pasta or fresh egg dough", "Extra-virgin olive oil", "Sea salt", "Freshly cracked black pepper"],
    Pizza: ["500 g type-00 flour", "325 ml water", "Fresh yeast", "San Marzano tomatoes", "Sea salt"],
    Desserts: ["Fresh eggs", "Caster sugar", "Type-00 flour or savoiardi", "Full-fat dairy"],
    Seafood: ["Fresh catch from the market", "Garlic", "Dry white wine", "Flat-leaf parsley", "Extra-virgin olive oil"],
    Vegetarian: ["Seasonal vegetables", "Extra-virgin olive oil", "Day-old bread or legumes", "Fresh herbs"],
    "Fine Dining": ["Premium seasonal produce", "Butter", "Stock", "Finishing salt"],
    "Main Course": ["Quality meat from a trusted butcher", "Extra-virgin olive oil", "Fresh herbs", "Sea salt"],
    "Street Food": ["Type-00 flour or rice", "Mozzarella", "Neutral oil for frying", "Sea salt"],
    Antipasti: ["The best raw ingredients you can find", "Extra-virgin olive oil", "Crusty bread", "Cracked pepper"],
  };
  const extra: [string[], string[]][] = [
    [["carbonara"], ["150 g guanciale", "4 egg yolks + 1 whole egg", "100 g Pecorino Romano"]],
    [["cacio"], ["200 g Pecorino Romano", "Generous black pepper"]],
    [["amatriciana", "gricia"], ["150 g guanciale", "Pecorino Romano", "Peeled tomatoes (amatriciana only)"]],
    [["margherita", "marinara"], ["Fior di latte or garlic & oregano", "Fresh basil"]],
    [["milanese", "risotto"], ["Carnaroli rice", "Saffron threads", "Beef marrow", "Parmigiano Reggiano"]],
    [["vongole"], ["1 kg fresh clams", "Chilli"]],
    [["ragù", "lasagne", "tortellini"], ["Slow-cooked meat ragù", "Parmigiano Reggiano", "Béchamel (lasagne)"]],
    [["pesto"], ["Fresh basil", "Pine nuts", "Parmigiano & pecorino", "Ligurian olive oil"]],
    [["tiramisu"], ["Mascarpone", "Strong espresso", "Cocoa powder", "Savoiardi"]],
    [["cannoli", "cassata"], ["Sheep's-milk ricotta", "Candied fruit", "Pistachios"]],
    [["fiorentina"], ["1.2 kg T-bone of Chianina beef", "Coarse salt", "Rosemary"]],
    [["arancini", "supplì"], ["Cooked risotto rice", "Ragù or mozzarella filling", "Breadcrumbs"]],
    [["orecchiette"], ["Cime di rapa (turnip tops)", "Anchovies", "Garlic", "Chilli"]],
    [["bagna"], ["Anchovies", "Garlic", "Butter and oil", "Raw seasonal vegetables"]],
  ];
  const found = extra.find(([keys]) => has(name, ...keys));
  return [...(found ? found[1] : []), ...base[cat]];
}
function stepsFor(name: string, cat: DishCategory): string[] {
  const method: Record<DishCategory, string[]> = {
    Pasta: ["Bring a large pot of well-salted water to a rolling boil.", "Prepare the condiment in a wide pan while the pasta cooks.", "Cook the pasta until just under al dente.", "Transfer to the pan with a ladle of starchy water and toss to emulsify.", "Finish with cheese off the heat and serve immediately."],
    Pizza: ["Mix and knead the dough, then rest it for 24 hours in the fridge.", "Shape balls and prove until doubled.", "Stretch by hand — never with a rolling pin.", "Top sparingly and bake at the highest heat your oven allows.", "Rest one minute, slice and eat straight away."],
    Desserts: ["Prepare the base or cream component first and chill it.", "Work the dairy gently so it stays light.", "Assemble in layers, pressing nothing down.", "Rest in the fridge so the flavours settle.", "Finish with the final dusting only at the table."],
    Seafood: ["Purge and clean the seafood carefully.", "Warm garlic and oil gently — never let it brown.", "Add the seafood and wine, cover, and steam briefly.", "Toss with the main element and its juices.", "Finish with parsley and good oil; serve at once."],
    Vegetarian: ["Prepare the vegetables while the base simmers.", "Build flavour slowly over low heat.", "Add the bread or legumes and let everything mingle.", "Rest briefly — this dish improves as it sits.", "Serve warm, never hot, with a thread of raw oil."],
    "Fine Dining": ["Prepare each component separately and precisely.", "Season in layers, tasting constantly.", "Cook the centrepiece to exact temperature.", "Plate with restraint.", "Serve without delay."],
    "Main Course": ["Bring the meat to room temperature and season boldly.", "Sear hard to build a crust.", "Lower the heat and cook gently to the right point.", "Rest the meat as long as you seared it.", "Slice against the grain and finish with pan juices."],
    "Street Food": ["Prepare the filling and let it cool completely.", "Shape with wet hands so nothing sticks.", "Coat evenly in breadcrumbs or batter.", "Fry at 170 °C until deep gold.", "Drain, salt and eat while hot."],
    Antipasti: ["Choose impeccable raw ingredients — there is nowhere to hide.", "Slice or arrange just before serving.", "Dress with oil, salt and little else.", "Serve with warm bread.", "Let the produce speak."],
  };
  return method[cat];
}
function funFactsFor(name: string, cat: DishCategory, cityId: string, i: number): string[] {
  const city = CITIES.find((c) => c.id === cityId);
  const dishFacts: Record<string, string[]> = {
    Carbonara: ["Carbonara Day is celebrated every April 6th with millions of posts worldwide.", "The earliest printed recipe appeared only in the 1950s — young for such an icon.", "Roman purists insist on guanciale, never pancetta or bacon.", "Cream has never been part of the traditional Roman recipe."],
    "Margherita Pizza": ["Neapolitan pizza-making is inscribed by UNESCO as intangible cultural heritage.", "Its colours — tomato, mozzarella, basil — mirror the Italian flag.", "True Neapolitan pizza must bake in about 60–90 seconds in a wood oven.", "The Associazione Verace Pizza Napoletana certifies pizzerias worldwide."],
    Tiramisu: ["Tiramisu means 'pick me up' — a nod to its espresso kick.", "Treviso and Friuli both claim its invention, a dispute still argued today.", "It only became world-famous in the 1980s — a modern classic.", "The original contained no alcohol at all."],
    "Bistecca alla Fiorentina": ["A true fiorentina comes from the giant white Chianina breed.", "It is always served rare — asking for well-done is heresy in Florence.", "The cut must include the bone, at least three fingers thick.", "It is grilled over chestnut or oak embers, never gas."],
  };
  if (dishFacts[name]) return dishFacts[name];
  const catFacts: Record<DishCategory, string[]> = {
    Pasta: ["Italians eat over 23 kg of pasta per person each year — a world record.", "The starchy cooking water is called 'liquid gold' by Italian cooks."],
    Pizza: ["Naples has defended its pizza tradition since the 18th century.", "A pizzaiolo's apprenticeship traditionally lasts years before touching dough alone."],
    Desserts: ["Italian pastry guards its regional borders fiercely — recipes rarely travel unchanged.", "Many southern sweets trace back to Arab sugar-craft of the 9th century."],
    Seafood: ["Italian law names the daily catch on menus — freshness is regulated, not implied.", "Coastal kitchens cook seafood within hours of landing."],
    Vegetarian: ["Cucina povera — 'poor cooking' — built many of Italy's greatest vegetable dishes.", "Italian markets still organise entirely around what was picked that morning."],
    "Fine Dining": ["Italy holds one of the highest Michelin-star counts in Europe.", "Modern Italian fine dining still begins from nonna's recipe book."],
    "Main Course": ["Italian butchery names dozens of cuts unknown outside the country.", "Sunday lunch remains the sacred home of the Italian secondo."],
    "Street Food": ["Italian street food predates the Roman Empire — Pompeii had snack bars.", "Fried food stalls, friggitorie, are protected fixtures of southern cities."],
    Antipasti: ["The antipasto exists 'before the meal' — pacing is everything at an Italian table.", "Cured meats and cheeses carry protected-origin status across Italy."],
  };
  return [
    `${name} is closely tied to ${city?.name}, where locals treat the recipe as a matter of identity.`,
    ...catFacts[cat],
    `${city?.region} cooking prizes ${["seasonality", "simplicity", "tradition", "local produce"][i % 4]} above all — this dish is proof.`,
  ];
}

export const DISHES: Dish[] = DISH_SEED.map(([name, cityId, category, veg, desc], i) => {
  const t = timesFor(category, i);
  return {
    id: "d-" + name.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, ""),
    name, cityId, category, vegetarian: veg, description: desc,
    rating: Math.round((4.4 + ((i * 37) % 6) / 10) * 10) / 10,
    image: img(i + 3, 800, 600),
    history: `${name} is woven into the food history of ${CITIES.find((c) => c.id === cityId)?.name}. Generations of cooks have guarded its method, and it remains a point of local pride and gentle rivalry between kitchens.`,
    ingredients: ingredientsFor(name, category),
    steps: stepsFor(name, category),
    difficulty: difficultyFor(name, category),
    prepMinutes: t.prep, cookMinutes: t.cook,
    servings: 2 + ((i * 3) % 4),
    nutrition: nutritionFor(category, i),
    allergens: allergensFor(name, category, veg),
    wine: wineFor(name, category, cityId),
    funFacts: funFactsFor(name, category, cityId, i),
  };
});

/* ── Restaurants (15) ────────────────────────────────────────────── */
type RSeed = [name: string, cityId: string, cuisine: string, rating: number, price: 1|2|3|4, mich: 0|1|2|3, fine: boolean, sig: string[], blurb: string];
const REST_SEED: RSeed[] = [
  ["Osteria Francescana", "bologna", "Fine Dining", 4.9, 4, 3, true, ["Tagliatelle al Ragù", "Tortellini in Brodo"], "Massimo Bottura's three-Michelin-star temple where tradition meets the avant-garde."],
  ["Da Enzo al 29", "rome", "Roman Trattoria", 4.8, 2, 0, false, ["Carbonara", "Cacio e Pepe", "Amatriciana"], "A tiny Trastevere trattoria beloved for uncompromising Roman classics."],
  ["Roscioli", "rome", "Roman", 4.7, 3, 0, false, ["Carbonara", "Gricia"], "Deli, wine bar and restaurant rolled into one Roman institution."],
  ["La Pergola", "rome", "Fine Dining", 4.9, 4, 3, true, ["Saltimbocca"], "Rome's rooftop three-star, all crystal and Mediterranean elegance."],
  ["Armando al Pantheon", "rome", "Roman Trattoria", 4.6, 2, 0, false, ["Amatriciana", "Supplì"], "A family-run classic steps from the Pantheon since 1961."],
  ["L'Antica Pizzeria da Michele", "naples", "Pizza", 4.7, 1, 0, false, ["Margherita Pizza", "Marinara Pizza"], "The purist Naples pizzeria that serves only two pizzas — perfectly."],
  ["Pizzeria Gino Sorbillo", "naples", "Pizza", 4.6, 1, 0, false, ["Margherita Pizza"], "A Neapolitan pizza dynasty on the famous Via dei Tribunali."],
  ["Ratanà", "milan", "Lombard", 4.5, 3, 0, false, ["Risotto alla Milanese", "Osso Buco"], "Seasonal Milanese cooking in a leafy garden setting."],
  ["Trattoria del Nuovo Macello", "milan", "Milanese", 4.6, 3, 1, false, ["Cotoletta alla Milanese"], "A Michelin-starred trattoria championing old Milan."],
  ["Trattoria Mario", "florence", "Tuscan", 4.8, 2, 0, false, ["Bistecca alla Fiorentina", "Ribollita"], "Lunch-only Florentine institution famous for its bistecca."],
  ["Enoteca Pinchiorri", "florence", "Fine Dining", 4.9, 4, 3, true, ["Gelato Artigianale"], "One of Italy's grandest cellars and three-star kitchens."],
  ["Osteria alle Testiere", "venice", "Seafood", 4.7, 3, 0, false, ["Spaghetti alle Vongole", "Fritto Misto"], "A minuscule Venetian seafood room with big flavours."],
  ["Del Cambio", "turin", "Piedmontese", 4.7, 4, 1, true, ["Agnolotti del Plin", "Vitello Tonnato"], "An 18th-century Turin salon reborn as a starred restaurant."],
  ["Ferro Palermo", "palermo", "Sicilian", 4.5, 2, 0, false, ["Pasta alla Norma", "Caponata", "Cannoli"], "Modern Palermo cooking rooted in market-fresh Sicilian produce."],
  ["Il Ristorante da Nino", "bari", "Pugliese", 4.6, 2, 0, false, ["Orecchiette alle Cime di Rapa", "Burrata"], "Seaside Puglia cooking with hand-shaped orecchiette."],
];
const REVIEW_POOL = [
  { name: "Giulia R.", rating: 5, text: "Faultless from the first bite to the last. This is what Italian cooking should be." },
  { name: "Marco T.", rating: 5, text: "We travelled for this and it exceeded every expectation. Book ahead." },
  { name: "Sofia L.", rating: 4, text: "Wonderful food and warm service — a table we'll return to." },
  { name: "Luca P.", rating: 5, text: "Every plate told a story. Genuinely one of the best meals of my life." },
];
const CHEF_POOL: { name: string; title: string; bio: string }[] = [
  { name: "Elena Marchetti", title: "Head Chef", bio: "Trained in her grandmother's kitchen before staging across Emilia — she believes memory is the best seasoning." },
  { name: "Paolo Ferrero", title: "Executive Chef", bio: "A Piedmont native obsessed with fire and seasonality, known for tasting menus that read like family history." },
  { name: "Giulia Santoro", title: "Chef Patron", bio: "Left a Milan law career to cook — her tasting counter now books out a month ahead." },
  { name: "Antonio Greco", title: "Head Chef", bio: "Grew up between his family's fishing boats and the market stalls; the day's catch decides everything." },
  { name: "Francesca Vitale", title: "Pastry & Head Chef", bio: "A sweet-first chef whose savoury menu grew out of the pastry section — precision is the house style." },
];
const STREET_POOL = ["Via dei Sapori", "Vicolo del Forno", "Corso del Mercato", "Via delle Erbe", "Piazza della Cucina"];
export const RESTAURANTS: Restaurant[] = REST_SEED.map(([name, cityId, cuisine, rating, price, michelin, fineDining, signatureDishes, blurb], i) => ({
  id: "r-" + name.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, ""),
  name, cityId, cuisine, rating, price, michelin, fineDining, blurb,
  openNow: i % 3 !== 0,
  vegetarian: cuisine !== "Seafood" && cuisine !== "Pizza",
  signatureDishes,
  image: img(i, 800, 600),
  story: `${name} grew out of a simple conviction: that ${CITIES.find((c) => c.id === cityId)?.name}'s food deserves to be cooked with respect. What began modestly has become a destination, without ever losing the warmth of a family table.`,
  gallery: [img(i, 600, 450), img(i + 2, 600, 450), img(i + 4, 600, 450), img(i + 6, 600, 450)],
  reviews: [REVIEW_POOL[i % 4], REVIEW_POOL[(i + 1) % 4], REVIEW_POOL[(i + 2) % 4]],
  hours: [
    { days: "Tue – Fri", time: i % 2 === 0 ? "12:30 – 14:30 · 19:30 – 23:00" : "12:00 – 15:00 · 19:00 – 22:30" },
    { days: "Sat – Sun", time: i % 3 === 0 ? "12:30 – 15:30 · 19:30 – 23:30" : "12:00 – 23:00" },
    { days: "Monday", time: "Closed" },
  ],
  chef: CHEF_POOL[i % CHEF_POOL.length],
  address: `${STREET_POOL[i % STREET_POOL.length]} ${7 + ((i * 9) % 90)}, ${CITIES.find((c) => c.id === cityId)?.name}`,
}));

/* ── Stories (20) ────────────────────────────────────────────────── */
type SSeed = [title: string, cat: Story["category"], read: string, excerpt: string];
const STORY_SEED: SSeed[] = [
  ["Why Carbonara Has No Cream", "Article", "6 min read", "The Roman classic that sparks endless debate — and the four ingredients that are truly non-negotiable."],
  ["The Art of Handmade Pasta", "Article", "8 min read", "Inside the workshops of Bologna's last sfogline, where flour and eggs become tortellini by hand."],
  ["The History of Carbonara", "Article", "7 min read", "From wartime rations to Roman icon — tracing the murky origins of the world's most argued-about pasta."],
  ["Traditional Roman Carbonara", "Article", "5 min read", "A step-by-step look at how Rome's trattorie build carbonara without ever breaking the egg."],
  ["A Day at the Truffle Market", "Video", "8 min watch", "We follow a third-generation hunter and his dog through the misty hills of Alba at dawn."],
  ["How Italian Chefs Make Carbonara", "Video", "6 min watch", "Three Roman chefs, three subtly different techniques, one sacred sauce."],
  ["Italy's 2026 Michelin Stars Revealed", "News", "4 min read", "Eleven new restaurants enter the guide this year, with two fresh three-star addresses in the north."],
  ["The Sfogline of Emilia-Romagna", "Article", "9 min read", "The women keeping hand-rolled pasta alive in Italy's richest food region."],
  ["Naples and the Soul of Pizza", "Article", "7 min read", "Why the margherita is protected like a monument — and how the city guards it."],
  ["Sicily's Sweet Obsession", "Article", "6 min read", "Cannoli, cassata and the Arab roots of the island's desserts."],
  ["Inside a Michelin Three-Star Kitchen", "Video", "12 min watch", "A rare look behind the pass at one of Italy's most celebrated restaurants."],
  ["The Return of Ancient Grains", "Article", "8 min read", "How Italian farmers are reviving forgotten wheats for pasta and bread."],
  ["Aperitivo Hour in Milan", "Fun", "4 min read", "A neighbourhood guide to the city's best negronis and free-flowing snacks."],
  ["The Great Ragù Debate", "Fun", "5 min read", "Nonnas across Emilia disagree about everything — except that yours is wrong."],
  ["Fishing the Venetian Lagoon", "Video", "9 min watch", "Dawn with the last small-boat fishermen supplying Venice's cicchetti bars."],
  ["Olive Oil: Liquid Gold of Puglia", "Article", "7 min read", "Harvest season in the south, where ancient trees still feed the country."],
  ["Gelato, Properly Understood", "Article", "5 min read", "What separates true artisan gelato from the tourist-trap swirls."],
  ["Turin's Chocolate Legacy", "Fun", "6 min read", "Gianduja, bicerin and the sweet side of the Piedmont capital."],
  ["New Openings to Watch in Rome", "News", "3 min read", "Five fresh tables changing the Roman dining scene this season."],
  ["The Slow Food Movement at 40", "News", "6 min read", "How a protest in a Roman piazza grew into a global philosophy."],
];
export const STORIES: Story[] = STORY_SEED.map(([title, category, readTime, excerpt], i) => ({
  id: "s-" + i,
  title, category, readTime, excerpt,
  image: img(i + 5, 800, 600),
  date: `Jun ${((i * 3) % 27) + 1}, 2026`,
  dishId: DISHES[i % DISHES.length]?.id,
  cityId: CITIES[i % CITIES.length]?.id,
}));

/* ── Videos (10) ─────────────────────────────────────────────────── */
const VIDEO_SEED: [string, string][] = [
  ["How Italian Chefs Make Carbonara", "5:48"],
  ["Traditional Carbonara Recipe", "7:12"],
  ["A Day at the Truffle Market", "8:03"],
  ["Making Margherita in Naples", "6:20"],
  ["Hand-Folding Tortellini", "4:55"],
  ["The Perfect Roman Cacio e Pepe", "5:30"],
  ["Fishing the Venetian Lagoon", "9:14"],
  ["Sicilian Cannoli from Scratch", "6:41"],
  ["Inside a Three-Star Kitchen", "12:07"],
  ["Pesto the Ligurian Way", "5:02"],
];
export const VIDEOS: Video[] = VIDEO_SEED.map(([title, duration], i) => ({
  id: "v-" + i, title, duration, thumb: img(i + 6, 800, 500), channel: "CIBISWEB Studios",
  dishId: DISHES[i % DISHES.length]?.id,
}));

/* ── News (20) ───────────────────────────────────────────────────── */
const NEWS_SEED: [string, string][] = [
  ["Italy's 2026 Michelin Stars Revealed", "Awards"],
  ["Naples Pizza Wins UNESCO Renewal", "Culture"],
  ["Record Truffle Sold at Alba Auction", "Markets"],
  ["Rome Cracks Down on 'Fake' Carbonara", "Culture"],
  ["New High-Speed Line Links Food Cities", "Travel"],
  ["Puglia Olive Harvest Best in a Decade", "Agriculture"],
  ["Gelato Prices Rise as Vanilla Soars", "Markets"],
  ["Bologna Names Official Ragù Recipe", "Culture"],
  ["Sicilian Wine Exports Hit New High", "Markets"],
  ["Young Chefs Reviving Village Osterie", "Culture"],
  ["Venice Limits Cruise-Day Restaurants", "Travel"],
  ["Parmigiano Turns 900 Years Old", "Culture"],
  ["Milan Aperitivo Scene Goes Alcohol-Free", "Trends"],
  ["Slow Food Opens New Roman HQ", "Culture"],
  ["Tuscany Protects Ancient Bread Recipe", "Culture"],
  ["Two New Three-Star Tables in the North", "Awards"],
  ["Guanciale Shortage Worries Roman Cooks", "Markets"],
  ["Naples Street Food Festival Returns", "Events"],
  ["Female Sfogline Win Heritage Status", "Culture"],
  ["Turin Chocolate Week Breaks Records", "Events"],
];
export const NEWS: News[] = NEWS_SEED.map(([title, tag], i) => ({
  id: "n-" + i, title, tag,
  date: `Jun ${((i * 4) % 27) + 1}, 2026`,
  image: img(i + 1, 800, 600),
  excerpt: "Our newsroom rounds up what it means for cooks, restaurants and eaters across the country this season.",
}));

/* ── Lookup helpers ─────────────────────────────────────────────── */
export const cityById = (id?: string) => CITIES.find((c) => c.id === id);
export const dishById = (id?: string) => DISHES.find((d) => d.id === id);
export const restaurantById = (id?: string) => RESTAURANTS.find((r) => r.id === id);
export const dishByName = (name: string) => DISHES.find((d) => d.name.toLowerCase() === name.toLowerCase());
export const restaurantByName = (name: string) => RESTAURANTS.find((r) => r.name.toLowerCase() === name.toLowerCase());
export const cityByName = (name: string) => CITIES.find((c) => c.name.toLowerCase() === name.toLowerCase());

export const POPULAR_CATEGORIES: DishCategory[] = ["Pizza", "Pasta", "Desserts", "Seafood", "Vegetarian", "Fine Dining"];

/* ── City extras: festivals, hidden gems, markets ───────────────── */
export type CityExtra = {
  festivals: { name: string; month: string; desc: string }[];
  hiddenGems: { name: string; desc: string }[];
  markets: { name: string; desc: string }[];
};
export const CITY_EXTRA: Record<string, CityExtra> = {
  rome: {
    festivals: [
      { name: "Festa de' Noantri", month: "July", desc: "Trastevere's street festival, where trattorie spill onto the cobbles for a week." },
      { name: "Carbonara Day", month: "April", desc: "The city's unofficial holiday of eggs, pecorino and guanciale." },
    ],
    hiddenGems: [
      { name: "Testaccio's old slaughterhouse quarter", desc: "Where Rome's offal-based quinto quarto cooking was born — still the city's most honest food district." },
      { name: "Jewish Ghetto fry shops", desc: "Home of carciofi alla giudia, artichokes fried to a crisp golden flower." },
    ],
    markets: [{ name: "Mercato di Testaccio", desc: "A covered market where butchers, bakers and street-food counters share one roof." }],
  },
  naples: {
    festivals: [
      { name: "Pizza Village", month: "June", desc: "A seafront week where the city's pizzaioli bake thousands of margheritas nightly." },
      { name: "Festa di San Gennaro", month: "September", desc: "The patron saint's feast, with sfogliatelle and street stalls across the centro storico." },
    ],
    hiddenGems: [
      { name: "Rione Sanità bakeries", desc: "The neighbourhood beneath the hill hides Naples' best fried pizza and taralli." },
      { name: "Port'Alba book-and-pizza alley", desc: "The claimed birthplace of the takeaway pizza, still lined with ovens." },
    ],
    markets: [{ name: "Mercato di Porta Nolana", desc: "A raucous fish market where the day starts before dawn." }],
  },
  milan: {
    festivals: [
      { name: "Milano Food Week", month: "May", desc: "A city-wide celebration of Lombard cooking, from risotto to modern tasting menus." },
      { name: "Oh Bej! Oh Bej!", month: "December", desc: "The winter fair where roasted chestnuts and mulled wine take over the streets." },
    ],
    hiddenGems: [
      { name: "Navigli aperitivo canals", desc: "Golden-hour negronis and free-flowing snacks along the waterways." },
      { name: "Historic panettone pasticcerie", desc: "Family bakeries that still candy their own orange peel." },
    ],
    markets: [{ name: "Mercato Centrale Milano", desc: "Artisan counters inside the station — a modern take on the market hall." }],
  },
  florence: {
    festivals: [
      { name: "Festa della Rificolona", month: "September", desc: "Paper lanterns and food stalls fill the piazzas for the harvest feast." },
      { name: "Gelato Festival", month: "April", desc: "The city that claims gelato's invention holds a spring-long tasting." },
    ],
    hiddenGems: [
      { name: "Lampredotto carts", desc: "Florence's beloved tripe sandwich, eaten standing with salsa verde." },
      { name: "Oltrarno wine windows", desc: "Renaissance-era buchette del vino, reopened to pour glasses through the wall." },
    ],
    markets: [{ name: "Mercato Centrale Firenze", desc: "Two floors of Tuscan produce under a 19th-century iron roof." }],
  },
  bologna: {
    festivals: [
      { name: "Mortadella Please", month: "October", desc: "A pink-tinted weekend devoted entirely to Bologna's silkiest cured meat." },
      { name: "Tortellino Day", month: "October", desc: "Sfogline fold tortellini in the piazza while the city watches." },
    ],
    hiddenGems: [
      { name: "Quadrilatero alleys", desc: "The medieval market grid where fresh pasta shops outnumber cafés." },
      { name: "Osterie with no menu", desc: "Wine-first taverns serving whatever the kitchen folded that morning." },
    ],
    markets: [{ name: "Mercato di Mezzo", desc: "Bologna's oldest covered market, reborn as a grazing hall." }],
  },
  venice: {
    festivals: [
      { name: "Festa del Redentore", month: "July", desc: "Fireworks over the lagoon with tables of seafood set along the water." },
      { name: "Carnevale", month: "February", desc: "Masked crowds warm up on frittelle and galani from every pasticceria." },
    ],
    hiddenGems: [
      { name: "Bàcari crawl in Cannaregio", desc: "Standing-room cicchetti bars pouring ombre of house wine." },
      { name: "Burano's fish osterie", desc: "A rainbow island where risotto de gò was born." },
    ],
    markets: [{ name: "Rialto Mercato", desc: "A thousand years of fish trading beside the Grand Canal." }],
  },
  turin: {
    festivals: [
      { name: "Terra Madre / Salone del Gusto", month: "September", desc: "Slow Food's world fair, drawing producers from every continent." },
      { name: "CioccolaTò", month: "November", desc: "Ten days of gianduja, pralines and bicerin across the baroque centre." },
    ],
    hiddenGems: [
      { name: "Historic caffès of Piazza San Carlo", desc: "Marble counters that have served bicerin since the 1800s." },
      { name: "Vermouth cellars", desc: "The birthplace of vermouth still blends botanicals behind unmarked doors." },
    ],
    markets: [{ name: "Porta Palazzo", desc: "Europe's largest open-air market, a daily theatre of Piedmont produce." }],
  },
  palermo: {
    festivals: [
      { name: "Festino di Santa Rosalia", month: "July", desc: "The patron saint's night, when the city dines on babbaluci and watermelon in the streets." },
      { name: "Sfincione Fest", month: "December", desc: "A celebration of Palermo's thick, onion-sweet street pizza." },
    ],
    hiddenGems: [
      { name: "Friggitorie of the Kalsa", desc: "Panelle and crocchè fried the same way for a century." },
      { name: "Antica Focacceria quarter", desc: "Where pani ca' meusa — the spleen sandwich — divides visitors and unites locals." },
    ],
    markets: [{ name: "Ballarò", desc: "Palermo's oldest souk-like market, all shouted prices and sizzling stalls." }],
  },
  genoa: {
    festivals: [
      { name: "Slow Fish", month: "May", desc: "The port fills with sustainable-fishing stalls and fritto misto cones." },
      { name: "Pesto World Championship", month: "March", desc: "A hundred mortars pound basil in a single hall — by hand only." },
    ],
    hiddenGems: [
      { name: "Sciamadde of the old town", desc: "Wood-fired farinata shops hidden in the caruggi alleys." },
      { name: "Boccadasse fishing cove", desc: "A pastel village inside the city, perfect for seafood at sunset." },
    ],
    markets: [{ name: "Mercato Orientale", desc: "Ligurian herbs, oil and cheese under 19th-century arcades." }],
  },
  bari: {
    festivals: [
      { name: "Festa di San Nicola", month: "May", desc: "The old town celebrates its saint with seafood feasts and processions to the sea." },
      { name: "Orecchiette Festival", month: "August", desc: "Puglia's pasta shaped by hand in doorways across Bari Vecchia." },
    ],
    hiddenGems: [
      { name: "Strada delle Orecchiette", desc: "The famous alley where nonne roll and sell fresh pasta from their front doors." },
      { name: "Raw seafood kiosks at N'derr' a la lanze", desc: "Sea urchins and octopus eaten dockside at sunrise." },
    ],
    markets: [{ name: "Mercato del Pesce", desc: "Bari's harbour fish market, loudest at first light." }],
  },
};
export const cityExtra = (id: string): CityExtra => CITY_EXTRA[id] || CITY_EXTRA.rome;

/* ── Experiences (Hero chips + footer cities reuse city pages) ──── */
export type Experience = {
  label: string; icon: string; tagline: string; intro: string; image: string;
  related: string[];
  match: { categories?: DishCategory[]; cuisineIncludes?: string[]; fineDining?: boolean; michelin?: boolean; vegetarian?: boolean; cityId?: string };
};
export const EXPERIENCES_META: Record<string, Experience> = {
  "Fine Dining": {
    label: "Fine Dining", icon: "utensils", tagline: "Italy at its most precise",
    intro: "Tasting menus, white tablecloths and kitchens where tradition is refined rather than replaced. These are the tables worth planning a trip around.",
    image: img(2, 1400, 700), related: ["Michelin", "Date Night", "Wine & Cheese"],
    match: { fineDining: true, categories: ["Fine Dining", "Main Course"] },
  },
  Pizza: {
    label: "Pizza", icon: "pizza", tagline: "From Naples to the world",
    intro: "Blistered crusts, raging wood ovens and a tradition so protected it has UNESCO status. Here is where pizza is a craft, not fast food.",
    image: img(3, 1400, 700), related: ["Street Food", "Family Friendly", "Vegetarian"],
    match: { categories: ["Pizza"], cuisineIncludes: ["Pizza"] },
  },
  "Date Night": {
    label: "Date Night", icon: "heart", tagline: "Tables built for two",
    intro: "Candlelit rooms, quiet corners and food that gives you something to talk about. Romance, the Italian way — unhurried and generous.",
    image: img(4, 1400, 700), related: ["Fine Dining", "Wine & Cheese", "Michelin"],
    match: { fineDining: true, categories: ["Desserts", "Fine Dining"] },
  },
  Rome: {
    label: "Rome", icon: "map-pin", tagline: "The eternal appetite",
    intro: "Four pastas rule this city — carbonara, cacio e pepe, amatriciana, gricia — and every trattoria has an opinion. Eat your way through the capital.",
    image: img(0, 1400, 700), related: ["Pizza", "Street Food", "Fine Dining"],
    match: { cityId: "rome" },
  },
  "Hidden Cafés": {
    label: "Hidden Cafés", icon: "coffee", tagline: "Where locals linger",
    intro: "Marble counters, hand-pulled espresso and pastries that never travel beyond their neighbourhood. The Italy you find by getting lost.",
    image: img(5, 1400, 700), related: ["Street Food", "Breakfast", "Desserts"],
    match: { categories: ["Desserts", "Antipasti", "Street Food"] },
  },
  Michelin: {
    label: "Michelin", icon: "award", tagline: "The starred circuit",
    intro: "Italy's most decorated kitchens — where regional memory meets world-class technique and every plate has a thesis.",
    image: img(1, 1400, 700), related: ["Fine Dining", "Date Night", "Wine & Cheese"],
    match: { michelin: true },
  },
  Vegetarian: {
    label: "Vegetarian", icon: "leaf", tagline: "The garden of Italy",
    intro: "Cucina povera made vegetables the hero centuries before it was fashionable. Ribollita, caponata, pasta alla Norma — no meat missed.",
    image: img(6, 1400, 700), related: ["Pizza", "Hidden Cafés", "Street Food"],
    match: { vegetarian: true, categories: ["Vegetarian"] },
  },
  "Street Food": {
    label: "Street Food", icon: "utensils", tagline: "Italy, eaten standing",
    intro: "Arancini, supplì, panzerotti, focaccia — the fried, folded and hand-held classics that fuel Italian cities from breakfast to midnight.",
    image: img(7, 1400, 700), related: ["Pizza", "Hidden Cafés", "Family Friendly"],
    match: { categories: ["Street Food", "Antipasti"] },
  },
  Desserts: {
    label: "Desserts", icon: "coffee", tagline: "La dolce vita, literally",
    intro: "Tiramisu, cannoli, sfogliatella, gelato — a nation's sweet tooth, region by region.",
    image: img(2, 1400, 700), related: ["Hidden Cafés", "Date Night", "Breakfast"],
    match: { categories: ["Desserts"] },
  },
  Seafood: {
    label: "Seafood", icon: "map-pin", tagline: "Two seas, one table",
    intro: "From Venetian lagoon cicchetti to Sicilian dockside stalls — Italy's 7,600 km of coastline on a plate.",
    image: img(6, 1400, 700), related: ["Fine Dining", "Street Food", "Vegetarian"],
    match: { categories: ["Seafood"], cuisineIncludes: ["Seafood"] },
  },
};
export const experienceByLabel = (label: string): Experience | undefined =>
  EXPERIENCES_META[label] || Object.values(EXPERIENCES_META).find((e) => e.label.toLowerCase() === label.toLowerCase());
