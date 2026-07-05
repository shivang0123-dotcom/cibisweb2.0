"use client";

// CIBISWEB — full EN/IT localization layer.
// UI/vocab strings go through L()/useL() keyed by their English text.
// Long-form content is keyed by stable id/name (dish name, restaurant name,
// city id, story title). Template-generated content (history, restaurant
// story, fun facts) is rebuilt in Italian by the localizer helpers.

import { useLang } from "./ui";
import { DISHES, cityById, type Dish, type Restaurant, type City, type Story } from "./data";

type Lang = "EN" | "IT";

/* ── UI + fixed vocabulary (EN → IT) ────────────────────────────── */
const UI: Record<string, string> = {
  // Cities (display names)
  Rome: "Roma", Naples: "Napoli", Milan: "Milano", Florence: "Firenze",
  Bologna: "Bologna", Venice: "Venezia", Turin: "Torino", Palermo: "Palermo",
  Genoa: "Genova", Bari: "Bari", Italy: "Italia", "Across Italy": "In tutta Italia",
  "4.9 Rating": "Valutazione 4.9", "2,400+ reviews": "2.400+ recensioni", "300+ Cities": "300+ Città",
  // Regions
  Lazio: "Lazio", Tuscany: "Toscana", Lombardy: "Lombardia", Campania: "Campania",
  "Emilia-Romagna": "Emilia-Romagna", Veneto: "Veneto", Piedmont: "Piemonte",
  Sicily: "Sicilia", Liguria: "Liguria", Puglia: "Puglia",
  // Categories
  Pizza: "Pizza", Pasta: "Pasta", Desserts: "Dolci", Seafood: "Frutti di Mare",
  Vegetarian: "Vegetariano", "Fine Dining": "Alta Cucina", "Main Course": "Secondi",
  "Street Food": "Cibo di Strada", Antipasti: "Antipasti",
  // Cuisines
  "Roman Trattoria": "Trattoria Romana", Roman: "Romana", Lombard: "Lombarda",
  Milanese: "Milanese", Tuscan: "Toscana", Piedmontese: "Piemontese",
  Sicilian: "Siciliana", Pugliese: "Pugliese", Pasticceria: "Pasticceria",
  Neapolitan: "Napoletana", Osteria: "Osteria", Venetian: "Veneziana", Ligurian: "Ligure",
  // Difficulty
  Easy: "Facile", Medium: "Media", Hard: "Difficile",
  // Wine types
  Red: "Rosso", White: "Bianco", Sparkling: "Spumante", Dessert: "Dolce", None: "Nessuno",
  // Allergens
  Gluten: "Glutine", Egg: "Uova", Milk: "Latte", Nuts: "Frutta a guscio",
  "May contain pork": "Può contenere maiale",
  // Nav / labels
  Restaurants: "Ristoranti", "Food Stories": "Storie", Videos: "Video", News: "Notizie",
  Fun: "Svago", "About Us": "Chi Siamo", Contact: "Contatti", Chefs: "Chef",
  "Popular Cities": "Città Popolari", Information: "Informazioni", Support: "Assistenza",
  Careers: "Lavora con noi", Press: "Stampa", Partners: "Partner", Roadmap: "Roadmap",
  "Help Center": "Centro Assistenza", "Privacy Policy": "Privacy", Terms: "Termini",
  "Download App": "Scarica l'App", "Download on the": "Scarica su", "Get it on": "Disponibile su",
  "All rights reserved.": "Tutti i diritti riservati.",
  "© 2026 CIBISWEB. All rights reserved.": "© 2026 CIBISWEB. Tutti i diritti riservati.",
  "Made with care in Italy 🇮🇹": "Fatto con cura in Italia 🇮🇹",
  "Discover Italy through its food. Restaurants, chefs, stories and the culture behind every plate.":
    "Scopri l'Italia attraverso il suo cibo. Ristoranti, chef, storie e la cultura dietro ogni piatto.",
  // Buttons / common
  Search: "Cerca", "Explore Now": "Esplora Ora", "View Restaurant": "Vedi Ristorante",
  "Read the Story": "Leggi la Storia", Subscribe: "Iscriviti", "View all restaurants": "Vedi tutti i ristoranti",
  "All restaurants": "Tutti i ristoranti", "View all": "Vedi tutti", Explore: "Esplora",
  "Back to homepage": "Torna alla home", "Clear All": "Cancella tutto", "Clear filters": "Cancella filtri",
  "Surprise Me": "Sorprendimi", "Explore Dish": "Scopri il Piatto", Reserve: "Prenota",
  "View Recipe": "Vedi Ricetta", "Where to eat": "Dove mangiarlo", Story: "Storia", Recipe: "Ricetta",
  "Reserve a table": "Prenota un tavolo", "Confirm reservation": "Conferma prenotazione",
  Done: "Fatto", Watch: "Guarda", Discover: "Scopri", Overview: "Panoramica", About: "Chi siamo",
  "Keep exploring": "Continua a esplorare", "Keep reading": "Continua a leggere", "More stories": "Altre storie",
  // Homepage — Featured Partner
  "Featured Partner": "Partner in Evidenza",
  "Massimo Bottura's three-Michelin-star temple in Modena, where tradition and avant-garde meet on every plate. A defining address of modern Italian cuisine.":
    "Il tempio tre stelle Michelin di Massimo Bottura a Modena, dove tradizione e avanguardia si incontrano in ogni piatto. Un indirizzo che ha definito la cucina italiana moderna.",
  Michelin: "Michelin", "Three Stars": "Tre Stelle", Location: "Posizione",
  "Modena, Emilia-Romagna": "Modena, Emilia-Romagna", Reservations: "Prenotazioni",
  "Open · Booking advised": "Aperto · Prenotazione consigliata",
  // Homepage — Top Restaurants
  "Top Restaurants": "Migliori Ristoranti",
  "Trattoria Mario": "Trattoria Mario", "La Pergola": "La Pergola", "L'Antica Pizzeria": "L'Antica Pizzeria",
  "Florence, Tuscany": "Firenze, Toscana", "Rome, Lazio": "Roma, Lazio", "Naples, Campania": "Napoli, Campania",
  // Homepage — Featured Story
  "Featured Story": "Storia in Evidenza", Sponsored: "Sponsorizzato",
  "The Art of Handmade Pasta": "L'Arte della Pasta Fatta a Mano",
  "Inside the workshops of Bologna's last sfogline, where flour, eggs and decades of muscle memory become tortellini folded entirely by hand.":
    "Nei laboratori delle ultime sfogline di Bologna, dove farina, uova e decenni di memoria nelle mani diventano tortellini piegati interamente a mano.",
  // Homepage — Food Stories tabs / badges
  All: "Tutti", Articles: "Articoli", Article: "Articolo", Video: "Video",
  "Why Carbonara Has No Cream": "Perché la Carbonara Non Ha Panna",
  "The Roman classic that sparks endless debate — and the four ingredients that are truly non-negotiable.":
    "Il classico romano che accende infiniti dibattiti — e i quattro ingredienti davvero irrinunciabili.",
  "A Day at the Truffle Market": "Un Giorno al Mercato del Tartufo",
  "We follow a third-generation hunter and his dog through the misty hills of Alba at dawn.":
    "Seguiamo un cercatore di terza generazione e il suo cane tra le colline nebbiose di Alba all'alba.",
  "Italy's 2026 Michelin Stars Revealed": "Svelate le Stelle Michelin 2026 d'Italia",
  "Eleven new restaurants enter the guide this year, with two fresh three-star addresses in the north.":
    "Undici nuovi ristoranti entrano nella guida quest'anno, con due nuovi tre stelle nel nord.",
  // Homepage — Newsletter
  "Love Italian food?": "Ami la cucina italiana?",
  "Get the best restaurant openings, food stories and hidden gems delivered to your inbox every week.":
    "Ricevi le migliori aperture, storie di cibo e gemme nascoste nella tua casella ogni settimana.",
  "Your email address": "Il tuo indirizzo email",
  // Hero panel
  "Recent Searches": "Ricerche Recenti", "No recent searches yet": "Ancora nessuna ricerca recente",
  Trending: "Di Tendenza", "Popular Dishes": "Piatti Popolari",
  "Popular Restaurants": "Ristoranti Popolari", "Popular Categories": "Categorie Popolari",
  "Discover Something New": "Scopri Qualcosa di Nuovo", "Quick Search Tips": "Consigli di Ricerca",
  "Open a random restaurant, dish, story or city.": "Apri un ristorante, piatto, storia o città a caso.",
  "Not sure what to search?": "Non sai cosa cercare?",
  "Explore hand-picked restaurants, dishes and stories.": "Esplora ristoranti, piatti e storie selezionati.",
  "Best Pizza in Naples": "La Migliore Pizza di Napoli", "Michelin Restaurants": "Ristoranti Michelin",
  "Try an ingredient — “guanciale” or “saffron”": "Prova un ingrediente — “guanciale” o “zafferano”",
  "Search a city — “Naples”, “Palermo”, “Turin”": "Cerca una città — “Napoli”, “Palermo”, “Torino”",
  "Or a wine — “Barolo” finds the dishes it pairs with": "O un vino — “Barolo” trova i piatti da abbinare",
  "Search restaurants, dishes or cities...": "Cerca ristoranti, piatti o città...",
  "Close search": "Chiudi ricerca", "Voice search (coming soon)": "Ricerca vocale (in arrivo)",
  "Did you mean": "Forse cercavi", "No matches for": "Nessun risultato per",
  "Try a dish, restaurant or city — or press Enter to search.":
    "Prova un piatto, ristorante o città — oppure premi Invio per cercare.",
  // Search results
  Category: "Categoria", "Search results": "Risultati di ricerca", results: "risultati", result: "risultato",
  Sort: "Ordina", Relevance: "Rilevanza", "Highest rated": "Più votati", "Name A–Z": "Nome A–Z",
  Dishes: "Piatti", Recipes: "Ricette", Stories: "Storie", Cities: "Città",
  "Open Now": "Aperto Ora", "Rating 4.5+": "Voto 4.5+",
  "€€ or less": "€€ o meno", "Under 45 min": "Meno di 45 min",
  "No exact results found": "Nessun risultato esatto trovato",
  "Nothing matched that search or filter combination — but the table is still full. You may like these.":
    "Niente corrisponde a questa ricerca o combinazione di filtri — ma la tavola è ancora piena. Potrebbero piacerti questi.",
  "Trending dishes": "Piatti di tendenza", "Popular restaurants": "Ristoranti popolari",
  "Cities to explore": "Città da esplorare",
  // Cards
  Serves: "Per", "Famous for": "Famosa per", "Quick Summary": "In Breve",
  Restaurant: "Ristorante", "City Guide": "Guida della Città", restaurants: "ristoranti",
  "related stories": "storie correlate", videos: "video", "Signature dishes": "Piatti signature",
  "Served at": "Servito da", more: "altri", min: "min",
  // Dish detail
  Home: "Home", History: "Storia", "Good to know": "Buono a sapersi", Difficulty: "Difficoltà",
  Prep: "Prep", Cook: "Cottura", "How it's made": "Come si prepara", Ingredients: "Ingredienti",
  Method: "Procedimento", "Where it comes from": "Da dove viene", Pairing: "Abbinamento",
  "What to drink": "Cosa bere", "No pairing": "Nessun abbinamento", "wine": "vino",
  "Did you know?": "Lo sapevi?", "Fun facts": "Curiosità", "Nutrition & allergens": "Valori & allergeni",
  "Per serving (approx.)": "Per porzione (circa)", Calories: "Calorie", Protein: "Proteine",
  Carbs: "Carboidrati", Fat: "Grassi", Fiber: "Fibre", Sugar: "Zuccheri", Allergens: "Allergeni",
  "No major allergens in the traditional recipe.": "Nessun allergene rilevante nella ricetta tradizionale.",
  "Always confirm with the kitchen — regional variations can change ingredients.":
    "Conferma sempre con la cucina — le varianti regionali possono cambiare gli ingredienti.",
  "Restaurants serving it": "Ristoranti che lo servono", "Related dishes": "Piatti correlati",
  // Restaurant detail
  "Michelin Stars": "Stelle Michelin", "Plan your visit": "Organizza la visita",
  "Hours, chef & location": "Orari, chef e posizione", "Opening hours": "Orari di apertura",
  "In the kitchen": "In cucina", Menu: "Menu", Gallery: "Galleria", Inside: "Gli interni",
  Reviews: "Recensioni", "What guests say": "Cosa dicono gli ospiti", "Similar restaurants": "Ristoranti simili",
  "Head Chef": "Chef", "Executive Chef": "Executive Chef", "Chef Patron": "Chef Patron",
  "Pastry & Head Chef": "Chef e Pasticcere", Date: "Data", Time: "Ora", Guests: "Ospiti",
  "Demo flow — no real booking is made.": "Flusso dimostrativo — nessuna prenotazione reale.",
  "Table reserved!": "Tavolo prenotato!",
  "A confirmation would arrive by email in the full product.": "Nel prodotto completo arriverebbe una conferma via email.",
  "Closed": "Chiuso", "Open now": "Aperto ora", "Tue – Fri": "Mar – Ven", "Sat – Sun": "Sab – Dom", Monday: "Lunedì",
  // City detail
  "What to eat": "Cosa mangiare", "Signature Dishes": "Piatti Tipici", "Food Culture": "Cultura del Cibo",
  "The local table": "La tavola locale", Festivals: "Feste",
  "When the city eats together": "Quando la città mangia insieme", "Off the beaten path": "Fuori dai sentieri battuti",
  "Hidden gems & local markets": "Gemme nascoste e mercati locali", Market: "Mercato",
  "Nearby Destinations": "Destinazioni Vicine", "More cities to taste": "Altre città da assaggiare",
  // Map section
  "Explore Italy Through Food": "Esplora l'Italia Attraverso il Cibo",
  "Every region tells a different culinary story. Discover restaurants, signature dishes, local traditions and food culture across Italy.":
    "Ogni regione racconta una storia culinaria diversa. Scopri ristoranti, piatti simbolo, tradizioni locali e cultura gastronomica in tutta Italia.",
  "The Map": "La Mappa", "Hover a city to explore": "Passa su una città per esplorare",
  "Select a region on the map": "Seleziona una regione sulla mappa",
  // Restaurant module
  "Add to favourites": "Aggiungi ai preferiti", Saved: "Salvato", "Full menu": "Menu completo",
  "Our menu": "Il nostro menu", Starters: "Antipasti", Drinks: "Bevande",
  Signature: "Simbolo", Vegan: "Vegano", "Photo reviews": "Recensioni con foto",
  "Verified visit": "Visita verificata", "Nearby Attractions": "Attrazioni Vicine",
  "Get directions": "Indicazioni", "min walk": "min a piedi", away: "di distanza",
  "How to find us": "Come trovarci", "Related Restaurants": "Ristoranti Correlati",
  "You might also like": "Potrebbe piacerti anche",
  // Months
  January: "Gennaio", February: "Febbraio", March: "Marzo", April: "Aprile", May: "Maggio",
  June: "Giugno", July: "Luglio", August: "Agosto", September: "Settembre", October: "Ottobre",
  November: "Novembre", December: "Dicembre",
  // Experiences (labels)
  "Date Night": "Cena Romantica", "Hidden Cafés": "Caffè Nascosti", "Wine & Cheese": "Vino e Formaggio",
  "Family Friendly": "Per Famiglie", Breakfast: "Colazione", Experience: "Esperienza",
  "The experience": "L'esperienza", "Where to go": "Dove andare", "Featured restaurants": "Ristoranti in evidenza",
  "What to order": "Cosa ordinare", "Recommended dishes": "Piatti consigliati",
  "Cook it yourself": "Cucinalo tu", "Recipes to try at home": "Ricette da provare a casa",
  Read: "Leggi", "Related experiences": "Esperienze correlate",
  // News tags
  Awards: "Premi", Culture: "Cultura", Markets: "Mercati", Travel: "Viaggi",
  Agriculture: "Agricoltura", Trends: "Tendenze", Events: "Eventi",
  // Article
  "Back to stories": "Torna alle storie", "CIBISWEB Editorial": "Redazione CIBISWEB", article: "articolo",
  video: "video", news: "notizia", story: "storia", Newsroom: "Redazione", "Food news": "Notizie di cibo",
  "All stories": "Tutte le storie",
  // About
  "About CIBISWEB": "Chi è CIBISWEB", Mission: "Missione", Vision: "Visione", Values: "Valori",
  "What drives us": "Cosa ci muove", "Editorial team": "Redazione",
  "The people behind the plates": "Le persone dietro i piatti", "Join the journey": "Unisciti al viaggio",
  "Start exploring": "Inizia a esplorare", "Browse restaurants": "Sfoglia i ristoranti",
  "Read our stories": "Leggi le nostre storie",
  // Contact
  "Say ciao": "Scrivici ciao", Say: "Scrivici", "Write to us": "Scrivici", "Get in touch": "Mettiti in contatto",
  "Your name": "Il tuo nome", "Email address": "Indirizzo email", "Your message…": "Il tuo messaggio…",
  "Send message": "Invia messaggio", "Message sent!": "Messaggio inviato!", Email: "Email", Phone: "Telefono",
  "Coming next": "In arrivo",
  // Dynamic title prefixes & misc
  rating: "voto", "Stories about": "Storie su", "Top restaurants in": "Migliori ristoranti a",
  "Stories from": "Storie da", Why: "Perché",
  "in the heart of the historic centre": "nel cuore del centro storico",
  "in the heart of the lagoon city": "nel cuore della città lagunare",
  // Article body
  "An in-depth look from the CIBISWEB editorial desk.": "Un approfondimento dalla redazione di CIBISWEB.",
  "Across Italy, food is never just food — it is memory, region and rivalry on a plate. In this piece we trace the people, places and traditions behind it, speaking to the cooks who keep it alive and the eaters who can't imagine life without it.":
    "In tutta Italia il cibo non è mai solo cibo — è memoria, territorio e rivalità nel piatto. In questo pezzo ripercorriamo le persone, i luoghi e le tradizioni che lo animano, parlando con i cuochi che lo tengono in vita e con chi non saprebbe farne a meno.",
  "From bustling city markets to quiet family kitchens, the story is the same: respect the ingredients, honour the method, and share generously. That is the spirit CIBISWEB was built to celebrate.":
    "Dai mercati cittadini alle silenziose cucine di famiglia, la storia è la stessa: rispettare gli ingredienti, onorare il metodo e condividere con generosità. È lo spirito che CIBISWEB è nato per celebrare.",
  // About page
  "Italy, explained through": "L'Italia, raccontata attraverso il", food: "cibo",
  "CIBISWEB is a digital food ecosystem — a place where restaurants, dishes, recipes, stories and cities connect into one map of Italian culinary culture.":
    "CIBISWEB è un ecosistema digitale del gusto — un luogo dove ristoranti, piatti, ricette, storie e città si collegano in un'unica mappa della cultura culinaria italiana.",
  "Make Italy's food culture discoverable — every dish, every story, every table — with the depth it deserves.":
    "Rendere scopribile la cultura gastronomica italiana — ogni piatto, ogni storia, ogni tavolo — con la profondità che merita.",
  "Become the way the world explores Italian food: not a directory, but a living atlas of taste.":
    "Diventare il modo in cui il mondo esplora la cucina italiana: non un elenco, ma un atlante vivente del gusto.",
  "Authenticity over hype, regions over clichés, and respect for the people who cook.":
    "Autenticità prima del clamore, territori prima dei cliché, e rispetto per chi cucina.",
  "Editor-in-Chief": "Direttrice", "Head of Video": "Responsabile Video",
  "Restaurant Editor": "Editor Ristoranti", "Recipe Editor": "Editor Ricette",
  "Former food-desk editor who has eaten her way through all twenty regions.":
    "Ex redattrice gastronomica che ha mangiato attraverso tutte e venti le regioni.",
  "Documents Italy's kitchens one slow pan of simmering ragù at a time.":
    "Documenta le cucine d'Italia una lenta inquadratura di ragù alla volta.",
  "Keeps the reviews honest and the reservations impossible to get.":
    "Tiene le recensioni oneste e le prenotazioni impossibili da ottenere.",
  "Tests every recipe three times — once with his nonna watching.":
    "Prova ogni ricetta tre volte — una con la nonna che guarda.",
  // Contact page
  ciao: "ciao",
  "A restaurant to suggest, a story to pitch, or a correction from a proud nonna — we read everything.":
    "Un ristorante da segnalare, una storia da proporre o una correzione da una nonna orgogliosa — leggiamo tutto.",
  "Grazie — the editorial desk will get back to you within two working days.":
    "Grazie — la redazione ti risponderà entro due giorni lavorativi.",
  "Via del Gusto 12": "Via del Gusto 12", "20121 Milano, Italy": "20121 Milano, Italia",
  "Mon–Fri, 9:00–18:00 CET": "Lun–Ven, 9:00–18:00 CET",
  // Reviews (fixed pool)
  "Faultless from the first bite to the last. This is what Italian cooking should be.":
    "Impeccabile dal primo all'ultimo boccone. La cucina italiana dovrebbe essere così.",
  "We travelled for this and it exceeded every expectation. Book ahead.":
    "Abbiamo viaggiato per questo e ha superato ogni aspettativa. Prenotate per tempo.",
  "Wonderful food and warm service — a table we'll return to.":
    "Cibo meraviglioso e servizio caloroso — un tavolo a cui torneremo.",
  "Every plate told a story. Genuinely one of the best meals of my life.":
    "Ogni piatto raccontava una storia. Davvero uno dei pasti migliori della mia vita.",
};

