const Joi = require('joi');

const schemas = {
  movie: Joi.object({
    movieId: Joi.string().required(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    releaseDate: Joi.date().required(),
    genre: Joi.array().items(Joi.string()).required(),
    director: Joi.string().required(),
    cast: Joi.array().items(Joi.string()).required(),
    rating: Joi.number().min(0).max(10).required()
  }),
  user: Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    password: Joi.string().min(6).required()
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),
  google: Joi.object({
    credential: Joi.string().required()
  })
};

module.exports = (type) => (req, res, next) => {
  const schema = schemas[type];
  if (!schema) return res.status(500).json({ message: `Validation schema not found for type: ${type}` });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};