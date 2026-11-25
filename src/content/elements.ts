export type ElementCategory =
  | "alkali"
  | "alkaline-earth"
  | "transition"
  | "post-transition"
  | "metalloid"
  | "nonmetal"
  | "halogen"
  | "noble-gas"
  | "lanthanide"
  | "actinide";

export type ElementData = {
  number: number;
  symbol: string;
  name: string;
  group: number | null;
  period: number;
  category: ElementCategory;
};

const names = `H Hidrogen|He Helium|Li Litium|Be Berilium|B Boron|C Karbon|N Nitrogen|O Oksigen|F Fluorin|Ne Neon|Na Natrium|Mg Magnesium|Al Aluminium|Si Silikon|P Fosfor|S Belerang|Cl Klorin|Ar Argon|K Kalium|Ca Kalsium|Sc Skandium|Ti Titanium|V Vanadium|Cr Kromium|Mn Mangan|Fe Besi|Co Kobalt|Ni Nikel|Cu Tembaga|Zn Seng|Ga Galium|Ge Germanium|As Arsen|Se Selenium|Br Bromin|Kr Kripton|Rb Rubidium|Sr Stronsium|Y Itrium|Zr Zirkonium|Nb Niobium|Mo Molibdenum|Tc Teknesium|Ru Rutenium|Rh Rodium|Pd Paladium|Ag Perak|Cd Kadmium|In Indium|Sn Timah|Sb Antimon|Te Telurium|I Iodin|Xe Xenon|Cs Sesium|Ba Barium|La Lantanum|Ce Serium|Pr Praseodimium|Nd Neodimium|Pm Prometium|Sm Samarium|Eu Europium|Gd Gadolinium|Tb Terbium|Dy Disprosium|Ho Holmium|Er Erbium|Tm Tulium|Yb Iterbium|Lu Lutesium|Hf Hafnium|Ta Tantalum|W Wolfram|Re Renium|Os Osmium|Ir Iridium|Pt Platina|Au Emas|Hg Raksa|Tl Talium|Pb Timbal|Bi Bismut|Po Polonium|At Astatin|Rn Radon|Fr Fransium|Ra Radium|Ac Aktinium|Th Torium|Pa Protaktinium|U Uranium|Np Neptunium|Pu Plutonium|Am Amerisium|Cm Kurium|Bk Berkelium|Cf Kalifornium|Es Einsteinium|Fm Fermium|Md Mendelevium|No Nobelium|Lr Lawrensium|Rf Rutherfordium|Db Dubnium|Sg Seaborgium|Bh Bohrium|Hs Hassium|Mt Meitnerium|Ds Darmstadtium|Rg Roentgenium|Cn Kopernisium|Nh Nihonium|Fl Flerovium|Mc Moskovium|Lv Livermorium|Ts Tenesin|Og Oganeson`
  .split("|")
  .map((entry) => entry.split(" ") as [string, string]);

const mainRows = [
  ["H", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "He"],
  ["Li", "Be", "", "", "", "", "", "", "", "", "", "", "B", "C", "N", "O", "F", "Ne"],
  ["Na", "Mg", "", "", "", "", "", "", "", "", "", "", "Al", "Si", "P", "S", "Cl", "Ar"],
  ["K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr"],
  ["Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn", "Sb", "Te", "I", "Xe"],
  ["Cs", "Ba", "", "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg", "Tl", "Pb", "Bi", "Po", "At", "Rn"],
  ["Fr", "Ra", "", "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og"],
];
const fSeries = new Set("La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr".split(" "));
const metalloids = new Set("B Si Ge As Sb Te Po".split(" "));
const nonmetals = new Set("H C N O P S Se".split(" "));

function category(symbol: string, group: number, period: number): ElementCategory {
  if (period === 6 && fSeries.has(symbol)) return "lanthanide";
  if (period === 7 && fSeries.has(symbol)) return "actinide";
  if (group === 1 && symbol !== "H") return "alkali";
  if (group === 2) return "alkaline-earth";
  if (group === 17) return "halogen";
  if (group === 18) return "noble-gas";
  if (metalloids.has(symbol)) return "metalloid";
  if (nonmetals.has(symbol)) return "nonmetal";
  if (group >= 3 && group <= 12) return "transition";
  return "post-transition";
}

const positions = new Map<string, { group: number; period: number }>();
mainRows.forEach((row, periodIndex) =>
  row.forEach((symbol, groupIndex) => {
    if (symbol) positions.set(symbol, { group: groupIndex + 1, period: periodIndex + 1 });
  }),
);

export const elements: ElementData[] = names.map(([symbol, name], index) => {
  const number = index + 1;
  const inFSeries = fSeries.has(symbol);
  const position = positions.get(symbol);
  const period = inFSeries ? (number <= 71 ? 6 : 7) : position?.period ?? 1;
  const group = inFSeries ? 3 : position?.group ?? 1;
  return { number, symbol, name, group, period, category: category(symbol, group, period) };
});

export const elementRows = mainRows.map((row) => row.map((symbol) => elements.find((element) => element.symbol === symbol)));
export const fElementRows = [elements.slice(56, 71), elements.slice(88, 103)];

export const categoryLabels: Record<ElementCategory, string> = {
  alkali: "Logam alkali",
  "alkaline-earth": "Alkali tanah",
  transition: "Logam transisi",
  "post-transition": "Logam pasca-transisi",
  metalloid: "Metaloid",
  nonmetal: "Nonlogam",
  halogen: "Halogen",
  "noble-gas": "Gas mulia",
  lanthanide: "Lantanida",
  actinide: "Aktinida",
};
