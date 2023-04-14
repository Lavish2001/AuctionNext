const { User } = model("");
const { UserSession } = model("");
const { signupSchema, loginSchema, changePasswordSchema } = validator("UserValidator");
const { HashPassword, passwordCheck, assignToken, options, compare, verify, verifyPhoneNumber } = helper("Helper");
const { Op } = require("sequelize");


module.exports = class UserController {




  // USER SIGNUP //

  async userSignup(req, res) {

    try {
      const { error, value } = signupSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ 'status': 'failed', 'message': error.message })

      } else {
        await passwordCheck(value.password)
        const hash = await HashPassword(value.password);
        const user = await User.create({ ...value, password: hash });
        const token = await assignToken(user.id)
        return res.status(200).cookie('Token', token, options).json({ 'status': 'success', 'message': 'signup successfull' });
      }
    } catch (err) {
      return res.status(500).json({ 'status': 'failed', 'message': err.message })
    }

  };




  // USER LOGIN //

  async userLogin(req, res) {

    try {
      if (req.cookies.Token) {
        const session = await UserSession.findOne({ where: { token: req.cookies.Token } });
        if (session) {
          return res.status(200).cookie('Token', session.token, options).json({ 'status': 'success', 'message': 'user login successfully' });
        }
      }
      const { error, value } = loginSchema.validate(req.body);
      if (error) {

        return res.status(400).json({ 'status': 'failed', 'message': error.message })
      } else {
        const exist = await User.findOne({ where: { email: value.email } });
        if (exist) {

          await compare(req, res, value.password, exist.password);
          const token = await assignToken(exist.id);
          await UserSession.create({
            user_id: exist.id,
            token: token
          });
          return res.status(200).cookie('Token', token, options).json({ 'status': 'success', 'message': 'user login successfully', 'data': exist });

        } else {
          return res.status(400).json({ 'status': 'failed', 'message': 'invalid email' })
        }
      }
    } catch (err) {
      return res.status(500).json({ 'status': 'failed', 'message': err.message })
    }

  };




  // USER LOGOUT //

  async userLogout(req, res) {
    try {
      const exist = await UserSession.findOne({ where: { token: req.cookies.Token } });
      if (exist) {
        await exist.destroy();
        return res.status(200).json({ 'status': 'success', 'message': 'user logout successfully' })
      } else {
        return res.status(400).json({ 'status': 'failed', 'message': 'please login first' })
      }
    } catch (err) {
      return res.status(500).json({ 'status': 'failed', 'message': err.message })
    }
  }




  // DEACTIVATE ACCOUNT //

  async deactivate(req, res) {
    try {
      const session = await UserSession.destroy({ where: { token: req.cookies.Token } });
      const user = await User.destroy({ where: { id: req.user.id } });
      if (session && user) {
        return res.status(200).json({ 'status': 'success', 'message': 'user account deactivate successfully' })
      } else {
        return res.status(400).json({ 'status': 'failed', 'message': 'ERROR' })
      }
    } catch (err) {
      return res.status(500).json({ 'status': 'failed', 'message': err.message })
    }
  };




  // USER LOGIN COUNT //

  async loginCount(req, res) {
    try {
      const count = await UserSession.count({ where: { user_id: req.user.id } });
      return res.status(200).json({ 'status': 'success', 'data': count })
    } catch (err) {
      return res.status(500).json({ 'status': 'failed', 'message': err.message })
    }
  };




  // LOGOUT FROM ANOTHER DEVICES //

  async logoutOtherDevices(req, res) {
    try {
      await UserSession.destroy({ where: { user_id: req.user.id, token: { [Op.ne]: req.cookies.Token } } });
      return res.status(200).json({ 'status': 'success', 'messages': 'logout from all other devices' })
    } catch (err) {
      return res.status(500).json({ 'status': 'failed', 'message': err.message })
    }
  };





  // CHANGE USER PASSWORD //

  async changePassword(req, res) {

    try {
      const { error, value } = changePasswordSchema.validate(req.body);
      if (error) {

        return res.status(400).json({ 'status': 'failed', 'message': error.message })

      } else {
        await compare(req, res, value.current_password, req.user.password);
        await passwordCheck(value.new_password);

        const hash = await HashPassword(value.new_password);
        req.user.update({
          password: hash
        });

        return res.status(200).json({ 'status': 'success', 'message': 'password changed successfully' })
      }
    } catch (err) {
      return res.status(500).json({ 'status': 'failed', 'message': err.message })
    }
  };





  // SINGLE USER DETAILS //

  async details(req, res) {
    try {
      const detail = await User.findOne({ where: { id: req.user.id }, attributes: { exclude: ['createdAt', 'updatedAt', 'email', 'password'] } });
      return res.status(200).json({ 'status': 'success', 'data': detail })
    } catch (err) {
      return res.status(500).json({ 'status': 'failed', 'message': err.message })
    }
  };




  // LOGIN WITH PHONE NUMBER //

  async otpVerify(req, res) {
    try {
      const { phone, otp } = req.body;
      if (phone) {
        if (phone && otp) {
          return await verify(otp, phone, (err, result) => {
            if (err) {
              return res.status(400).json({ 'status': 'failed', 'message': err.message })
            } else {
              return res.status(200).json({ 'status': 'success', 'message': result })
            }
          });
        } else {
          await verifyPhoneNumber(phone, (err, result) => {
            if (err) {
              return res.status(400).json({ 'status': 'failed', 'message': err.message })
            } else {
              return res.status(200).json({ 'status': 'success', 'message': `OPT Send To This ${phone} Number Please Check This Number And Enter OTP.` })
            };
          });
        }
      } else {
        return res.status(400).json({ 'status': 'ERROR' })
      }
    } catch (err) {
      return res.status(500).json({ 'status': 'failed', 'message': err.message })
    }
  };







};
