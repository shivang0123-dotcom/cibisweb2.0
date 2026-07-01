export type MenuCategory =
  | "Starters"
  | "Pasta"
  | "Pizza"
  | "Main Course"
  | "Desserts"
  | "Drinks"
  | "Coffee"
  | "Cocktails";

export type MenuItem = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: MenuCategory;
  image: string;
  tags: string[];
  available: boolean;
  prepMinutes: number;
  recommended?: boolean;
};

export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export const weekdays: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const weekdayLabels: Record<Weekday, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export type WeeklyMenuPlan = Record<Weekday, string[]>;

export type RecipeReview = {
  name: string;
  rating: number;
  text: string;
};

export type RecipeDetails = {
  recommended: boolean;
  highlyReordered: boolean;
  reorderRate: number;
  rating: number;
  reviewCount: number;
  howItsMade: string[];
  reviews: RecipeReview[];
};

export const categories: MenuCategory[] = [
  "Starters",
  "Pasta",
  "Pizza",
  "Main Course",
  "Desserts",
  "Drinks",
  "Coffee",
  "Cocktails",
];

export const menuTabs = ["All", ...categories] as const;

export type MenuTab = (typeof menuTabs)[number];

export const menuItems: MenuItem[] = [
  {
    id: "bruschetta-pomodoro",
    title: "Bruschetta Pomodoro",
    description: "Toasted sourdough, vine tomatoes, basil, garlic, and olive oil.",
    price: 8.9,
    category: "Starters",
    image:
      "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=900&q=80",
    tags: ["tomato", "vegetarian", "starter"],
    available: true,
    prepMinutes: 8,
  },
  {
    id: "burrata-peach",
    title: "Burrata e Pesca",
    description: "Creamy burrata with grilled peach, rocket, pistachio, and aged balsamic.",
    price: 13.5,
    category: "Starters",
    image:
      "https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&w=900&q=80",
    tags: ["burrata", "cheese", "vegetarian"],
    available: true,
    prepMinutes: 10,
  },
  {
    id: "tagliatelle-ragu",
    title: "Tagliatelle al Ragu",
    description: "Fresh egg pasta with slow-cooked beef ragu and Parmigiano Reggiano.",
    price: 16.9,
    category: "Pasta",
    image:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80",
    tags: ["pasta", "beef", "ragu"],
    available: true,
    prepMinutes: 16,
  },
  {
    id: "linguine-gamberi",
    title: "Linguine Gamberi",
    description: "Linguine with prawns, chilli, parsley, lemon zest, and cherry tomatoes.",
    price: 18.4,
    category: "Pasta",
    image:
      "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=900&q=80",
    tags: ["pasta", "seafood", "prawns"],
    available: true,
    prepMinutes: 17,
  },
  {
    id: "pizza-margherita",
    title: "Pizza Margherita",
    description: "San Marzano tomato, fior di latte, basil, and extra virgin olive oil.",
    price: 12.9,
    category: "Pizza",
    image:
      "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=900&q=80",
    tags: ["pizza", "vegetarian", "tomato"],
    available: true,
    prepMinutes: 12,
  },
  {
    id: "pizza-diavola",
    title: "Pizza Diavola",
    description: "Tomato, mozzarella, spicy salame, Calabrian chilli, and oregano.",
    price: 15.2,
    category: "Pizza",
    image:
      "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=900&q=80",
    tags: ["pizza", "salame", "spicy"],
    available: true,
    prepMinutes: 13,
  },
  {
    id: "chicken-pesto-sandwich",
    title: "Chicken Pesto Sandwich",
    description: "Multigrain XL bread with pesto chicken and fresh vegetables.",
    price: 12.9,
    category: "Main Course",
    image:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80",
    tags: ["chicken", "pesto", "sandwich"],
    available: true,
    prepMinutes: 11,
  },
  {
    id: "lamb-ossobuco",
    title: "Lamb Ossobuco",
    description: "Braised lamb shank with saffron risotto, gremolata, and pan jus.",
    price: 27.5,
    category: "Main Course",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80",
    tags: ["lamb", "risotto", "main"],
    available: true,
    prepMinutes: 24,
  },
  {
    id: "tiramisu",
    title: "Classic Tiramisu",
    description: "Mascarpone cream, espresso-soaked savoiardi, cocoa, and dark chocolate.",
    price: 8.5,
    category: "Desserts",
    image:
      "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=900&q=80",
    tags: ["dessert", "coffee", "mascarpone"],
    available: true,
    prepMinutes: 5,
  },
  {
    id: "panna-cotta",
    title: "Vanilla Panna Cotta",
    description: "Silky vanilla cream with berries, citrus syrup, and almond crumble.",
    price: 7.9,
    category: "Desserts",
    image:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80",
    tags: ["dessert", "vanilla", "berries"],
    available: true,
    prepMinutes: 5,
  },
  {
    id: "san-pellegrino",
    title: "San Pellegrino",
    description: "Sparkling mineral water served chilled with lemon.",
    price: 3.9,
    category: "Drinks",
    image:
      "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=900&q=80",
    tags: ["water", "drink", "sparkling"],
    available: true,
    prepMinutes: 2,
  },
  {
    id: "blood-orange-soda",
    title: "Blood Orange Soda",
    description: "Italian aranciata rossa with ice and fresh orange.",
    price: 4.8,
    category: "Drinks",
    image:
      "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=900&q=80",
    tags: ["orange", "soda", "drink"],
    available: true,
    prepMinutes: 3,
  },
  {
    id: "espresso",
    title: "Espresso",
    description: "Short, intense Italian espresso with a rich crema.",
    price: 2.6,
    category: "Coffee",
    image:
      "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=900&q=80",
    tags: ["coffee", "espresso"],
    available: true,
    prepMinutes: 3,
  },
  {
    id: "cappuccino",
    title: "Cappuccino",
    description: "Espresso with steamed milk and fine foam.",
    price: 4.5,
    category: "Coffee",
    image:
      "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=900&q=80",
    tags: ["coffee", "milk", "cappuccino"],
    available: true,
    prepMinutes: 4,
  },
  {
    id: "negroni",
    title: "Negroni",
    description: "Gin, Campari, vermouth rosso, orange peel, and a clear ice cube.",
    price: 11.5,
    category: "Cocktails",
    image:
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=80",
    tags: ["cocktail", "gin", "campari"],
    available: true,
    prepMinutes: 6,
  },
  {
    id: "aperol-spritz",
    title: "Aperol Spritz",
    description: "Aperol, prosecco, soda, orange, and plenty of ice.",
    price: 10.5,
    category: "Cocktails",
    image:
      "https://images.unsplash.com/photo-1560512823-829485b8bf24?auto=format&fit=crop&w=900&q=80",
    tags: ["cocktail", "aperol", "prosecco"],
    available: true,
    prepMinutes: 5,
  },
  {
    id: "arancini-funghi",
    title: "Arancini ai Funghi",
    description: "Crisp risotto spheres with wild mushrooms, mozzarella, and truffle aioli.",
    price: 9.8,
    category: "Starters",
    image:
      "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?auto=format&fit=crop&w=900&q=80",
    tags: ["mushroom", "risotto", "vegetarian"],
    available: true,
    prepMinutes: 9,
  },
  {
    id: "calamari-fritti",
    title: "Calamari Fritti",
    description: "Lightly fried calamari with lemon, parsley, and roasted garlic mayonnaise.",
    price: 12.4,
    category: "Starters",
    image:
      "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=900&q=80",
    tags: ["seafood", "calamari", "fried"],
    available: true,
    prepMinutes: 11,
  },
  {
    id: "gnocchi-sorrentina",
    title: "Gnocchi alla Sorrentina",
    description: "Potato gnocchi baked with tomato, basil, mozzarella, and parmesan.",
    price: 15.6,
    category: "Pasta",
    image:
      "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&w=900&q=80",
    tags: ["pasta", "gnocchi", "vegetarian"],
    available: true,
    prepMinutes: 15,
  },
  {
    id: "ravioli-ricotta",
    title: "Ravioli Ricotta Spinaci",
    description: "Handmade ravioli with ricotta, spinach, sage butter, and toasted walnuts.",
    price: 17.2,
    category: "Pasta",
    image:
      "https://images.unsplash.com/photo-1587740908075-9e245070dfaa?auto=format&fit=crop&w=900&q=80",
    tags: ["pasta", "ravioli", "ricotta"],
    available: true,
    prepMinutes: 16,
  },
  {
    id: "pizza-prosciutto",
    title: "Pizza Prosciutto",
    description: "Mozzarella, Parma ham, rocket, shaved parmesan, and tomato base.",
    price: 17.4,
    category: "Pizza",
    image:
      "https://images.unsplash.com/photo-1571066811602-716837d681de?auto=format&fit=crop&w=900&q=80",
    tags: ["pizza", "prosciutto", "rocket"],
    available: true,
    prepMinutes: 14,
  },
  {
    id: "pizza-quattro-formaggi",
    title: "Pizza Quattro Formaggi",
    description: "Fior di latte, gorgonzola, taleggio, parmesan, and black pepper.",
    price: 16.8,
    category: "Pizza",
    image:
      "https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=900&q=80",
    tags: ["pizza", "cheese", "vegetarian"],
    available: true,
    prepMinutes: 13,
  },
  {
    id: "sea-bass-limone",
    title: "Sea Bass al Limone",
    description: "Pan-roasted sea bass with lemon butter, capers, fennel, and herbs.",
    price: 24.9,
    category: "Main Course",
    image:
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=80",
    tags: ["fish", "sea bass", "lemon"],
    available: true,
    prepMinutes: 20,
  },
  {
    id: "melanzane-parmigiana",
    title: "Melanzane Parmigiana",
    description: "Layered aubergine, tomato, basil, mozzarella, parmesan, and olive oil.",
    price: 18.7,
    category: "Main Course",
    image:
      "https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?auto=format&fit=crop&w=900&q=80",
    tags: ["aubergine", "vegetarian", "main"],
    available: true,
    prepMinutes: 18,
  },
  {
    id: "cannoli-siciliani",
    title: "Cannoli Siciliani",
    description: "Crisp pastry shells with sweet ricotta, pistachio, and orange zest.",
    price: 7.8,
    category: "Desserts",
    image:
      "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=900&q=80",
    tags: ["dessert", "ricotta", "pistachio"],
    available: true,
    prepMinutes: 5,
  },
  {
    id: "gelato-trio",
    title: "Gelato Trio",
    description: "Three scoops of artisan gelato: pistachio, vanilla, and dark chocolate.",
    price: 6.9,
    category: "Desserts",
    image:
      "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=900&q=80",
    tags: ["dessert", "gelato", "ice cream"],
    available: true,
    prepMinutes: 4,
  },
  {
    id: "limonata",
    title: "Sicilian Limonata",
    description: "Sparkling lemon soda with mint, lemon wheel, and crushed ice.",
    price: 4.6,
    category: "Drinks",
    image:
      "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=900&q=80",
    tags: ["lemon", "soda", "drink"],
    available: true,
    prepMinutes: 3,
  },
  {
    id: "iced-tea-peach",
    title: "Peach Iced Tea",
    description: "House-brewed black tea with peach, rosemary, and citrus.",
    price: 4.9,
    category: "Drinks",
    image:
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=80",
    tags: ["tea", "peach", "drink"],
    available: true,
    prepMinutes: 3,
  },
  {
    id: "macchiato",
    title: "Espresso Macchiato",
    description: "Espresso marked with a spoon of steamed milk foam.",
    price: 3.2,
    category: "Coffee",
    image:
      "https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=900&q=80",
    tags: ["coffee", "espresso", "milk"],
    available: true,
    prepMinutes: 3,
  },
  {
    id: "affogato",
    title: "Affogato",
    description: "Vanilla gelato drowned with hot espresso and dark chocolate flakes.",
    price: 6.4,
    category: "Coffee",
    image:
      "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=900&q=80",
    tags: ["coffee", "dessert", "gelato"],
    available: true,
    prepMinutes: 4,
  },
  {
    id: "espresso-martini",
    title: "Espresso Martini",
    description: "Vodka, espresso, coffee liqueur, vanilla, and a silky crema.",
    price: 12.8,
    category: "Cocktails",
    image:
      "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=900&q=80",
    tags: ["cocktail", "coffee", "vodka"],
    available: true,
    prepMinutes: 7,
  },
  {
    id: "bellini",
    title: "Venetian Bellini",
    description: "White peach puree topped with chilled prosecco.",
    price: 10.9,
    category: "Cocktails",
    image:
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80",
    tags: ["cocktail", "peach", "prosecco"],
    available: true,
    prepMinutes: 5,
  },
];