/* ── Content keyed by stable id/name ─────────────────────────────── */
const DISH_DESC_IT: Record<string, string> = {
  "Carbonara": "Pasta romana tradizionale con uova, Pecorino Romano, pepe nero e guanciale.",
  "Cacio e Pepe": "Pasta romana setosa di solo pecorino e pepe nero macinato.",
  "Amatriciana": "Bucatini in salsa di pomodoro, guanciale e pecorino, da Amatrice.",
  "Gricia": "La 'amatriciana bianca' — guanciale e pecorino, senza pomodoro.",
  "Supplì": "Crocchette di riso fritte con un cuore di mozzarella filante.",
  "Saltimbocca": "Vitello con prosciutto e salvia — 'salta in bocca'.",
  "Margherita Pizza": "Pizza cotta a legna con pomodoro, mozzarella e basilico — l'icona napoletana.",
  "Marinara Pizza": "Pomodoro, aglio, origano e olio — la pizza nella sua forma più pura.",
  "Sfogliatella": "Sfoglia a conchiglia con ricotta dolce e canditi.",
  "Baba": "Pan di Spagna imbevuto di rum, un'ossessione dolce napoletana.",
  "Panzerotti": "Mezzelune fritte ripiene di pomodoro e mozzarella.",
  "Risotto alla Milanese": "Risotto dorato allo zafferano mantecato con burro e parmigiano.",
  "Osso Buco": "Stinco di vitello brasato con gremolada sul risotto.",
  "Cotoletta alla Milanese": "Cotoletta di vitello con l'osso, impanata e fritta nel burro.",
  "Bistecca alla Fiorentina": "Imponente costata alla griglia, al sangue, sulla brace.",
  "Ribollita": "Corposa zuppa toscana di pane e fagioli, 'ribollita'.",
  "Pappa al Pomodoro": "Densa zuppa toscana di pomodoro e pane.",
  "Tagliatelle al Ragù": "Nastri all'uovo in un ragù bolognese a lunga cottura.",
  "Tortellini in Brodo": "Pasta ripiena piegata a mano in brodo dorato di cappone.",
  "Lasagne alla Bolognese": "Strati di pasta, ragù e besciamella gratinati.",
  "Mortadella": "Il salume rosa e vellutato di Bologna.",
  "Spaghetti alle Vongole": "Spaghetti con vongole, aglio, vino bianco e prezzemolo.",
  "Fritto Misto": "Frittura leggera di pesce misto della laguna.",
  "Baccalà Mantecato": "Baccalà mantecato su polenta grigliata, un classico cicchetto.",
  "Agnolotti del Plin": "Piccola pasta piemontese pizzicata, ripiena di arrosto.",
  "Bagna Cauda": "Salsa calda di acciughe e aglio per le verdure crude.",
  "Vitello Tonnato": "Fettine fredde di vitello sotto una cremosa salsa tonnata.",
  "Arancini": "Palline di riso fritte e dorate ripiene di ragù o formaggio.",
  "Caponata": "Agrodolce siciliano di melanzane.",
  "Cannoli": "Cialde croccanti riempite di ricotta dolce di pecora.",
  "Pasta alla Norma": "Pasta con melanzane fritte, pomodoro e ricotta salata.",
  "Cassata": "Elaborata torta di pan di Spagna con ricotta e canditi.",
  "Trofie al Pesto": "Pasta ligure ritorta nel pesto di basilico con patate e fagiolini.",
  "Focaccia Genovese": "Focaccia all'olio d'oliva, dorata e saporita.",
  "Orecchiette alle Cime di Rapa": "Pasta a orecchietta con cime di rapa, aglio e peperoncino.",
  "Burrata": "Sacchetto di mozzarella fresca che cola crema.",
  "Tiramisu": "Savoiardi inzuppati nel caffè a strati con mascarpone.",
  "Panna Cotta": "Crema setosa rappresa con frutti di bosco o caramello.",
  "Gelato Artigianale": "Denso gelato italiano prodotto in piccole quantità.",
  "Porchetta": "Maiale arrosto alle erbe a cottura lenta, affettato nei panini.",
  "Carciofi alla Giudia": "Carciofi interi fritti a fiore dorato e croccante — l'orgoglio del Ghetto di Roma.",
  "Carciofi alla Romana": "Carciofi brasati dolcemente con menta, aglio e olio finché si sciolgono.",
  "Trapizzino": "Un cono di pasta da pizza riempito di stufati romani — genio moderno di strada.",
  "Maritozzo": "Un soffice panino dolce tagliato e ricolmo di panna, da colazione.",
  "Coda alla Vaccinara": "Coda di bue brasata per ore con sedano e pomodoro — il re del quinto quarto.",
  "Abbacchio Scottadito": "Costolette d'agnello da latte alla griglia, così calde da 'scottare le dita'.",
  "Pizza al Taglio": "La pizza in teglia rettangolare di Roma, venduta a peso e piegata al volo.",
  "Fiori di Zucca Fritti": "Fiori di zucca ripieni di mozzarella e alici, fritti sottilissimi.",
  "Pasta e Ceci": "Un umile e vellutato tegame di pasta e ceci che i romani amano nelle sere di pioggia.",
  "Pizza Capricciosa": "Prosciutto, carciofi, funghi e olive — la classica combinazione 'capricciosa'.",
  "Pizza Quattro Stagioni": "Quattro stagioni in quattro spicchi: carciofo, prosciutto, funghi e olive.",
  "Pizza Fritta": "Pizza fritta e ripiegata, nata nella Napoli del dopoguerra quando i forni scarseggiavano.",
  "Ragù Napoletano": "Un ragù cotto così a lungo che i napoletani dicono deve 'pippiare' — appena sussurrare.",
  "Pasta alla Genovese": "La grande salsa napoletana di cipolle e manzo — malgrado il nome, del tutto napoletana.",
  "Spaghetti alla Puttanesca": "Olive, capperi, acciughe e pomodoro — decisa, veloce e irresistibile.",
  "Pastiera Napoletana": "La crostata pasquale di ricotta e grano, profumata di fiori d'arancio.",
  "Zeppole di San Giuseppe": "Corone di bignè fritte guarnite di crema per la Festa del Papà.",
  "Cuoppo Napoletano": "Un cono di carta di fritto misto di mare e di terra — Napoli in un pugno.",
  "Frittatina di Pasta": "La pasta di ieri rinata come snack di strada fritto e legato con besciamella.",
  "Parmigiana di Melanzane": "Melanzane fritte a strati con pomodoro e mozzarella, gratinate.",
  "Impepata di Cozze": "Cozze cotte al vapore con poco più che pepe nero e coraggio.",
  "Pizza Bufalina": "La cugina più ricca della margherita, coronata di mozzarella di bufala campana.",
  "Pizza Diavola": "Salame piccante e olio al peperoncino — la pizza del diavolo, gloriosamente sfacciata.",
  "Delizia al Limone": "Una cupola di pan di Spagna e crema al limone nata sulla costiera sorrentina.",
  "Panettone": "L'alto pane natalizio di Milano di canditi e pazienza — 36 ore di lievitazione.",
  "Cassoeula": "Stufato invernale di maiale e verza che pretende un pisolino dopo.",
  "Mondeghili": "Le amate polpette fritte di Milano, nate dagli avanzi della domenica.",
  "Risotto al Salto": "Il risotto allo zafferano di ieri saltato in padella in un disco croccante e dorato.",
  "Minestrone alla Milanese": "Un lento minestrone di verdure e riso, caldo d'inverno e tiepido d'estate.",
  "Pizza Quattro Formaggi": "Quattro formaggi fusi in un unico disco indulgente.",
  "Ossobuco in Gremolata": "Lo stinco di vitello ricco di midollo esaltato dalla gremolada al limone e prezzemolo.",
  "Tortelli di Zucca": "Dolci fagottini di zucca bilanciati da amaretti e burro e salvia.",
  "Crostini Toscani": "Paté di fegatini su pane tostato — così inizia ogni pasto toscano.",
  "Panzanella": "Pane raffermo rinato con pomodori, basilico e aceto — l'estate in una ciotola.",
  "Lampredotto": "Il panino di trippa di Firenze, intinto nel brodo e ravvivato dalla salsa verde.",
  "Trippa alla Fiorentina": "Trippa in umido con pomodoro e parmigiano fino a diventare tenera e sincera.",
  "Cantucci con Vin Santo": "Biscotti di mandorle cotti due volte, fatti per essere inzuppati nell'ambrato Vin Santo.",
  "Schiacciata Fiorentina": "Pane piatto all'olio, tagliato e farcito a ogni angolo di Firenze.",
  "Peposo": "Manzo brasato nel Chianti e pepe in grani dai fornaciai rinascimentali.",
  "Fagioli all'Uccelletto": "Fagioli bianchi cotti con salvia e pomodoro 'come piccoli uccelli'.",
  "Zuccotto": "Una cupola fredda di pan di Spagna, crema e cioccolato che riecheggia la cupola del Brunelleschi.",
  "Pici Cacio e Pepe": "Pici toscani tirati a mano vestiti come il classico romano.",
  "Passatelli in Brodo": "Fili di pane, uovo e parmigiano cotti nel brodo di cappone.",
  "Gramigna alla Salsiccia": "Gramigna ricciuta avvolta in salsiccia sbriciolata e panna.",
  "Cotoletta alla Bolognese": "Vitello impanato gratinato sotto prosciutto e parmigiano — più ricca di quella di Milano.",
  "Tigelle e Crescentine": "Piccoli pani tondi tagliati e farciti di salumi e squacquerone.",
  "Erbazzone": "La torta salata emiliana di erbe e parmigiano in una crosta rustica.",
  "Zuppa Inglese": "Strati di crema e pan di Spagna imbevuto di alchermes — la 'zuppa' che non è una zuppa.",
  "Friggione": "Cipolle e pomodoro sciolti per ore nel più dolce contorno di Bologna.",
  "Tortelloni Burro e Salvia": "Tortelloni ripieni di ricotta lucidi di burro e salvia.",
  "Piadina Romagnola": "La piadina cotta sulla piastra di Romagna, avvolta attorno a prosciutto e stracchino.",
  "Risotto al Nero di Seppia": "Riso tinto di nero corvino dal nero di seppia — drammatico e sapido.",
  "Sarde in Saor": "Sardine in agrodolce con cipolle e uvetta, una conserva da marinai.",
  "Bigoli in Salsa": "Spessi bigoli integrali in una quieta salsa di acciughe e cipolla.",
  "Moleche Fritte": "Granchi di laguna dal guscio molle, fritti interi nella loro breve stagione primaverile.",
  "Risi e Bisi": "I risi e bisi primaverili del Doge, a metà tra risotto e zuppa.",
  "Fegato alla Veneziana": "Fegato di vitello ammorbidito da cipolle lente e un tocco di aceto.",
  "Frittelle Veneziane": "Le fritelle uvetta del Carnevale, fritte a migliaia ogni febbraio.",
  "Cicchetti Misti": "I bocconcini del bàcaro — baccalà mantecato, polpette, ogni marinatura.",
  "Polenta e Schie": "Minuscoli gamberetti grigi di laguna su morbida polenta bianca.",
  "Tajarin al Tartufo": "Nastri dorati a quaranta tuorli sotto una neve di tartufo bianco d'Alba.",
  "Brasato al Barolo": "Manzo arreso a una bottiglia di Barolo in un lungo pomeriggio.",
  "Fritto Misto Piemontese": "L'epico fritto dolce e salato del Piemonte, dalla carne agli amaretti.",
  "Gianduiotto": "Il lingotto di nocciola e cioccolato che ha reso Torino capitale del gianduja.",
  "Bicerin": "Espresso, cioccolato e crema a strati in un bicchiere dal 1763.",
  "Bonet": "Un budino scuro di amaretti e cacao dalle colline delle Langhe.",
  "Carne Cruda all'Albese": "Vitello crudo tagliato a coltello, condito solo con limone, olio e tartufo.",
  "Gnocchi al Castelmagno": "Soffici gnocchi annegati nell'antico formaggio erborinato di montagna del Piemonte.",
  "Agnolotti Gobbi": "I 'gobbi' agnolotti di arrosto di Asti, serviti nel loro sugo.",
  "Panelle": "Frittelle di farina di ceci impilate in soffici panini — il fast food più antico di Palermo.",
  "Crocchè di Patate": "Crocchette di patate con menta e formaggio dalla finestra della friggitoria.",
  "Sfincione": "La spessa e spugnosa pizza di strada di Palermo con cipolle dolci e caciocavallo.",
  "Pani ca Meusa": "Il coraggioso panino con la milza che separa i turisti dai locali.",
  "Busiate al Pesto Trapanese": "Busiate ritorte nel pesto di mandorle, pomodoro e basilico della Sicilia.",
  "Involtini di Pesce Spada": "Involtini di pesce spada ripieni di pangrattato, pinoli e uvetta.",
  "Sarde a Beccafico": "Sardine ripiene arrotolate come gli uccellini che un tempo mangiavano i nobili.",
  "Granita con Brioche": "Granita al limone o alla mandorla con una brioche calda — la colazione siciliana.",
  "Gelo di Melone": "Anguria rappresa in un budino estivo profumato al gelsomino.",
  "Couscous alla Trapanese": "L'eredità araba della Sicilia: cous cous di pesce cotto al vapore su ricco brodo.",
  "Iris Fritta": "Una sfera di brioche fritta che esplode di ricotta dolce e cioccolato.",
  "Pansoti alla Salsa di Noci": "Pansoti alle erbe sotto la cremosa salsa di noci della Liguria.",
  "Farinata": "Frittella di ceci sfrigolata nei forni a legna — mangiata calda dalla teglia.",
  "Cima alla Genovese": "Petto di vitello ripieno, lessato e affettato freddo, un rito domenicale ligure.",
  "Torta Pasqualina": "Trentatré sfoglie sopra bietole, ricotta e uova intere.",
  "Buridda": "Uno stufato del pescatore col pescato del giorno addensato con le noci.",
  "Ciuppin": "La setosa zuppa di pesce frullata salpata verso San Francisco come cioppino.",
  "Pandolce Genovese": "Il basso e denso pane natalizio di Genova con uvetta e pinoli.",
  "Focaccia di Recco": "Due fogli sottilissimi sigillati su crescenza fusa.",
  "Acciughe Ripiene": "Acciughe liguri ripiene, impanate e fritte dalle nonne di ogni casa.",
  "Riso Patate e Cozze": "Il timballo barese di riso, patate e cozze — la tiella del mare.",
  "Spaghetti all'Assassina": "'Spaghetti assassini' bruciacchiati in padella rovente fino a diventare croccanti e irresistibili.",
  "Braciole Baresi": "Involtini di carne di cavallo brasati nel pomodoro fino a farne il ragù della domenica.",
  "Focaccia Barese": "Focaccia dorata coronata di pomodori e olive, mangiata calda a mezzogiorno.",
  "Fave e Cicorie": "Vellutata purea di fave con cicoria selvatica e una cascata d'olio.",
  "Polpo alla Griglia": "Polpo arricciato e grigliato sul porto, tenero sotto la brace.",
  "Sgagliozze": "Quadrotti di polenta fritti venduti negli usci di Bari Vecchia al tramonto.",
  "Cartellate": "Rose natalizie di pasta fritta nastrate di vincotto.",
  "Pasticciotto": "Il caldo pasticcino ripieno di crema della Puglia, ottimo prima delle nove del mattino.",
  "Crudo di Mare": "L'Adriatico crudo: ricci, gamberi rossi e polpo all'alba.",
};

