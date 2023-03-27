const jwt = require('jsonwebtoken');
const { User } = require('../Models');

const loginAuth = async (req, res, next) => {

  let { Token } = req.cookies;
  try {

    if (Token) {

      // VERIFY TOKEN

      const { userId } = jwt.verify(Token, env('JWT_SECRET_KEY'));

      // GET USER FROM TOKEN

      req.user = await User.findOne({
        where: { id: userId }
      });
      next();
    }
    // IF TOKEN NOT RECEIVE

    else {
      return res.status(400).json({
        'status': 'Failed',
        'message': 'unauthorized user no token'
      })
    }
  } catch (err) {
    return res.status(500).json({ 'status': 'failed', 'message': err.message })
  }
};

module.exports = loginAuth;