export function getCurrentWeekday(date = new Date()): Weekday {
  const day = date.getDay();
  return weekdays[(day + 6) % 7];
}

export function createDefaultWeeklyPlan(items: MenuItem[] = menuItems): WeeklyMenuPlan {
  const plan: WeeklyMenuPlan = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  };

  items.forEach((item) => {
    weekdays.forEach((day) => {
      plan[day].push(item.id);
    });
  });

  return plan;
}

export function formatEuro(value: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function toCents(value: number) {
  return Math.round(value * 100);
}

export function getMenuItemById(itemId: string, items: MenuItem[] = menuItems) {
  return items.find((item) => item.id === itemId) ?? null;
}

function hashString(value: string) {
  return value.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
}

export function getRecipeDetails(item: MenuItem): RecipeDetails {
  const hash = hashString(item.id);
  const recommended = hash % 3 !== 1;
  const highlyReordered = hash % 4 === 0 || item.tags.includes("pizza") || item.tags.includes("pasta");
  const reorderRate = highlyReordered ? 78 + (hash % 16) : 52 + (hash % 24);
  const rating = Number((4.4 + (hash % 6) / 10).toFixed(1));
  const reviewCount = 38 + (hash % 170);
  const primaryTag = item.tags[0] ?? item.category.toLowerCase();
  const accentTag = item.tags[1] ?? "Italian";

  return {
    recommended,
    highlyReordered,
    reorderRate,
    rating,
    reviewCount,
    howItsMade: [
      `Prepared to order from the ${item.category.toLowerCase()} station with fresh mise en place.`,
      `The kitchen builds the flavour around ${primaryTag} and balances it with ${accentTag}.`,
      `Finished just before service so the texture, aroma, and temperature arrive at the table correctly.`,
    ],
    reviews: [
      {
        name: "Marta",
        rating,
        text: `Beautiful flavour and very consistent. ${item.title} is one of the easiest dishes to reorder.`,
      },
      {
        name: "Luca",
        rating: Math.max(4.2, Number((rating - 0.1).toFixed(1))),
        text: `Arrived fresh, well plated, and exactly as described on the menu.`,
      },
      {
        name: "Sofia",
        rating: Math.min(5, Number((rating + 0.1).toFixed(1))),
        text: `A reliable pick for the table. The portion and timing felt right.`,
      },
    ],
  };
}