const REST_BLURB_IT: Record<string, string> = {
  "Osteria Francescana": "Il tempio tre stelle Michelin di Massimo Bottura dove la tradizione incontra l'avanguardia.",
  "Da Enzo al 29": "Una minuscola trattoria di Trastevere amata per i suoi intransigenti classici romani.",
  "Roscioli": "Gastronomia, enoteca e ristorante in un'unica istituzione romana.",
  "La Pergola": "Il tre stelle sui tetti di Roma, tutto cristallo ed eleganza mediterranea.",
  "Armando al Pantheon": "Un classico a gestione familiare a due passi dal Pantheon dal 1961.",
  "L'Antica Pizzeria da Michele": "La purista pizzeria di Napoli che serve solo due pizze — alla perfezione.",
  "Pizzeria Gino Sorbillo": "Una dinastia della pizza napoletana sulla celebre Via dei Tribunali.",
  "Ratanà": "Cucina milanese di stagione in un giardino verdeggiante.",
  "Trattoria del Nuovo Macello": "Una trattoria stellata Michelin che difende la vecchia Milano.",
  "Trattoria Mario": "Istituzione fiorentina aperta solo a pranzo, famosa per la sua bistecca.",
  "Enoteca Pinchiorri": "Una delle cantine più grandiose d'Italia e cucina tre stelle.",
  "Osteria alle Testiere": "Una minuscola sala di pesce veneziana dai grandi sapori.",
  "Del Cambio": "Un salotto torinese del Settecento rinato come ristorante stellato.",
  "Ferro Palermo": "Cucina palermitana moderna radicata nei prodotti siciliani freschi di mercato.",
  "Il Ristorante da Nino": "Cucina pugliese di mare con orecchiette fatte a mano.",
  "Pizzarium": "Il tempio della pizza al taglio di Gabriele Bonci — condimenti audaci su impasto perfetto.",
  "Trapizzino Trastevere": "L'invenzione che ha messo gli stufati romani dentro un cono di pizza.",
  "Felice a Testaccio": "La leggenda di Testaccio, dove la cacio e pepe si manteca al tavolo.",
  "Pierluigi": "Pesce a tovaglie bianche su una piazza dorata dal 1938.",
  "Pasticceria Regoli": "Il maritozzo per cui i romani fanno la fila la domenica mattina.",
  "Nonna Betta": "Cucina giudaico-romanesca nel cuore del vecchio Ghetto.",
  "50 Kalò": "L'impasto ad alta idratazione di Ciro Salvo — soffice, digeribile, perfetto.",
  "Concettina ai Tre Santi": "Una pizzeria della Sanità che spinge avanti la tradizione un menù degustazione alla volta.",
  "Mimì alla Ferrovia": "La grande vecchia sala accanto alla stazione, che sfama Napoli dal 1943.",
  "Trattoria da Nennella": "Caotica, chiassosa e amata — l'istituzione dei Quartieri Spagnoli.",
  "Scaturchio": "Sfogliatelle calde dal forno in Piazza San Domenico dal 1905.",
  "Friggitoria Vomero": "Un cono di frittura perfetta passato attraverso una piccola finestra.",
  "Il Luogo di Aimo e Nadia": "Due stelle Michelin di puro culto dell'ingrediente, il grande discreto di Milano.",
  "Piz": "Solo tre pizze, prosecco gratis mentre aspetti — un classico di Milano.",
  "Luini": "La fila dei panzerotti accanto al Duomo che non si accorcia mai.",
  "Trattoria Masuelli San Marco": "Una famiglia, una sala, la tradizione milanese dal 1921.",
  "Pavé": "Pasticceria milanese moderna dove il panettone è una religione tutto l'anno.",
  "Il Latini": "Prosciutti appesi al soffitto e bistecca al chilo.",
  "All'Antico Vinaio": "La fila della schiacciata che gira l'isolato — vale ogni minuto.",
  "La Giostra": "A lume di candela e principesca — fondata letteralmente da un principe asburgico.",
  "Nerbone": "Il banco del lampredotto del Mercato Centrale, in servizio dal 1872.",
  "Vivoli": "La gelateria più antica di Firenze, che serve coni dal 1930.",
  "Sfoglia Rina": "Guarda le sfogline tirare il tuo pranzo in vetrina.",
  "All'Osteria Bottega": "L'osteria che i bolognesi prenotano con settimane di anticipo — vale l'attesa.",
  "Trattoria di Via Serra": "Cucina bolognese slow food in una gemma fuori dal centro.",
  "Berberè": "Pizza a lievito madre servita a spicchi di otto, nata a Bologna.",
  "Cremeria Santo Stefano": "Il gelato più serio di Bologna, mantecato in piccole quantità.",
  "La Piadineria di Strada Maggiore": "Piadine calde piegate al momento sotto i portici.",
  "Antiche Carampane": "Nascosta tra le calli, ostinatamente locale — niente pizza, niente foto sul menù.",
  "Al Covo": "Cucina dalla laguna alla tavola che ha contribuito a definire lo slow food veneziano.",
  "Bacareto da Lele": "Ombre da un euro e piccoli panini sul canale — solo in piedi.",
  "Trattoria alla Madonna": "Un'istituzione di Rialto con camerieri in giacca bianca dal 1954.",
  "Pasticceria Tonolo": "L'amato banco di Dorsoduro — le frittelle di Carnevale valgono l'attraversamento dei ponti.",
  "Consorzio": "Vino naturale e Piemonte dal muso alla coda in una sala vivace.",
  "Tre Galline": "Tre secoli di cucina torinese sotto travi di legno.",
  "Caffè Al Bicerin": "Il banco di marmo del 1763 dove è nato il bicerin.",
  "Porto di Savona": "Tovaglie a quadri e agnolotti in Piazza Vittorio dal 1863.",
  "Gelateria Pepino": "Inventori del pinguino ricoperto di cioccolato, coni dal 1884.",
  "Antica Focacceria San Francesco": "Street food palermitano sotto una facciata di chiesa dal 1834.",
  "Trattoria ai Cascinari": "Una trattoria di quartiere dove il carrello dei dolci decide la tua giornata.",
  "Osteria dei Vespri": "Una sala-cantina stellata che affina la cucina crocevia della Sicilia.",
  "Pasticceria Cappello": "La culla della torta setteveli — il punto di riferimento del cioccolato a Palermo.",
  "Nni Franco u Vastiddaru": "Classici palermitani fritti avvolti nella carta vicino al porto.",
  "Bar Touring": "Granita alla mandorla e brioche calda — l'unica colazione palermitana corretta.",
  "Sa Pesta": "Teglie di farinata a legna che risuonano dal Ottocento.",
  "Trattoria Rosmarino": "Classici liguri slow a due passi da Piazza De Ferrari.",
  "Antica Sciamadda": "Un buco nel muro dei caruggi che tiene viva la tradizione della sciamadda.",
  "Il Marin": "La sala stellata del Porto Antico dove è il pescato a scrivere il menù.",
  "Focacceria Teobaldo": "Focaccia all'olio all'alba, come Genova inizia la giornata.",
  "Al Pescatore": "Il tavolo di pesce sul porto di Bari Vecchia dal 1966.",
  "Panificio Fiore": "La focaccia al forno a legna che profuma la città vecchia a mezzogiorno.",
  "La Uascezze": "Dialetto sui muri e assassina in padella — Bari pura.",
  "Mastro Ciccio": "Panini al polpo e panzerotti di fronte al mare.",
  "Osteria delle Travi": "Sotto vecchie travi di legno, il pranzo pugliese della domenica come dalla nonna, ogni giorno.",
};

