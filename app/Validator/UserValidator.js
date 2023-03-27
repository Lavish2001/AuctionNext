const joi = require('joi');

const signupSchema = joi.object({
    email: joi.string().max(20).min(10).required().email(),
    password: joi.string().min(8).max(20).required(),
    username: joi.string().min(5).max(50).required()
});


const loginSchema = joi.object({
    email: joi.string().required().email(),
    password: joi.string().required()
});

const changePasswordSchema = joi.object({
    current_password: joi.string().required(),
    new_password: joi.string().required()
});

module.exports = {
    signupSchema,
    loginSchema,
    changePasswordSchema
};