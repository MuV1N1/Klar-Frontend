/**
 * Emoji for shopping items. A name matches an entry by a whole word or a word ending, so German
 * compounds work ("Vollkornbrot" → 🍞); the longest match wins ("Erdnussbutter" → 🥜, not 🧈).
 * The first word per language is the name shown in suggestions.
 */
interface Entry {
	emoji: string;
	de: string[];
	en: string[];
}

const CATALOG: Entry[] = [
	// Obst & Gemüse
	{ emoji: '🍎', de: ['Äpfel', 'apfel'], en: ['Apples', 'apple'] },
	{ emoji: '🍐', de: ['Birnen', 'birne'], en: ['Pears', 'pear'] },
	{ emoji: '🍌', de: ['Bananen', 'banane'], en: ['Bananas', 'banana'] },
	{
		emoji: '🍊',
		de: ['Orangen', 'orange', 'mandarine', 'mandarinen', 'clementine'],
		en: ['Oranges', 'orange', 'tangerine']
	},
	{
		emoji: '🍋',
		de: ['Zitronen', 'zitrone', 'limette', 'limetten'],
		en: ['Lemons', 'lemon', 'lime', 'limes']
	},
	{ emoji: '🍇', de: ['Trauben', 'weintrauben'], en: ['Grapes', 'grape'] },
	{ emoji: '🍓', de: ['Erdbeeren', 'erdbeere'], en: ['Strawberries', 'strawberry'] },
	{
		emoji: '🫐',
		de: ['Heidelbeeren', 'blaubeeren', 'beeren', 'himbeeren'],
		en: ['Blueberries', 'berries', 'raspberries']
	},
	{ emoji: '🍒', de: ['Kirschen', 'kirsche'], en: ['Cherries', 'cherry'] },
	{
		emoji: '🍑',
		de: ['Pfirsiche', 'pfirsich', 'nektarinen', 'aprikosen'],
		en: ['Peaches', 'peach', 'apricots']
	},
	{ emoji: '🍍', de: ['Ananas'], en: ['Pineapple'] },
	{ emoji: '🥭', de: ['Mango', 'mangos'], en: ['Mango', 'mangoes'] },
	{ emoji: '🍉', de: ['Melone', 'wassermelone'], en: ['Watermelon', 'melon'] },
	{ emoji: '🥝', de: ['Kiwis', 'kiwi'], en: ['Kiwis', 'kiwi'] },
	{ emoji: '🥑', de: ['Avocado', 'avocados'], en: ['Avocado', 'avocados'] },
	{ emoji: '🍅', de: ['Tomaten', 'tomate'], en: ['Tomatoes', 'tomato'] },
	{ emoji: '🥒', de: ['Gurke', 'gurken', 'zucchini'], en: ['Cucumber', 'cucumbers', 'zucchini'] },
	{ emoji: '🥕', de: ['Karotten', 'karotte', 'möhren', 'möhre'], en: ['Carrots', 'carrot'] },
	{ emoji: '🥔', de: ['Kartoffeln', 'kartoffel'], en: ['Potatoes', 'potato'] },
	{ emoji: '🧅', de: ['Zwiebeln', 'zwiebel'], en: ['Onions', 'onion'] },
	{ emoji: '🧄', de: ['Knoblauch'], en: ['Garlic'] },
	{ emoji: '🫑', de: ['Paprika'], en: ['Peppers', 'pepper', 'bell pepper'] },
	{ emoji: '🌶️', de: ['Chili', 'peperoni'], en: ['Chili', 'chilli'] },
	{ emoji: '🥦', de: ['Brokkoli', 'blumenkohl'], en: ['Broccoli', 'cauliflower'] },
	{
		emoji: '🥬',
		de: ['Salat', 'spinat', 'kohl', 'rucola'],
		en: ['Lettuce', 'salad', 'spinach', 'cabbage']
	},
	{ emoji: '🌽', de: ['Mais'], en: ['Corn'] },
	{ emoji: '🍄', de: ['Pilze', 'champignons'], en: ['Mushrooms', 'mushroom'] },
	{ emoji: '🍆', de: ['Aubergine', 'auberginen'], en: ['Eggplant', 'aubergine'] },
	{
		emoji: '🌿',
		de: ['Kräuter', 'petersilie', 'basilikum', 'schnittlauch'],
		en: ['Herbs', 'parsley', 'basil']
	},
	{ emoji: '🫘', de: ['Bohnen', 'linsen', 'kichererbsen'], en: ['Beans', 'lentils', 'chickpeas'] },
	{
		emoji: '🥜',
		de: ['Nüsse', 'erdnüsse', 'nuss', 'erdnussbutter', 'mandeln'],
		en: ['Nuts', 'peanuts', 'peanut butter', 'almonds']
	},

	// Brot & Backwaren
	{ emoji: '🍞', de: ['Brot', 'toast', 'toastbrot'], en: ['Bread', 'toast'] },
	{ emoji: '🥖', de: ['Baguette'], en: ['Baguette'] },
	{
		emoji: '🥐',
		de: ['Croissants', 'croissant', 'gebäck'],
		en: ['Croissants', 'croissant', 'pastry']
	},
	{ emoji: '🥯', de: ['Brötchen', 'semmeln', 'bagels'], en: ['Rolls', 'buns', 'bagels'] },
	{ emoji: '🥨', de: ['Brezeln', 'brezel', 'breze'], en: ['Pretzels', 'pretzel'] },
	{ emoji: '🍰', de: ['Kuchen', 'torte'], en: ['Cake'] },
	{ emoji: '🧇', de: ['Waffeln'], en: ['Waffles'] },

	// Milch & Kühlregal
	{ emoji: '🥛', de: ['Milch', 'hafermilch', 'buttermilch'], en: ['Milk', 'oat milk'] },
	{ emoji: '🧈', de: ['Butter', 'margarine'], en: ['Butter', 'margarine'] },
	{
		emoji: '🧀',
		de: ['Käse', 'gouda', 'mozzarella', 'parmesan', 'feta'],
		en: ['Cheese', 'mozzarella', 'parmesan']
	},
	{ emoji: '🥚', de: ['Eier', 'ei'], en: ['Eggs', 'egg'] },
	{
		emoji: '🍦',
		de: ['Joghurt', 'jogurt', 'quark', 'skyr', 'pudding'],
		en: ['Yogurt', 'yoghurt', 'pudding']
	},
	{ emoji: '🍶', de: ['Sahne', 'schmand', 'saure sahne'], en: ['Cream', 'sour cream'] },

	// Fleisch & Fisch
	{
		emoji: '🥩',
		de: ['Fleisch', 'steak', 'rind', 'hackfleisch', 'hack'],
		en: ['Meat', 'steak', 'beef', 'mince']
	},
	{ emoji: '🍗', de: ['Hähnchen', 'hühnchen', 'huhn', 'pute'], en: ['Chicken', 'turkey'] },
	{ emoji: '🥓', de: ['Speck', 'bacon', 'schinken'], en: ['Bacon', 'ham'] },
	{
		emoji: '🌭',
		de: ['Würstchen', 'wurst', 'salami', 'aufschnitt'],
		en: ['Sausages', 'sausage', 'salami']
	},
	{ emoji: '🐟', de: ['Fisch', 'lachs', 'thunfisch'], en: ['Fish', 'salmon', 'tuna'] },
	{ emoji: '🦐', de: ['Garnelen', 'shrimps'], en: ['Shrimp', 'prawns'] },

	// Vorrat
	{ emoji: '🍝', de: ['Nudeln', 'spaghetti', 'pasta'], en: ['Pasta', 'spaghetti', 'noodles'] },
	{ emoji: '🍚', de: ['Reis'], en: ['Rice'] },
	{ emoji: '🌾', de: ['Mehl', 'haferflocken', 'müsli'], en: ['Flour', 'oats', 'cereal', 'muesli'] },
	{ emoji: '🧂', de: ['Salz', 'pfeffer', 'gewürze'], en: ['Salt', 'spices'] },
	{ emoji: '🍬', de: ['Zucker', 'süßigkeiten', 'bonbons'], en: ['Sugar', 'sweets', 'candy'] },
	{ emoji: '🫒', de: ['Öl', 'olivenöl', 'oliven'], en: ['Oil', 'olive oil', 'olives'] },
	{ emoji: '🍯', de: ['Honig', 'marmelade', 'nutella'], en: ['Honey', 'jam'] },
	{
		emoji: '🥫',
		de: ['Dosen', 'konserven', 'tomatensoße', 'passata', 'suppe'],
		en: ['Cans', 'canned tomatoes', 'soup']
	},
	{
		emoji: '🥫',
		de: ['Ketchup', 'senf', 'mayo', 'mayonnaise', 'soße'],
		en: ['Ketchup', 'mustard', 'mayo', 'sauce']
	},
	{ emoji: '🍕', de: ['Pizza'], en: ['Pizza'] },
	{ emoji: '🍟', de: ['Pommes'], en: ['Fries'] },
	{ emoji: '🧊', de: ['Eiswürfel', 'tiefkühl'], en: ['Ice', 'frozen'] },
	{ emoji: '🍨', de: ['Eis', 'eiscreme'], en: ['Ice cream'] },
	{ emoji: '🍫', de: ['Schokolade', 'schoko'], en: ['Chocolate'] },
	{ emoji: '🍪', de: ['Kekse', 'keks', 'plätzchen'], en: ['Cookies', 'biscuits'] },
	{ emoji: '🍿', de: ['Popcorn'], en: ['Popcorn'] },
	{ emoji: '🥔', de: ['Chips'], en: ['Crisps', 'chips'] },

	// Getränke
	{ emoji: '💧', de: ['Wasser', 'mineralwasser', 'sprudel'], en: ['Water', 'sparkling water'] },
	{
		emoji: '🧃',
		de: ['Saft', 'orangensaft', 'apfelsaft', 'schorle'],
		en: ['Juice', 'orange juice']
	},
	{
		emoji: '🥤',
		de: ['Cola', 'limo', 'limonade', 'fanta', 'sprite', 'eistee'],
		en: ['Soda', 'cola', 'lemonade', 'iced tea']
	},
	{ emoji: '☕', de: ['Kaffee', 'kaffeebohnen', 'espresso'], en: ['Coffee', 'espresso'] },
	{ emoji: '🍵', de: ['Tee'], en: ['Tea'] },
	{ emoji: '🍺', de: ['Bier'], en: ['Beer'] },
	{
		emoji: '🍷',
		de: ['Wein', 'rotwein', 'weißwein', 'sekt'],
		en: ['Wine', 'red wine', 'white wine', 'champagne']
	},
	{
		emoji: '⚡',
		de: ['Energy', 'energydrink', 'red bull'],
		en: ['Energy drink', 'energy', 'red bull']
	},

	// Haushalt & Drogerie
	{
		emoji: '🧻',
		de: ['Klopapier', 'toilettenpapier', 'küchenrolle', 'taschentücher'],
		en: ['Toilet paper', 'paper towels', 'tissues']
	},
	{ emoji: '🧼', de: ['Seife', 'spülmittel', 'handseife'], en: ['Soap', 'dish soap'] },
	{
		emoji: '🧴',
		de: ['Shampoo', 'duschgel', 'creme', 'sonnencreme', 'deo', 'spülung'],
		en: ['Shampoo', 'shower gel', 'lotion', 'sunscreen', 'deodorant']
	},
	{ emoji: '🪥', de: ['Zahnpasta', 'zahnbürste', 'zahncreme'], en: ['Toothpaste', 'toothbrush'] },
	{
		emoji: '🧺',
		de: ['Waschmittel', 'weichspüler'],
		en: ['Laundry detergent', 'detergent', 'fabric softener']
	},
	{
		emoji: '🧽',
		de: ['Schwämme', 'schwamm', 'putzmittel', 'reiniger'],
		en: ['Sponges', 'sponge', 'cleaner']
	},
	{ emoji: '🗑️', de: ['Müllbeutel', 'mülltüten'], en: ['Bin bags', 'trash bags'] },
	{ emoji: '🔋', de: ['Batterien', 'batterie'], en: ['Batteries', 'battery'] },
	{ emoji: '💡', de: ['Glühbirne', 'lampe'], en: ['Light bulb', 'bulb'] },
	{
		emoji: '💊',
		de: ['Medikamente', 'tabletten', 'ibuprofen', 'pflaster'],
		en: ['Medicine', 'pills', 'plasters']
	},
	{ emoji: '🍼', de: ['Windeln', 'babynahrung'], en: ['Diapers', 'nappies', 'baby food'] },
	{
		emoji: '🐾',
		de: ['Katzenfutter', 'hundefutter', 'tierfutter', 'futter'],
		en: ['Cat food', 'dog food', 'pet food']
	},
	{ emoji: '💐', de: ['Blumen', 'strauß'], en: ['Flowers', 'bouquet'] }
];