const CITY_IT: Record<string, { blurb: string; culture: string }> = {
  rome: { blurb: "La città eterna — patria di carbonara, cacio e pepe e della tradizione delle trattorie romane.", culture: "La cucina romana si fonda sulla cucina povera: pochi ingredienti, grande sapore, pasta e pecorino al centro." },
  naples: { blurb: "La culla della pizza e capitale dello street food sul Golfo di Napoli.", culture: "Napoli ha dato al mondo la pizza margherita. Cotta a legna, gonfia e difesa con fierezza dalla tradizione." },
  milan: { blurb: "La capitale del design italiano, con una cucina lombarda ricca e burrosa.", culture: "Il cibo milanese è dorato e raffinato — risotto allo zafferano, vitello impanato e cultura dell'aperitivo." },
  florence: { blurb: "Città rinascimentale con una tavola toscana rustica e a base di carne.", culture: "La cucina toscana celebra pane, fagioli e la famosa bistecca — semplice, generosa e stagionale." },
  bologna: { blurb: "La Grassa — il cuore indiscusso della pasta in Italia.", culture: "L'Emilia-Romagna è la patria del ragù, della mortadella, del parmigiano e dei tortellini fatti a mano." },
  venice: { blurb: "Città sull'acqua di bàcari e pesce di laguna.", culture: "La cucina veneziana vive del mare e dei cicchetti — piccoli bocconi mangiati in piedi al bàcaro." },
  turin: { blurb: "Elegante capitale piemontese di tartufi, cioccolato e vermouth.", culture: "Il cibo piemontese è aristocratico — tartufi bianchi, agnolotti e manzo brasato a lungo." },
  palermo: { blurb: "Il caotico e assolato regno dello street food della Sicilia.", culture: "La cucina siciliana è un crocevia di sapori arabi, greci e normanni — dolce, fritta e vibrante." },
  genoa: { blurb: "Città portuale ligure e culla del pesto.", culture: "La cucina ligure è verde e profumata — pesto di basilico, focaccia ed erbe della costa." },
  bari: { blurb: "La capitale costiera pugliese delle orecchiette e dell'olio d'oliva.", culture: "Il cibo pugliese è cibo di sole — pasta di grano duro, verdure, pesce e ottimo olio d'oliva." },
};

