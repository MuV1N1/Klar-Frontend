/**
 * Aisle of a shopping item. A name matches an entry by a whole word or a word ending, so German
 * compounds work ("Vollkornbrot" → bakery); the longest match wins ("Erdnussbutter" → pantry,
 * not dairy). The first word per language is the name shown in suggestions.
 */
export const ITEM_CATEGORIES = [
	'produce',
	'bakery',
	'dairy',
	'meat',
	'pantry',
	'drinks',
	'household',
	'other'
] as const;
export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

/** Each aisle borrows a list colour, so the item cards tell the aisles apart at a glance. */
export const CATEGORY_COLORS: Record<ItemCategory, string> = {
	produce: 'var(--list-lime)',
	bakery: 'var(--list-yellow)',
	dairy: 'var(--list-blue)',
	meat: 'var(--list-pink)',
	pantry: 'var(--list-orange)',
	drinks: 'var(--list-purple)',
	household: 'var(--list-teal)',
	other: 'var(--list-gray)'
};

interface Entry {
	category: ItemCategory;
	de: string[];
	en: string[];
}

const CATALOG: Entry[] = [
	// Obst & Gemüse
	{ category: 'produce', de: ['Äpfel', 'apfel'], en: ['Apples', 'apple'] },
	{ category: 'produce', de: ['Birnen', 'birne'], en: ['Pears', 'pear'] },
	{ category: 'produce', de: ['Bananen', 'banane'], en: ['Bananas', 'banana'] },
	{
		category: 'produce',
		de: ['Orangen', 'orange', 'mandarine', 'mandarinen', 'clementine'],
		en: ['Oranges', 'orange', 'tangerine']
	},
	{
		category: 'produce',
		de: ['Zitronen', 'zitrone', 'limette', 'limetten'],
		en: ['Lemons', 'lemon', 'lime', 'limes']
	},
	{ category: 'produce', de: ['Trauben', 'weintrauben'], en: ['Grapes', 'grape'] },
	{ category: 'produce', de: ['Erdbeeren', 'erdbeere'], en: ['Strawberries', 'strawberry'] },
	{
		category: 'produce',
		de: ['Heidelbeeren', 'blaubeeren', 'beeren', 'himbeeren'],
		en: ['Blueberries', 'berries', 'raspberries']
	},
	{ category: 'produce', de: ['Kirschen', 'kirsche'], en: ['Cherries', 'cherry'] },
	{
		category: 'produce',
		de: ['Pfirsiche', 'pfirsich', 'nektarinen', 'aprikosen'],
		en: ['Peaches', 'peach', 'apricots']
	},
	{ category: 'produce', de: ['Ananas'], en: ['Pineapple'] },
	{ category: 'produce', de: ['Mango', 'mangos'], en: ['Mango', 'mangoes'] },
	{ category: 'produce', de: ['Melone', 'wassermelone'], en: ['Watermelon', 'melon'] },
	{ category: 'produce', de: ['Kiwis', 'kiwi'], en: ['Kiwis', 'kiwi'] },
	{ category: 'produce', de: ['Avocado', 'avocados'], en: ['Avocado', 'avocados'] },
	{ category: 'produce', de: ['Tomaten', 'tomate'], en: ['Tomatoes', 'tomato'] },
	{
		category: 'produce',
		de: ['Gurke', 'gurken', 'zucchini'],
		en: ['Cucumber', 'cucumbers', 'zucchini']
	},
	{
		category: 'produce',
		de: ['Karotten', 'karotte', 'möhren', 'möhre'],
		en: ['Carrots', 'carrot']
	},
	{ category: 'produce', de: ['Kartoffeln', 'kartoffel'], en: ['Potatoes', 'potato'] },
	{ category: 'produce', de: ['Zwiebeln', 'zwiebel'], en: ['Onions', 'onion'] },
	{ category: 'produce', de: ['Knoblauch'], en: ['Garlic'] },
	{ category: 'produce', de: ['Paprika'], en: ['Peppers', 'pepper', 'bell pepper'] },
	{ category: 'produce', de: ['Chili', 'peperoni'], en: ['Chili', 'chilli'] },
	{ category: 'produce', de: ['Brokkoli', 'blumenkohl'], en: ['Broccoli', 'cauliflower'] },
	{
		category: 'produce',
		de: ['Salat', 'spinat', 'kohl', 'rucola'],
		en: ['Lettuce', 'salad', 'spinach', 'cabbage']
	},
	{ category: 'produce', de: ['Mais'], en: ['Corn'] },
	{ category: 'produce', de: ['Pilze', 'champignons'], en: ['Mushrooms', 'mushroom'] },
	{ category: 'produce', de: ['Aubergine', 'auberginen'], en: ['Eggplant', 'aubergine'] },
	{
		category: 'produce',
		de: ['Kräuter', 'petersilie', 'basilikum', 'schnittlauch'],
		en: ['Herbs', 'parsley', 'basil']
	},
	{
		category: 'produce',
		de: ['Bohnen', 'linsen', 'kichererbsen'],
		en: ['Beans', 'lentils', 'chickpeas']
	},
	{
		category: 'produce',
		de: ['Nüsse', 'erdnüsse', 'nuss', 'erdnussbutter', 'mandeln'],
		en: ['Nuts', 'peanuts', 'peanut butter', 'almonds']
	},

	// Brot & Backwaren
	{ category: 'bakery', de: ['Brot', 'toast', 'toastbrot'], en: ['Bread', 'toast'] },
	{ category: 'bakery', de: ['Baguette'], en: ['Baguette'] },
	{
		category: 'bakery',
		de: ['Croissants', 'croissant', 'gebäck'],
		en: ['Croissants', 'croissant', 'pastry']
	},
	{ category: 'bakery', de: ['Brötchen', 'semmeln', 'bagels'], en: ['Rolls', 'buns', 'bagels'] },
	{ category: 'bakery', de: ['Brezeln', 'brezel', 'breze'], en: ['Pretzels', 'pretzel'] },
	{ category: 'bakery', de: ['Kuchen', 'torte'], en: ['Cake'] },
	{ category: 'bakery', de: ['Waffeln'], en: ['Waffles'] },

	// Milch & Kühlregal
	{ category: 'dairy', de: ['Milch', 'hafermilch', 'buttermilch'], en: ['Milk', 'oat milk'] },
	{ category: 'dairy', de: ['Butter', 'margarine'], en: ['Butter', 'margarine'] },
	{
		category: 'dairy',
		de: ['Käse', 'gouda', 'mozzarella', 'parmesan', 'feta'],
		en: ['Cheese', 'mozzarella', 'parmesan']
	},
	{ category: 'dairy', de: ['Eier', 'ei'], en: ['Eggs', 'egg'] },
	{
		category: 'dairy',
		de: ['Joghurt', 'jogurt', 'quark', 'skyr', 'pudding'],
		en: ['Yogurt', 'yoghurt', 'pudding']
	},
	{ category: 'dairy', de: ['Sahne', 'schmand', 'saure sahne'], en: ['Cream', 'sour cream'] },

	// Fleisch & Fisch
	{
		category: 'meat',
		de: ['Fleisch', 'steak', 'rind', 'hackfleisch', 'hack'],
		en: ['Meat', 'steak', 'beef', 'mince']
	},
	{ category: 'meat', de: ['Hähnchen', 'hühnchen', 'huhn', 'pute'], en: ['Chicken', 'turkey'] },
	{ category: 'meat', de: ['Speck', 'bacon', 'schinken'], en: ['Bacon', 'ham'] },
	{
		category: 'meat',
		de: ['Würstchen', 'wurst', 'salami', 'aufschnitt'],
		en: ['Sausages', 'sausage', 'salami']
	},
	{ category: 'meat', de: ['Fisch', 'lachs', 'thunfisch'], en: ['Fish', 'salmon', 'tuna'] },
	{ category: 'meat', de: ['Garnelen', 'shrimps'], en: ['Shrimp', 'prawns'] },

	// Vorrat
	{
		category: 'pantry',
		de: ['Nudeln', 'spaghetti', 'pasta'],
		en: ['Pasta', 'spaghetti', 'noodles']
	},
	{ category: 'pantry', de: ['Reis'], en: ['Rice'] },
	{
		category: 'pantry',
		de: ['Mehl', 'haferflocken', 'müsli'],
		en: ['Flour', 'oats', 'cereal', 'muesli']
	},
	{ category: 'pantry', de: ['Salz', 'pfeffer', 'gewürze'], en: ['Salt', 'spices'] },
	{
		category: 'pantry',
		de: ['Zucker', 'süßigkeiten', 'bonbons'],
		en: ['Sugar', 'sweets', 'candy']
	},
	{ category: 'pantry', de: ['Öl', 'olivenöl', 'oliven'], en: ['Oil', 'olive oil', 'olives'] },
	{ category: 'pantry', de: ['Honig', 'marmelade', 'nutella'], en: ['Honey', 'jam'] },
	{
		category: 'pantry',
		de: ['Dosen', 'konserven', 'tomatensoße', 'passata', 'suppe'],
		en: ['Cans', 'canned tomatoes', 'soup']
	},
	{
		category: 'pantry',
		de: ['Ketchup', 'senf', 'mayo', 'mayonnaise', 'soße'],
		en: ['Ketchup', 'mustard', 'mayo', 'sauce']
	},
	{ category: 'pantry', de: ['Pizza'], en: ['Pizza'] },
	{ category: 'pantry', de: ['Pommes'], en: ['Fries'] },
	{ category: 'pantry', de: ['Eiswürfel', 'tiefkühl'], en: ['Ice', 'frozen'] },
	{ category: 'pantry', de: ['Eis', 'eiscreme'], en: ['Ice cream'] },
	{ category: 'pantry', de: ['Schokolade', 'schoko'], en: ['Chocolate'] },
	{ category: 'pantry', de: ['Kekse', 'keks', 'plätzchen'], en: ['Cookies', 'biscuits'] },
	{ category: 'pantry', de: ['Popcorn'], en: ['Popcorn'] },
	{ category: 'pantry', de: ['Chips'], en: ['Crisps', 'chips'] },

	// Getränke
	{
		category: 'drinks',
		de: ['Wasser', 'mineralwasser', 'sprudel'],
		en: ['Water', 'sparkling water']
	},
	{
		category: 'drinks',
		de: ['Saft', 'orangensaft', 'apfelsaft', 'schorle'],
		en: ['Juice', 'orange juice']
	},
	{
		category: 'drinks',
		de: ['Cola', 'limo', 'limonade', 'fanta', 'sprite', 'eistee'],
		en: ['Soda', 'cola', 'lemonade', 'iced tea']
	},
	{ category: 'drinks', de: ['Kaffee', 'kaffeebohnen', 'espresso'], en: ['Coffee', 'espresso'] },
	{ category: 'drinks', de: ['Tee'], en: ['Tea'] },
	{ category: 'drinks', de: ['Bier'], en: ['Beer'] },
	{
		category: 'drinks',
		de: ['Wein', 'rotwein', 'weißwein', 'sekt'],
		en: ['Wine', 'red wine', 'white wine', 'champagne']
	},
	{
		category: 'drinks',
		de: ['Energy', 'energydrink', 'red bull'],
		en: ['Energy drink', 'energy', 'red bull']
	},

	// Haushalt & Drogerie
	{
		category: 'household',
		de: ['Klopapier', 'toilettenpapier', 'küchenrolle', 'taschentücher'],
		en: ['Toilet paper', 'paper towels', 'tissues']
	},
	{ category: 'household', de: ['Seife', 'spülmittel', 'handseife'], en: ['Soap', 'dish soap'] },
	{
		category: 'household',
		de: ['Shampoo', 'duschgel', 'creme', 'sonnencreme', 'deo', 'spülung'],
		en: ['Shampoo', 'shower gel', 'lotion', 'sunscreen', 'deodorant']
	},
	{
		category: 'household',
		de: ['Zahnpasta', 'zahnbürste', 'zahncreme'],
		en: ['Toothpaste', 'toothbrush']
	},
	{
		category: 'household',
		de: ['Waschmittel', 'weichspüler'],
		en: ['Laundry detergent', 'detergent', 'fabric softener']
	},
	{
		category: 'household',
		de: ['Schwämme', 'schwamm', 'putzmittel', 'reiniger'],
		en: ['Sponges', 'sponge', 'cleaner']
	},
	{ category: 'household', de: ['Müllbeutel', 'mülltüten'], en: ['Bin bags', 'trash bags'] },
	{ category: 'household', de: ['Batterien', 'batterie'], en: ['Batteries', 'battery'] },
	{ category: 'household', de: ['Glühbirne', 'lampe'], en: ['Light bulb', 'bulb'] },
	{
		category: 'household',
		de: ['Medikamente', 'tabletten', 'ibuprofen', 'pflaster'],
		en: ['Medicine', 'pills', 'plasters']
	},
	{
		category: 'household',
		de: ['Windeln', 'babynahrung'],
		en: ['Diapers', 'nappies', 'baby food']
	},
	{
		category: 'household',
		de: ['Katzenfutter', 'hundefutter', 'tierfutter', 'futter'],
		en: ['Cat food', 'dog food', 'pet food']
	},
	{ category: 'household', de: ['Blumen', 'strauß'], en: ['Flowers', 'bouquet'] }
];

