const express = require('express');
const NoteModel = require('../models/Note');
const { jwtAuth } = require('../middleware/auth');

const router = express.Router();

// List notes
router.get('/', jwtAuth, async (req, res) => {
  try {
    const notes = await NoteModel.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json({ notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Create note
router.post('/', jwtAuth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || typeof content !== 'string') return res.status(400).json({ error: 'Content is required' });
    const note = await NoteModel.create({ user: req.user.userId, content });
    res.json({ note });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Delete note
router.delete('/:id', jwtAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const note = await NoteModel.findOneAndDelete({ _id: id, user: req.user.userId });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Update note
router.put('/:id', jwtAuth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required' });
    }

    const updatedNote = await NoteModel.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { content },
      { new: true } // return updated note
    );

    if (!updatedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ note: updatedNote });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

router.delete("/", jwtAuth, async (req, res) => {
  try {
    await NoteModel.deleteMany({ user: req.user.userId });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete all notes" });
  }
});

module.exports = router;