const STORY_IT: Record<string, { title: string; excerpt: string }> = {
  "Why Carbonara Has No Cream": { title: "Perché la Carbonara Non Ha Panna", excerpt: "Il classico romano che accende infiniti dibattiti — e i quattro ingredienti davvero irrinunciabili." },
  "The Art of Handmade Pasta": { title: "L'Arte della Pasta Fatta a Mano", excerpt: "Nei laboratori delle ultime sfogline di Bologna, dove farina e uova diventano tortellini a mano." },
  "The History of Carbonara": { title: "La Storia della Carbonara", excerpt: "Dalle razioni di guerra a icona romana — le origini incerte della pasta più discussa al mondo." },
  "Traditional Roman Carbonara": { title: "La Carbonara Romana Tradizionale", excerpt: "Passo dopo passo, come le trattorie di Roma preparano la carbonara senza mai stracciare l'uovo." },
  "A Day at the Truffle Market": { title: "Un Giorno al Mercato del Tartufo", excerpt: "Seguiamo un cercatore di terza generazione e il suo cane tra le colline nebbiose di Alba all'alba." },
  "How Italian Chefs Make Carbonara": { title: "Come gli Chef Italiani Fanno la Carbonara", excerpt: "Tre chef romani, tre tecniche leggermente diverse, un'unica salsa sacra." },
  "Italy's 2026 Michelin Stars Revealed": { title: "Svelate le Stelle Michelin 2026 d'Italia", excerpt: "Undici nuovi ristoranti entrano nella guida quest'anno, con due nuovi tre stelle nel nord." },
  "The Sfogline of Emilia-Romagna": { title: "Le Sfogline dell'Emilia-Romagna", excerpt: "Le donne che tengono viva la pasta tirata a mano nella regione più ricca d'Italia." },
  "Naples and the Soul of Pizza": { title: "Napoli e l'Anima della Pizza", excerpt: "Perché la margherita è protetta come un monumento — e come la città la custodisce." },
  "Sicily's Sweet Obsession": { title: "L'Ossessione Dolce della Sicilia", excerpt: "Cannoli, cassata e le radici arabe dei dolci dell'isola." },
  "Inside a Michelin Three-Star Kitchen": { title: "Dentro una Cucina Tre Stelle Michelin", excerpt: "Uno sguardo raro dietro il passe di uno dei ristoranti più celebrati d'Italia." },
  "The Return of Ancient Grains": { title: "Il Ritorno dei Grani Antichi", excerpt: "Come i contadini italiani stanno riportando in vita grani dimenticati per pasta e pane." },
  "Aperitivo Hour in Milan": { title: "L'Ora dell'Aperitivo a Milano", excerpt: "Una guida di quartiere ai migliori negroni della città e agli stuzzichini a volontà." },
  "The Great Ragù Debate": { title: "Il Grande Dibattito sul Ragù", excerpt: "Le nonne di tutta l'Emilia sono in disaccordo su tutto — tranne che il tuo è sbagliato." },
  "Fishing the Venetian Lagoon": { title: "Pescare nella Laguna di Venezia", excerpt: "L'alba con gli ultimi pescatori di piccole barche che riforniscono i bàcari di Venezia." },
  "Olive Oil: Liquid Gold of Puglia": { title: "Olio d'Oliva: l'Oro Liquido della Puglia", excerpt: "La stagione del raccolto al sud, dove alberi antichi nutrono ancora il Paese." },
  "Gelato, Properly Understood": { title: "Il Gelato, Capito Davvero", excerpt: "Cosa distingue il vero gelato artigianale dai vortici acchiappaturisti." },
  "Turin's Chocolate Legacy": { title: "L'Eredità del Cioccolato di Torino", excerpt: "Gianduja, bicerin e il lato dolce della capitale piemontese." },
  "New Openings to Watch in Rome": { title: "Nuove Aperture da Seguire a Roma", excerpt: "Cinque nuove tavole che cambiano la scena gastronomica romana in questa stagione." },
  "The Slow Food Movement at 40": { title: "Il Movimento Slow Food a 40 Anni", excerpt: "Come una protesta in una piazza romana è diventata una filosofia globale." },
};

const VIDEO_IT: Record<string, string> = {
  "How Italian Chefs Make Carbonara": "Come gli Chef Italiani Fanno la Carbonara",
  "Traditional Carbonara Recipe": "La Ricetta Tradizionale della Carbonara",
  "A Day at the Truffle Market": "Un Giorno al Mercato del Tartufo",
  "Making Margherita in Naples": "Fare la Margherita a Napoli",
  "Hand-Folding Tortellini": "Tortellini Piegati a Mano",
  "The Perfect Roman Cacio e Pepe": "La Cacio e Pepe Romana Perfetta",
  "Fishing the Venetian Lagoon": "Pescare nella Laguna di Venezia",
  "Sicilian Cannoli from Scratch": "Cannoli Siciliani da Zero",
  "Inside a Three-Star Kitchen": "Dentro una Cucina Tre Stelle",
  "Pesto the Ligurian Way": "Il Pesto alla Maniera Ligure",
};

const NEWS_IT: Record<string, string> = {
  "Italy's 2026 Michelin Stars Revealed": "Svelate le Stelle Michelin 2026 d'Italia",
  "Naples Pizza Wins UNESCO Renewal": "La Pizza di Napoli Ottiene il Rinnovo UNESCO",
  "Record Truffle Sold at Alba Auction": "Tartufo Record Venduto all'Asta di Alba",
  "Rome Cracks Down on 'Fake' Carbonara": "Roma Contro la Carbonara 'Falsa'",
  "New High-Speed Line Links Food Cities": "Nuova Alta Velocità Collega le Città del Gusto",
  "Puglia Olive Harvest Best in a Decade": "Raccolta di Olive in Puglia, la Migliore in un Decennio",
  "Gelato Prices Rise as Vanilla Soars": "Prezzi del Gelato in Aumento con la Vaniglia alle Stelle",
  "Bologna Names Official Ragù Recipe": "Bologna Ufficializza la Ricetta del Ragù",
  "Sicilian Wine Exports Hit New High": "Le Esportazioni di Vino Siciliano a un Nuovo Record",
  "Young Chefs Reviving Village Osterie": "Giovani Chef Fanno Rivivere le Osterie di Paese",
  "Venice Limits Cruise-Day Restaurants": "Venezia Limita i Ristoranti nei Giorni di Crociera",
  "Parmigiano Turns 900 Years Old": "Il Parmigiano Compie 900 Anni",
  "Milan Aperitivo Scene Goes Alcohol-Free": "L'Aperitivo di Milano Diventa Analcolico",
  "Slow Food Opens New Roman HQ": "Slow Food Apre la Nuova Sede Romana",
  "Tuscany Protects Ancient Bread Recipe": "La Toscana Tutela l'Antica Ricetta del Pane",
  "Two New Three-Star Tables in the North": "Due Nuovi Tre Stelle nel Nord",
  "Guanciale Shortage Worries Roman Cooks": "La Carenza di Guanciale Preoccupa i Cuochi Romani",
  "Naples Street Food Festival Returns": "Torna il Festival dello Street Food di Napoli",
  "Female Sfogline Win Heritage Status": "Le Sfogline Ottengono lo Status di Patrimonio",
  "Turin Chocolate Week Breaks Records": "La Settimana del Cioccolato di Torino Batte Ogni Record",
};
const NEWS_EXCERPT_IT = "La nostra redazione riassume cosa significa per cuochi, ristoranti e buongustai di tutto il Paese in questa stagione.";

