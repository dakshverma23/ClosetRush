const mongoose = require('mongoose');
const ScienceSection = require('../models/ScienceSection');
require('dotenv').config();

const sections = [
  {
    title: 'Health Benefits',
    order: 1,
    layout: 'layout1',
    content: {
      mainText: 'Clean bedding reduces exposure to dust mites, allergens, and bacteria that accumulate over time. Regular replacement of bedsheets can significantly improve sleep quality and reduce allergic reactions.',
      bulletPoints: [
        'Reduces skin irritation and acne',
        'Minimizes respiratory issues',
        'Improves overall sleep quality',
        'Prevents bacterial infections'
      ]
    },
    active: true,
    backgroundColor: '#ffffff',
    textColor: '#0f172a',
    images: []
  },
  {
    title: 'Hygiene Standards',
    order: 2,
    layout: 'layout2',
    content: {
      mainText: 'Our professional cleaning process ensures hospital-grade hygiene. Each item is carefully processed to meet the highest standards.',
      bulletPoints: [
        'Washed at high temperatures (60°C+)',
        'Sanitized with eco-friendly detergents',
        'Dried in industrial dryers',
        'Inspected for quality and cleanliness',
        'Packaged in sealed, sterile bags'
      ]
    },
    active: true,
    backgroundColor: '#f0f9ff',
    textColor: '#0f172a',
    images: []
  },
  {
    title: 'Energy & Chakras',
    order: 3,
    layout: 'layout3',
    content: {
      mainText: 'According to ancient wisdom, clean bedding promotes positive energy flow and chakra balance. Fresh sheets create a harmonious sleeping environment.',
      additionalText: 'Clean bedding enhances your connection to the earth element, promoting grounding and security while you rest.',
      bulletPoints: [
        'Root Chakra: Clean sheets provide grounding and security',
        'Sacral Chakra: Fresh bedding enhances creativity and rest',
        'Solar Plexus: Cleanliness boosts confidence and energy',
        'Heart Chakra: Comfort promotes emotional well-being'
      ]
    },
    active: true,
    backgroundColor: '#fef3c7',
    textColor: '#0f172a',
    images: []
  },
  {
    title: 'Mental Well-being',
    order: 4,
    layout: 'layout4',
    content: {
      mainText: 'The psychological impact of clean bedding is profound. Studies show that fresh sheets significantly improve mood and mental clarity.',
      bulletPoints: [
        'Reduces stress and anxiety',
        'Creates a sense of luxury and self-care',
        'Improves mood and mental clarity',
        'Enhances relaxation and sleep onset',
        'Promotes better morning routines'
      ]
    },
    active: true,
    backgroundColor: '#ffffff',
    textColor: '#0f172a',
    images: []
  }
];

async function seedScienceSections() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing sections
    await ScienceSection.deleteMany({});
    console.log('Cleared existing science sections');

    // Insert new sections
    await ScienceSection.insertMany(sections);
    console.log('✅ Science sections seeded successfully!');
    console.log(`Created ${sections.length} sections`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding science sections:', error);
    process.exit(1);
  }
}

seedScienceSections();
