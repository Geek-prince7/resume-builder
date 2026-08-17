const ProfileVariant = require('../models/ProfileVariant');

exports.list = async (req, res, next) => {
  try {
    res.json(await ProfileVariant.find({ userId: req.user.userId }).sort({ updatedAt: -1 }));
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const variant = await ProfileVariant.create({ ...req.body, userId: req.user.userId });
    res.status(201).json(variant);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { userId, _id, ...updates } = req.body;
    const variant = await ProfileVariant.findOneAndUpdate(
      { _id: req.params.variantId, userId: req.user.userId },
      updates,
      { new: true, runValidators: true }
    );
    if (!variant) return res.status(404).json({ error: 'Profile variant not found' });
    res.json(variant);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const variant = await ProfileVariant.findOneAndDelete({ _id: req.params.variantId, userId: req.user.userId });
    if (!variant) return res.status(404).json({ error: 'Profile variant not found' });
    res.status(204).end();
  } catch (err) { next(err); }
};