const EXP_IT: Record<string, { tagline: string; intro: string }> = {
  "Fine Dining": { tagline: "L'Italia al suo più preciso", intro: "Menù degustazione, tovaglie bianche e cucine dove la tradizione si affina anziché sostituirsi. Sono le tavole per cui vale la pena organizzare un viaggio." },
  Pizza: { tagline: "Da Napoli al mondo", intro: "Cornicioni bruciacchiati, forni a legna roventi e una tradizione così protetta da avere lo status UNESCO. Qui la pizza è un mestiere, non fast food." },
  "Date Night": { tagline: "Tavoli fatti per due", intro: "Sale a lume di candela, angoli tranquilli e cibo che dà qualcosa di cui parlare. Il romanticismo all'italiana — senza fretta e generoso." },
  Rome: { tagline: "L'appetito eterno", intro: "Quattro paste dominano questa città — carbonara, cacio e pepe, amatriciana, gricia — e ogni trattoria ha la sua opinione. Mangia la capitale." },
  "Hidden Cafés": { tagline: "Dove i locali si attardano", intro: "Banchi di marmo, espresso tirato a mano e paste che non escono mai dal quartiere. L'Italia che si trova perdendosi." },
  Michelin: { tagline: "Il circuito delle stelle", intro: "Le cucine più premiate d'Italia — dove la memoria regionale incontra la tecnica di livello mondiale e ogni piatto ha una tesi." },
  Vegetarian: { tagline: "L'orto d'Italia", intro: "La cucina povera ha reso le verdure protagoniste secoli prima che fosse di moda. Ribollita, caponata, pasta alla Norma — nessuna carne rimpianta." },
  "Street Food": { tagline: "L'Italia, mangiata in piedi", intro: "Arancini, supplì, panzerotti, focaccia — i classici fritti, piegati e da mangiare in mano che alimentano le città italiane dall'alba a mezzanotte." },
  Desserts: { tagline: "La dolce vita, letteralmente", intro: "Tiramisù, cannoli, sfogliatella, gelato — la golosità di una nazione, regione per regione." },
  Seafood: { tagline: "Due mari, una tavola", intro: "Dai cicchetti della laguna veneziana alle bancarelle del molo siciliano — i 7.600 km di costa d'Italia in un piatto." },
};

type ExtraItem = { name: string; desc: string; month?: string };
type CityExtraIT = { festivals: ExtraItem[]; hiddenGems: ExtraItem[]; markets: ExtraItem[] };
const EXTRA_IT: Record<string, CityExtraIT> = {
  rome: {
    festivals: [
      { name: "Festa de' Noantri", desc: "La festa di strada di Trastevere, dove le trattorie invadono i vicoli per una settimana." },
      { name: "Carbonara Day", desc: "La festa non ufficiale della città a base di uova, pecorino e guanciale." },
    ],
    hiddenGems: [
      { name: "Il vecchio quartiere del mattatoio a Testaccio", desc: "Dove è nata la cucina del quinto quarto — ancora il quartiere gastronomico più sincero della città." },
      { name: "Le friggitorie del Ghetto ebraico", desc: "Patria dei carciofi alla giudia, fritti a fiore dorato e croccante." },
    ],
    markets: [{ name: "Mercato di Testaccio", desc: "Un mercato coperto dove macellai, fornai e banchi di street food dividono un tetto." }],
  },
  naples: {
    festivals: [
      { name: "Pizza Village", desc: "Una settimana sul lungomare in cui i pizzaioli sfornano ogni sera migliaia di margherite." },
      { name: "Festa di San Gennaro", desc: "La festa del santo patrono, con sfogliatelle e bancarelle nel centro storico." },
    ],
    hiddenGems: [
      { name: "I forni del Rione Sanità", desc: "Il quartiere sotto la collina nasconde la migliore pizza fritta e i taralli di Napoli." },
      { name: "Port'Alba, il vicolo dei libri e della pizza", desc: "La presunta culla della pizza da asporto, ancora costellata di forni." },
    ],
    markets: [{ name: "Mercato di Porta Nolana", desc: "Un chiassoso mercato del pesce dove la giornata inizia prima dell'alba." }],
  },
  milan: {
    festivals: [
      { name: "Milano Food Week", desc: "Una celebrazione cittadina della cucina lombarda, dal risotto ai menù degustazione moderni." },
      { name: "Oh Bej! Oh Bej!", desc: "La fiera invernale dove castagne arrosto e vin brulé conquistano le strade." },
    ],
    hiddenGems: [
      { name: "I Navigli dell'aperitivo", desc: "Negroni all'ora d'oro e stuzzichini a volontà lungo i canali." },
      { name: "Le storiche pasticcerie del panettone", desc: "Botteghe di famiglia che canditano ancora da sé la scorza d'arancia." },
    ],
    markets: [{ name: "Mercato Centrale Milano", desc: "Banchi artigianali dentro la stazione — una rilettura moderna del mercato coperto." }],
  },
  florence: {
    festivals: [
      { name: "Festa della Rificolona", desc: "Lanterne di carta e bancarelle riempiono le piazze per la festa del raccolto." },
      { name: "Gelato Festival", desc: "La città che rivendica l'invenzione del gelato tiene una degustazione primaverile." },
    ],
    hiddenGems: [
      { name: "I carretti del lampredotto", desc: "L'amato panino di trippa di Firenze, mangiato in piedi con la salsa verde." },
      { name: "Le buchette del vino dell'Oltrarno", desc: "Finestrelle rinascimentali riaperte per versare calici attraverso il muro." },
    ],
    markets: [{ name: "Mercato Centrale Firenze", desc: "Due piani di prodotti toscani sotto un tetto di ferro dell'Ottocento." }],
  },
  bologna: {
    festivals: [
      { name: "Mortadella Please", desc: "Un fine settimana tinto di rosa dedicato interamente al salume più vellutato di Bologna." },
      { name: "Il Giorno del Tortellino", desc: "Le sfogline piegano i tortellini in piazza mentre la città guarda." },
    ],
    hiddenGems: [
      { name: "I vicoli del Quadrilatero", desc: "La griglia del mercato medievale dove le botteghe di pasta fresca superano i caffè." },
      { name: "Osterie senza menù", desc: "Taverne dove si beve prima, servendo ciò che la cucina ha piegato quel mattino." },
    ],
    markets: [{ name: "Mercato di Mezzo", desc: "Il più antico mercato coperto di Bologna, rinato come sala per assaggi." }],
  },
  venice: {
    festivals: [
      { name: "Festa del Redentore", desc: "Fuochi d'artificio sulla laguna con tavolate di pesce lungo l'acqua." },
      { name: "Carnevale", desc: "Le folle in maschera si scaldano con frittelle e galani di ogni pasticceria." },
    ],
    hiddenGems: [
      { name: "Giro dei bàcari a Cannaregio", desc: "Bàcari con posti in piedi che versano ombre di vino della casa." },
      { name: "Le osterie di pesce di Burano", desc: "Un'isola arcobaleno dove è nato il risotto de gò." },
    ],
    markets: [{ name: "Mercato di Rialto", desc: "Mille anni di commercio del pesce accanto al Canal Grande." }],
  },
  turin: {
    festivals: [
      { name: "Terra Madre / Salone del Gusto", desc: "La fiera mondiale di Slow Food, che attira produttori da ogni continente." },
      { name: "CioccolaTò", desc: "Dieci giorni di gianduja, praline e bicerin nel centro barocco." },
    ],
    hiddenGems: [
      { name: "I caffè storici di Piazza San Carlo", desc: "Banchi di marmo che servono il bicerin dall'Ottocento." },
      { name: "Le cantine del vermouth", desc: "La culla del vermouth mescola ancora botaniche dietro porte anonime." },
    ],
    markets: [{ name: "Porta Palazzo", desc: "Il più grande mercato all'aperto d'Europa, un teatro quotidiano dei prodotti del Piemonte." }],
  },
  palermo: {
    festivals: [
      { name: "Festino di Santa Rosalia", desc: "La notte della patrona, quando la città cena di babbaluci e anguria per le strade." },
      { name: "Sfincione Fest", desc: "Una celebrazione della spessa pizza di strada di Palermo, dolce di cipolla." },
    ],
    hiddenGems: [
      { name: "Le friggitorie della Kalsa", desc: "Panelle e crocchè fritti allo stesso modo da un secolo." },
      { name: "Il quartiere dell'Antica Focacceria", desc: "Dove il pani ca' meusa — il panino con la milza — divide i turisti e unisce i locali." },
    ],
    markets: [{ name: "Ballarò", desc: "Il mercato più antico di Palermo, tra prezzi gridati e banchi sfrigolanti." }],
  },
  genoa: {
    festivals: [
      { name: "Slow Fish", desc: "Il porto si riempie di banchi di pesca sostenibile e coni di fritto misto." },
      { name: "Campionato Mondiale di Pesto", desc: "Cento mortai pestano il basilico in un'unica sala — solo a mano." },
    ],
    hiddenGems: [
      { name: "Le sciamadde del centro storico", desc: "Botteghe di farinata a legna nascoste nei caruggi." },
      { name: "La cala di pescatori di Boccadasse", desc: "Un borgo pastello dentro la città, perfetto per il pesce al tramonto." },
    ],
    markets: [{ name: "Mercato Orientale", desc: "Erbe, olio e formaggi liguri sotto arcate dell'Ottocento." }],
  },
  bari: {
    festivals: [
      { name: "Festa di San Nicola", desc: "La città vecchia celebra il suo santo con banchetti di pesce e processioni verso il mare." },
      { name: "Festa delle Orecchiette", desc: "La pasta pugliese modellata a mano negli usci di tutta Bari Vecchia." },
    ],
    hiddenGems: [
      { name: "La Strada delle Orecchiette", desc: "Il celebre vicolo dove le nonne stendono e vendono pasta fresca sulla porta di casa." },
      { name: "I chioschi di crudo a N'derr' a la lanze", desc: "Ricci di mare e polpo mangiati sul molo all'alba." },
    ],
    markets: [{ name: "Mercato del Pesce", desc: "Il mercato del pesce del porto di Bari, più chiassoso alle prime luci." }],
  },
};

/* ── Templated / interpolated content ────────────────────────────── */
function cityIt(id: string | undefined, lang: Lang) {
  const c = cityById(id);
  return c ? L(c.name, lang) : "";
}
function regionIt(id: string | undefined, lang: Lang) {
  const c = cityById(id);
  return c ? L(c.region, lang) : "";
}

export function localizeHistory(dish: Dish, lang: Lang): string {
  if (lang === "EN") return dish.history;
  const city = cityIt(dish.cityId, lang);
  return `${dish.name} è intrecciato nella storia gastronomica di ${city}. Generazioni di cuochi ne hanno custodito il metodo, e resta un motivo di orgoglio locale e di garbata rivalità tra le cucine.`;
}

export function localizeRestaurantStory(r: Restaurant, lang: Lang): string {
  if (lang === "EN") return r.story;
  const city = cityIt(r.cityId, lang);
  return `${r.name} è nato da una semplice convinzione: che la cucina di ${city} meriti di essere cucinata con rispetto. Ciò che è iniziato con modestia è diventato una meta, senza mai perdere il calore di una tavola di famiglia.`;
}

