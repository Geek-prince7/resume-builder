const express = require('express');

const router = express.Router();

const TEMPLATES = [
  {
    id: 'modern',
    name: 'Modern',
    category: 'Modern',
    description: 'Clean and bold with blue accents, pill-shaped skill badges, and highlighted summary.',
    preview: '/templates/modern-preview.png',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    category: 'Minimal',
    description: 'Ultra-clean with generous whitespace, subtle typography, and muted tones.',
    preview: '/templates/minimal-preview.png',
  },
  {
    id: 'classic',
    name: 'Classic',
    category: 'Classic',
    description: 'Timeless serif layout with traditional formatting, ideal for corporate roles.',
    preview: '/templates/classic-preview.png',
  },
  {
    id: 'executive',
    name: 'Executive',
    category: 'Executive',
    description: 'Sophisticated design with Playfair Display headings and warm stone tones.',
    preview: '/templates/executive-preview.png',
  },
  {
    id: 'creative',
    name: 'Creative',
    category: 'Creative',
    description: 'Vibrant gradient accents, rounded badges, and a modern tech-forward look.',
    preview: '/templates/creative-preview.png',
  },
  { id: 'editorial', name: 'Editorial', category: 'Elegant', description: 'Magazine-inspired typography with refined burgundy rules and generous rhythm.' },
  { id: 'swiss', name: 'Swiss Grid', category: 'Modern', description: 'Crisp International Style with precise spacing, red accents, and strong hierarchy.' },
  { id: 'atlas', name: 'Atlas', category: 'Professional', description: 'Confident navy and gold treatment designed for consulting and leadership roles.' },
  { id: 'noir', name: 'Noir', category: 'Elegant', description: 'High-contrast monochrome design with dramatic headings and restrained details.' },
  { id: 'ivy', name: 'Ivy League', category: 'Classic', description: 'Traditional academic elegance with forest green details and scholarly typography.' },
  { id: 'coastal', name: 'Coastal', category: 'Minimal', description: 'Airy teal palette with calm spacing and a polished contemporary character.' },
  { id: 'slate', name: 'Slate Pro', category: 'Professional', description: 'Dense, highly readable layout for experienced candidates with substantial content.' },
  { id: 'aurora', name: 'Aurora', category: 'Creative', description: 'Sophisticated violet and cyan accents without compromising ATS readability.' },
  { id: 'monogram', name: 'Monogram', category: 'Executive', description: 'Personal-brand inspired header with elegant copper accents and premium spacing.' },
  { id: 'compact', name: 'Compact One', category: 'Professional', description: 'Space-efficient design optimized for fitting rich experience onto fewer pages.' },
];

router.get('/', (_req, res) => {
  res.json(TEMPLATES);
});

module.exports = router;
