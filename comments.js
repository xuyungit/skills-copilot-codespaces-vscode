// Create web server
// ------------------

// Import node modules
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');

// Import models
const { Post } = require('./models/post-model');
const { Comment } = require('./models/comment-model');

// Create express app
const app = express();

// Import config file
const { PORT, DATABASE_URL } = require('./config');

// Log http layer
app.use(morgan('common'));

// Parse request body
app.use(bodyParser.json());

// Serve static files
app.use(express.static('public'));

// ------------------
// RESTful API endpoints
// ------------------

// GET requests to /posts
app.get('/posts', (req, res) => {
  Post
    .find()
    .populate('comments')
    .exec()
    .then(posts => {
      res.json(posts.map(post => post.apiRepr()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// GET requests to /posts/:id
app.get('/posts/:id', (req, res) => {
  Post
    .findById(req.params.id)
    .populate('comments')
    .exec()
    .then(post => {
      res.json(post.apiRepr());
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// POST requests to /posts
app.post('/posts', (req, res) => {
  const requiredFields = ['title', 'content', 'author'];
  for (let i = 0; i < requiredFields.length; i += 1) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  Post
    .create({
      title: req.body.title,
      content: req.body.content,