const TRAIT_IT: Record<string, string> = {
  seasonality: "la stagionalità", simplicity: "la semplicità",
  tradition: "la tradizione", "local produce": "i prodotti locali",
};
export function localizeFunFacts(dish: Dish, lang: Lang): string[] {
  if (lang === "EN") return dish.funFacts;
  const city = cityIt(dish.cityId, lang);
  const region = regionIt(dish.cityId, lang);
  return dish.funFacts.map((f) => {
    if (UI[f]) return UI[f];
    if (f.includes("is closely tied to"))
      return `${dish.name} è profondamente legato a ${city}, dove la gente del posto tratta la ricetta come una questione di identità.`;
    if (f.includes("cooking prizes")) {
      const trait = Object.keys(TRAIT_IT).find((k) => f.includes(k));
      return `La cucina di ${region} premia soprattutto ${trait ? TRAIT_IT[trait] : "la tradizione"} — e questo piatto ne è la prova.`;
    }
    return f;
  });
}

/* Fun fact fixed strings (dish + category) added to UI so they translate */
Object.assign(UI, {
  // Carbonara
  "Carbonara Day is celebrated every April 6th with millions of posts worldwide.": "Il Carbonara Day si celebra ogni 6 aprile con milioni di post in tutto il mondo.",
  "The earliest printed recipe appeared only in the 1950s — young for such an icon.": "La prima ricetta stampata è apparsa solo negli anni '50 — giovane per un'icona simile.",
  "Roman purists insist on guanciale, never pancetta or bacon.": "I puristi romani insistono sul guanciale, mai pancetta o bacon.",
  "Cream has never been part of the traditional Roman recipe.": "La panna non ha mai fatto parte della ricetta romana tradizionale.",
  // Margherita
  "Neapolitan pizza-making is inscribed by UNESCO as intangible cultural heritage.": "L'arte del pizzaiuolo napoletano è patrimonio culturale immateriale UNESCO.",
  "Its colours — tomato, mozzarella, basil — mirror the Italian flag.": "I suoi colori — pomodoro, mozzarella, basilico — richiamano la bandiera italiana.",
  "True Neapolitan pizza must bake in about 60–90 seconds in a wood oven.": "La vera pizza napoletana cuoce in circa 60–90 secondi nel forno a legna.",
  "The Associazione Verace Pizza Napoletana certifies pizzerias worldwide.": "L'Associazione Verace Pizza Napoletana certifica pizzerie in tutto il mondo.",
  // Tiramisu
  "Tiramisu means 'pick me up' — a nod to its espresso kick.": "Tiramisù significa 'tirami su' — un cenno alla sua carica di espresso.",
  "Treviso and Friuli both claim its invention, a dispute still argued today.": "Treviso e il Friuli ne rivendicano entrambi l'invenzione, una disputa ancora aperta.",
  "It only became world-famous in the 1980s — a modern classic.": "È diventato famoso nel mondo solo negli anni '80 — un classico moderno.",
  "The original contained no alcohol at all.": "L'originale non conteneva alcun alcol.",
  // Bistecca
  "A true fiorentina comes from the giant white Chianina breed.": "Una vera fiorentina viene dalla gigantesca razza bianca Chianina.",
  "It is always served rare — asking for well-done is heresy in Florence.": "Si serve sempre al sangue — chiederla ben cotta è un'eresia a Firenze.",
  "The cut must include the bone, at least three fingers thick.": "Il taglio deve includere l'osso, spesso almeno tre dita.",
  "It is grilled over chestnut or oak embers, never gas.": "Si griglia sulla brace di castagno o quercia, mai a gas.",
  // Category facts
  "Italians eat over 23 kg of pasta per person each year — a world record.": "Gli italiani mangiano oltre 23 kg di pasta a testa l'anno — un record mondiale.",
  "The starchy cooking water is called 'liquid gold' by Italian cooks.": "L'acqua di cottura amidacea è chiamata 'oro liquido' dai cuochi italiani.",
  "Naples has defended its pizza tradition since the 18th century.": "Napoli difende la sua tradizione della pizza dal Settecento.",
  "A pizzaiolo's apprenticeship traditionally lasts years before touching dough alone.": "L'apprendistato di un pizzaiolo dura tradizionalmente anni prima di toccare l'impasto da solo.",
  "Italian pastry guards its regional borders fiercely — recipes rarely travel unchanged.": "La pasticceria italiana difende gelosamente i confini regionali — le ricette raramente viaggiano immutate.",
  "Many southern sweets trace back to Arab sugar-craft of the 9th century.": "Molti dolci del sud risalgono all'arte araba dello zucchero del IX secolo.",
  "Italian law names the daily catch on menus — freshness is regulated, not implied.": "La legge italiana indica il pescato del giorno sui menù — la freschezza è regolata, non sottintesa.",
  "Coastal kitchens cook seafood within hours of landing.": "Le cucine di costa cucinano il pesce a poche ore dallo sbarco.",
  "Cucina povera — 'poor cooking' — built many of Italy's greatest vegetable dishes.": "La cucina povera ha creato molti dei più grandi piatti di verdure d'Italia.",
  "Italian markets still organise entirely around what was picked that morning.": "I mercati italiani si organizzano ancora intorno a ciò che è stato raccolto quel mattino.",
  "Italy holds one of the highest Michelin-star counts in Europe.": "L'Italia ha uno dei più alti numeri di stelle Michelin d'Europa.",
  "Modern Italian fine dining still begins from nonna's recipe book.": "L'alta cucina italiana moderna parte ancora dal ricettario della nonna.",
  "Italian butchery names dozens of cuts unknown outside the country.": "La macelleria italiana nomina decine di tagli sconosciuti fuori dal Paese.",
  "Sunday lunch remains the sacred home of the Italian secondo.": "Il pranzo della domenica resta la casa sacra del secondo italiano.",
  "Italian street food predates the Roman Empire — Pompeii had snack bars.": "Lo street food italiano precede l'Impero Romano — Pompei aveva i suoi chioschi.",
  "Fried food stalls, friggitorie, are protected fixtures of southern cities.": "Le friggitorie sono presìdi protetti delle città del sud.",
  "The antipasto exists 'before the meal' — pacing is everything at an Italian table.": "L'antipasto sta 'prima del pasto' — il ritmo è tutto alla tavola italiana.",
  "Cured meats and cheeses carry protected-origin status across Italy.": "Salumi e formaggi hanno lo status di origine protetta in tutta Italia.",
  // Chef bios
  "Trained in her grandmother's kitchen before staging across Emilia — she believes memory is the best seasoning.": "Formata nella cucina della nonna prima di fare stage in tutta l'Emilia — crede che la memoria sia il miglior condimento.",
  "A Piedmont native obsessed with fire and seasonality, known for tasting menus that read like family history.": "Piemontese di nascita, ossessionato dal fuoco e dalla stagionalità, noto per menù degustazione che si leggono come una storia di famiglia.",
  "Left a Milan law career to cook — her tasting counter now books out a month ahead.": "Ha lasciato una carriera legale a Milano per cucinare — il suo banco degustazione si prenota con un mese d'anticipo.",
  "Grew up between his family's fishing boats and the market stalls; the day's catch decides everything.": "Cresciuto tra le barche da pesca di famiglia e i banchi del mercato; il pescato del giorno decide tutto.",
  "A sweet-first chef whose savoury menu grew out of the pastry section — precision is the house style.": "Una chef nata pasticcera il cui menù salato è cresciuto dalla pasticceria — la precisione è lo stile della casa.",
  // Ingredients (base)
  "400 g pasta or fresh egg dough": "400 g di pasta o sfoglia fresca all'uovo",
  "Extra-virgin olive oil": "Olio extravergine d'oliva", "Sea salt": "Sale marino",
  "Freshly cracked black pepper": "Pepe nero macinato fresco",
  "500 g type-00 flour": "500 g di farina tipo 00", "325 ml water": "325 ml d'acqua",
  "Fresh yeast": "Lievito fresco", "San Marzano tomatoes": "Pomodori San Marzano",
  "Fresh eggs": "Uova fresche", "Caster sugar": "Zucchero semolato",
  "Type-00 flour or savoiardi": "Farina tipo 00 o savoiardi", "Full-fat dairy": "Latticini interi",
  "Fresh catch from the market": "Pescato fresco del mercato", "Garlic": "Aglio",
  "Dry white wine": "Vino bianco secco", "Flat-leaf parsley": "Prezzemolo",
  "Seasonal vegetables": "Verdure di stagione", "Day-old bread or legumes": "Pane raffermo o legumi",
  "Fresh herbs": "Erbe fresche", "Premium seasonal produce": "Prodotti di stagione di prima qualità",
  "Butter": "Burro", "Stock": "Brodo", "Finishing salt": "Sale in scaglie",
  "Quality meat from a trusted butcher": "Carne di qualità da un macellaio di fiducia",
  "Type-00 flour or rice": "Farina tipo 00 o riso", "Mozzarella": "Mozzarella",
  "Neutral oil for frying": "Olio neutro per friggere",
  "The best raw ingredients you can find": "I migliori ingredienti crudi che trovi",
  "Crusty bread": "Pane croccante", "Cracked pepper": "Pepe macinato",
  // Ingredients (extra)
  "150 g guanciale": "150 g di guanciale", "4 egg yolks + 1 whole egg": "4 tuorli + 1 uovo intero",
  "100 g Pecorino Romano": "100 g di Pecorino Romano", "200 g Pecorino Romano": "200 g di Pecorino Romano",
  "Generous black pepper": "Pepe nero abbondante", "Pecorino Romano": "Pecorino Romano",
  "Peeled tomatoes (amatriciana only)": "Pomodori pelati (solo amatriciana)",
  "Fior di latte or garlic & oregano": "Fior di latte o aglio e origano", "Fresh basil": "Basilico fresco",
  "Carnaroli rice": "Riso Carnaroli", "Saffron threads": "Pistilli di zafferano",
  "Beef marrow": "Midollo di manzo", "Parmigiano Reggiano": "Parmigiano Reggiano",
  "1 kg fresh clams": "1 kg di vongole fresche", "Chilli": "Peperoncino",
  "Slow-cooked meat ragù": "Ragù di carne a lunga cottura", "Béchamel (lasagne)": "Besciamella (lasagne)",
  "Pine nuts": "Pinoli", "Parmigiano & pecorino": "Parmigiano e pecorino", "Ligurian olive oil": "Olio d'oliva ligure",
  "Mascarpone": "Mascarpone", "Strong espresso": "Espresso ristretto", "Cocoa powder": "Cacao in polvere",
  "Savoiardi": "Savoiardi", "Sheep's-milk ricotta": "Ricotta di pecora", "Candied fruit": "Frutta candita",
  "Pistachios": "Pistacchi", "1.2 kg T-bone of Chianina beef": "1,2 kg di costata di Chianina",
  "Coarse salt": "Sale grosso", "Rosemary": "Rosmarino", "Cooked risotto rice": "Riso da risotto cotto",
  "Ragù or mozzarella filling": "Ripieno di ragù o mozzarella", "Breadcrumbs": "Pangrattato",
  "Cime di rapa (turnip tops)": "Cime di rapa", "Anchovies": "Acciughe",
  "Butter and oil": "Burro e olio", "Raw seasonal vegetables": "Verdure crude di stagione",
  // Steps (Pasta)
  "Bring a large pot of well-salted water to a rolling boil.": "Porta a bollore una grande pentola d'acqua ben salata.",
  "Prepare the condiment in a wide pan while the pasta cooks.": "Prepara il condimento in una padella larga mentre la pasta cuoce.",
  "Cook the pasta until just under al dente.": "Cuoci la pasta fino a poco prima dell'al dente.",
  "Transfer to the pan with a ladle of starchy water and toss to emulsify.": "Trasferisci in padella con un mestolo di acqua di cottura e manteca per emulsionare.",
  "Finish with cheese off the heat and serve immediately.": "Completa con il formaggio fuori dal fuoco e servi subito.",
  // Steps (Pizza)
  "Mix and knead the dough, then rest it for 24 hours in the fridge.": "Impasta e lavora, poi lascia riposare 24 ore in frigo.",
  "Shape balls and prove until doubled.": "Forma i panetti e falli lievitare fino al raddoppio.",
  "Stretch by hand — never with a rolling pin.": "Stendi a mano — mai con il mattarello.",
  "Top sparingly and bake at the highest heat your oven allows.": "Condisci con parsimonia e cuoci alla massima temperatura del forno.",
  "Rest one minute, slice and eat straight away.": "Fai riposare un minuto, taglia e mangia subito.",
  // Steps (Desserts)
  "Prepare the base or cream component first and chill it.": "Prepara prima la base o la crema e falla raffreddare.",
  "Work the dairy gently so it stays light.": "Lavora i latticini con delicatezza perché restino leggeri.",
  "Assemble in layers, pressing nothing down.": "Assembla a strati, senza premere nulla.",
  "Rest in the fridge so the flavours settle.": "Fai riposare in frigo perché i sapori si assestino.",
  "Finish with the final dusting only at the table.": "Completa con la spolverata finale solo a tavola.",
  // Steps (Seafood)
  "Purge and clean the seafood carefully.": "Spurga e pulisci il pesce con cura.",
  "Warm garlic and oil gently — never let it brown.": "Scalda aglio e olio dolcemente — senza mai farli imbiondire.",
  "Add the seafood and wine, cover, and steam briefly.": "Aggiungi il pesce e il vino, copri e cuoci al vapore brevemente.",
  "Toss with the main element and its juices.": "Salta con l'elemento principale e il suo liquido.",
  "Finish with parsley and good oil; serve at once.": "Completa con prezzemolo e olio buono; servi subito.",
  // Steps (Vegetarian)
  "Prepare the vegetables while the base simmers.": "Prepara le verdure mentre la base sobbolle.",
  "Build flavour slowly over low heat.": "Costruisci il sapore lentamente a fuoco basso.",
  "Add the bread or legumes and let everything mingle.": "Aggiungi il pane o i legumi e lascia amalgamare il tutto.",
  "Rest briefly — this dish improves as it sits.": "Fai riposare brevemente — questo piatto migliora col tempo.",
  "Serve warm, never hot, with a thread of raw oil.": "Servi tiepido, mai bollente, con un filo d'olio a crudo.",
  // Steps (Fine Dining)
  "Prepare each component separately and precisely.": "Prepara ogni componente separatamente e con precisione.",
  "Season in layers, tasting constantly.": "Condisci a strati, assaggiando di continuo.",
  "Cook the centrepiece to exact temperature.": "Cuoci l'elemento principale alla temperatura esatta.",
  "Plate with restraint.": "Impiatta con misura.", "Serve without delay.": "Servi senza indugio.",
  // Steps (Main Course)
  "Bring the meat to room temperature and season boldly.": "Porta la carne a temperatura ambiente e condiscila con decisione.",
  "Sear hard to build a crust.": "Rosola bene per formare una crosta.",
  "Lower the heat and cook gently to the right point.": "Abbassa il fuoco e cuoci dolcemente al punto giusto.",
  "Rest the meat as long as you seared it.": "Fai riposare la carne quanto l'hai rosolata.",
  "Slice against the grain and finish with pan juices.": "Taglia controfibra e completa con il fondo di cottura.",
  // Steps (Street Food)
  "Prepare the filling and let it cool completely.": "Prepara il ripieno e fallo raffreddare completamente.",
  "Shape with wet hands so nothing sticks.": "Modella con le mani bagnate perché nulla si attacchi.",
  "Coat evenly in breadcrumbs or batter.": "Impana uniformemente nel pangrattato o nella pastella.",
  "Fry at 170 °C until deep gold.": "Friggi a 170 °C fino a doratura intensa.",
  "Drain, salt and eat while hot.": "Scola, sala e mangia ben caldo.",
  // Steps (Antipasti)
  "Choose impeccable raw ingredients — there is nowhere to hide.": "Scegli ingredienti crudi impeccabili — non c'è dove nascondersi.",
  "Slice or arrange just before serving.": "Affetta o disponi solo poco prima di servire.",
  "Dress with oil, salt and little else.": "Condisci con olio, sale e poco altro.",
  "Serve with warm bread.": "Servi con pane caldo.", "Let the produce speak.": "Lascia parlare la materia prima.",
  // Wine notes
  "Sweet, aromatic and gentle — it lifts the dessert without overwhelming it.": "Dolce, aromatico e delicato — solleva il dolce senza sovrastarlo.",
  "Crisp acidity and saline minerality to mirror the seafood.": "Acidità nervosa e mineralità salina che rispecchiano il pesce.",
  "Bubbles or rustic red cut through the char and mozzarella.": "Bollicine o un rosso rustico tagliano il bruciacchiato e la mozzarella.",
  "Light and refreshing alongside fried or cured bites.": "Leggero e rinfrescante accanto a bocconi fritti o salumi.",
  "A Lazio red with soft tannins that loves pecorino and guanciale.": "Un rosso laziale dai tannini morbidi che ama pecorino e guanciale.",
  "A volcanic Campanian red, juicy and food-friendly.": "Un rosso vulcanico campano, succoso e versatile a tavola.",
  "Bright cherry acidity to balance butter and saffron.": "Vivace acidità di ciliegia per bilanciare burro e zafferano.",
  "Sangiovese structure made for grilled meat and Tuscan herbs.": "La struttura del Sangiovese, fatta per carni alla griglia ed erbe toscane.",
  "Medium-bodied and savoury — ragù's oldest companion.": "Di medio corpo e sapido — il più antico compagno del ragù.",
  "Round and warming next to lagoon-side plates.": "Rotondo e avvolgente accanto ai piatti di laguna.",
  "The king of Nebbiolo for Piedmont's richest dishes.": "Il re del Nebbiolo per i piatti più ricchi del Piemonte.",
  "Sun-ripened Sicilian fruit with a Mediterranean backbone.": "Frutto siciliano maturato al sole con una spina dorsale mediterranea.",
  "A herbal Ligurian white that echoes basil and olive oil.": "Un bianco ligure erbaceo che richiama basilico e olio d'oliva.",
  "Ripe southern red with the depth for durum-wheat classics.": "Un rosso maturo del sud con la profondità per i classici di grano duro.",
});

