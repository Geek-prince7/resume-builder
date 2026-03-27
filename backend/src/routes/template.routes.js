const express = require('express');

const router = express.Router();

const TEMPLATES = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean and bold with blue accents, pill-shaped skill badges, and highlighted summary.',
    preview: '/templates/modern-preview.png',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Ultra-clean with generous whitespace, subtle typography, and muted tones.',
    preview: '/templates/minimal-preview.png',
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Timeless serif layout with traditional formatting, ideal for corporate roles.',
    preview: '/templates/classic-preview.png',
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Sophisticated design with Playfair Display headings and warm stone tones.',
    preview: '/templates/executive-preview.png',
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Vibrant gradient accents, rounded badges, and a modern tech-forward look.',
    preview: '/templates/creative-preview.png',
  },
];

router.get('/', (_req, res) => {
  res.json(TEMPLATES);
});

module.exports = router;
