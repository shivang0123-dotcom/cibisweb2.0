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
export type Dish = {
  id: string; name: string; cityId: string; category: DishCategory;
  description: string; rating: number; image: string; vegetarian: boolean;
  history: string; ingredients: string[]; steps: string[];
};
export type Restaurant = {
  id: string; name: string; cityId: string; cuisine: string; rating: number;
  price: 1 | 2 | 3 | 4; image: string; blurb: string; michelin: 0 | 1 | 2 | 3;
  openNow: boolean; vegetarian: boolean; fineDining: boolean;
  signatureDishes: string[]; story: string; gallery: string[];
  reviews: { name: string; rating: number; text: string }[];
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
export const DISHES: Dish[] = DISH_SEED.map(([name, cityId, category, veg, desc], i) => ({
  id: "d-" + name.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, ""),
  name, cityId, category, vegetarian: veg, description: desc,
  rating: Math.round((4.4 + ((i * 37) % 6) / 10) * 10) / 10,
  image: img(i + 3, 800, 600),
  history: `${name} is woven into the food history of ${CITIES.find((c) => c.id === cityId)?.name}. Generations of cooks have guarded its method, and it remains a point of local pride and gentle rivalry between kitchens.`,
  ingredients: ["Durum wheat or fresh pasta", "Extra-virgin olive oil", "Sea salt", "Seasonal regional produce", "Aged local cheese"],
  steps: ["Prepare and measure the core ingredients.", "Build the base slowly over gentle heat.", "Cook the pasta or main element to the right point.", "Combine off the heat so nothing splits.", "Finish, plate and serve immediately."],
}));

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