/* ── Public API ─────────────────────────────────────────────────── */
export function L(text: string | undefined, lang: Lang): string {
  if (!text) return text ?? "";
  return lang === "IT" ? UI[text] ?? text : text;
}
export function useL() {
  const lang = useLang();
  return (text: string | undefined) => L(text, lang);
}

const MONTH_ABBR: Record<string, string> = {
  Jan: "gen", Feb: "feb", Mar: "mar", Apr: "apr", May: "mag", Jun: "giu",
  Jul: "lug", Aug: "ago", Sep: "set", Oct: "ott", Nov: "nov", Dec: "dic",
};
/* "Jun 18, 2026" → "18 giu 2026" */
export function localizeDate(date: string, lang: Lang): string {
  if (lang === "EN") return date;
  const m = date.match(/^([A-Za-z]{3}) (\d{1,2}), (\d{4})$/);
  if (!m) return date;
  return `${m[2]} ${MONTH_ABBR[m[1]] ?? m[1]} ${m[3]}`;
}
/* "6 min read" → "6 min di lettura", "8 min watch" → "8 min di visione" */
export function localizeReadTime(rt: string, lang: Lang): string {
  if (lang === "EN") return rt;
  return rt.replace(/min read/, "min di lettura").replace(/min watch/, "min di visione");
}
export function useI18n() {
  const lang = useLang();
  return {
    lang,
    l: (text: string | undefined) => L(text, lang),
    dishDesc: (d: Dish) => (lang === "IT" ? DISH_DESC_IT[d.name] ?? d.description : d.description),
    dishHistory: (d: Dish) => localizeHistory(d, lang),
    dishFunFacts: (d: Dish) => localizeFunFacts(d, lang),
    dishSteps: (d: Dish) => (lang === "IT" ? d.steps.map((s) => L(s, lang)) : d.steps),
    dishIngredients: (d: Dish) => (lang === "IT" ? d.ingredients.map((s) => L(s, lang)) : d.ingredients),
    wineNote: (d: Dish) => L(d.wine.note, lang),
    blurb: (r: Restaurant) => (lang === "IT" ? REST_BLURB_IT[r.name] ?? r.blurb : r.blurb),
    restStory: (r: Restaurant) => localizeRestaurantStory(r, lang),
    cityBlurb: (c: City) => (lang === "IT" ? CITY_IT[c.id]?.blurb ?? c.blurb : c.blurb),
    cityCulture: (c: City) => (lang === "IT" ? CITY_IT[c.id]?.culture ?? c.culture : c.culture),
    storyTitle: (s: Story) => (lang === "IT" ? STORY_IT[s.title]?.title ?? s.title : s.title),
    storyExcerpt: (s: Story) => (lang === "IT" ? STORY_IT[s.title]?.excerpt ?? s.excerpt : s.excerpt),
    videoTitle: (title: string) => (lang === "IT" ? VIDEO_IT[title] ?? title : title),
    newsTitle: (title: string) => (lang === "IT" ? NEWS_IT[title] ?? title : title),
    newsExcerpt: (excerpt: string) => (lang === "IT" ? NEWS_EXCERPT_IT : excerpt),
    expTagline: (label: string) => (lang === "IT" ? EXP_IT[label]?.tagline ?? "" : ""),
    expIntro: (label: string, fallback: string) => (lang === "IT" ? EXP_IT[label]?.intro ?? fallback : fallback),
    extra: (cityId: string) => (lang === "IT" ? EXTRA_IT[cityId] : null),
    date: (d: string) => localizeDate(d, lang),
    readTime: (rt: string) => localizeReadTime(rt, lang),
  };
}