const FALLBACK = '🛒';

const KEYWORDS = CATALOG.flatMap((entry) =>
	[...entry.de, ...entry.en].map((word) => ({ word: word.toLowerCase(), emoji: entry.emoji }))
).sort((a, b) => b.word.length - a.word.length);

/** Emoji for an item name, 🛒 when nothing in the catalog matches. */
export function itemEmoji(name: string): string {
	const words = name.toLowerCase().trim().split(/\s+/);
	const text = words.join(' ');
	for (const { word, emoji } of KEYWORDS) {
		if (text === word) return emoji;
		// A word ending with the keyword ("Vollkornbrot"), never a prefix ("Brotdose" stays 🛒).
		// Keywords under 3 letters only count as the whole name: "Ei", not "Brei".
		if (word.length >= 3 && (text.endsWith(word) || words.some((w) => w.endsWith(word))))
			return emoji;
	}
	return FALLBACK;
}

/** Catalog items whose name starts with the query, for the add field. */
export function suggestItems(
	query: string,
	locale: string,
	limit = 8
): { name: string; emoji: string }[] {
	const q = query.toLowerCase().trim();
	if (!q) return [];
	return CATALOG.map((entry) => ({
		name: (locale === 'de' ? entry.de : entry.en)[0],
		emoji: entry.emoji
	}))
		.filter((item) => item.name.toLowerCase().startsWith(q))
		.slice(0, limit);
}
