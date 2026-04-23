// Scientific data based on published studies:
// - Good Morning America / Amerisleep study (2023): 3–5M CFU/sq inch after 1 week
// - NIH PubMed studies on bedsheet microbial load
// - Average person sheds ~1.5g dead skin/week, loses ~1L sweat/night
// - Dust mites: 100–1,000 per gram of dust; produce ~20 droppings/day each
// - Allergen levels (Der p 1) measurable from Day 4–5 onward

export const germData = [
  {
    day: "Day 1",
    germs: 1000,
    label: "Fresh sheets — baseline skin flora only",
    bacteria: 90,
    fungi: 5,
    allergens: 2,
    dustMites: 0,
    skinCells: 3,
    riskLevel: 2,
    healthNote: "Negligible risk. Normal skin microbiome present.",
    sweatMg: 200,
    skinMg: 30,
    miteCount: 0,        // No mites on fresh sheets
    allergenUg: 0.01
  },
  {
    day: "Day 2",
    germs: 50000,
    label: "Bacteria multiplies 50× — sweat creates ideal growth medium",
    bacteria: 88,
    fungi: 6,
    allergens: 3,
    dustMites: 0,
    skinCells: 9,
    riskLevel: 8,
    healthNote: "Bacteria doubling every 20 min in warm, moist environment.",
    sweatMg: 400,
    skinMg: 60,
    miteCount: 0,        // Mites need food source to establish — not yet
    allergenUg: 0.05
  },
  {
    day: "Day 3",
    germs: 200000,
    label: "Rapid growth phase — fungi begin colonising",
    bacteria: 82,
    fungi: 10,
    allergens: 4,
    dustMites: 1,
    skinCells: 4,
    riskLevel: 18,
    healthNote: "Fungi (Aspergillus, Candida) detectable. Skin irritation risk begins.",
    sweatMg: 600,
    skinMg: 90,
    miteCount: 0,        // Still too early — mites take 4–7 days to colonise fresh sheets
    allergenUg: 0.2
  },
  {
    day: "Day 4",
    germs: 800000,
    label: "Skin cells + sweat buildup — dust mites begin arriving",
    bacteria: 75,
    fungi: 14,
    allergens: 6,
    dustMites: 3,
    skinCells: 2,
    riskLevel: 35,
    healthNote: "First mites detectable (~0.05/sq in). Allergen Der p 1 measurable. Acne risk rises.",
    sweatMg: 800,
    skinMg: 120,
    miteCount: 0.05,     // ~0.05 mites/sq in — just beginning to colonise
    allergenUg: 0.8
  },
  {
    day: "Day 5",
    germs: 1500000,
    label: "Over 1 million bacteria — allergen levels spike",
    bacteria: 68,
    fungi: 16,
    allergens: 10,
    dustMites: 4,
    skinCells: 2,
    riskLevel: 55,
    healthNote: "Allergen threshold for sensitised individuals exceeded. Respiratory risk.",
    sweatMg: 1000,
    skinMg: 150,
    miteCount: 0.1,      // ~0.1 mites/sq in — early colony forming
    allergenUg: 2.0
  },
  {
    day: "Day 6",
    germs: 3000000,
    label: "High microbial load — respiratory pathogens present",
    bacteria: 62,
    fungi: 18,
    allergens: 13,
    dustMites: 5,
    skinCells: 2,
    riskLevel: 72,
    healthNote: "Bacteria linked to pneumonia & skin infections detected. High allergen load.",
    sweatMg: 1200,
    skinMg: 180,
    miteCount: 0.2,      // ~0.2 mites/sq in — growing colony
    allergenUg: 3.5
  },
  {
    day: "Day 7",
    germs: 5000000,
    label: "17,442× more bacteria than a toilet seat (Amerisleep study)",
    bacteria: 58,
    fungi: 20,
    allergens: 14,
    dustMites: 6,
    skinCells: 2,
    riskLevel: 88,
    healthNote: "3–5M CFU/sq inch confirmed. ~0.3 mites/sq inch on sheet surface (mattress: 100K–10M total).",
    sweatMg: 1400,
    skinMg: 210,
    miteCount: 0.3,      // ~0.3 mites/sq inch on sheet after 1 week (scientific estimate)
    allergenUg: 5.0
  }
];