const FALLBACK: ItemCategory = 'other';

const KEYWORDS = CATALOG.flatMap((entry) =>
	[...entry.de, ...entry.en].map((word) => ({ word: word.toLowerCase(), category: entry.category }))
).sort((a, b) => b.word.length - a.word.length);

/** Aisle of an item name, 'other' when nothing in the catalog matches. */
export function itemCategory(name: string): ItemCategory {
	const words = name.toLowerCase().trim().split(/\s+/);
	const text = words.join(' ');
	for (const { word, category } of KEYWORDS) {
		if (text === word) return category;
		// A word ending with the keyword ("Vollkornbrot"), never a prefix ("Brotdose" stays other).
		// Keywords under 3 letters only count as the whole name: "Ei", not "Brei".
		if (word.length >= 3 && (text.endsWith(word) || words.some((w) => w.endsWith(word))))
			return category;
	}
	return FALLBACK;
}

/** Catalog items whose name starts with the query, for the add field. */
export function suggestItems(
	query: string,
	locale: string,
	limit = 8
): { name: string; category: ItemCategory }[] {
	const q = query.toLowerCase().trim();
	if (!q) return [];
	return CATALOG.map((entry) => ({
		name: (locale === 'de' ? entry.de : entry.en)[0],
		category: entry.category
	}))
		.filter((item) => item.name.toLowerCase().startsWith(q))
		.slice(0, limit);
}
