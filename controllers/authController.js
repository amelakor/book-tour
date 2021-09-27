const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {promisify} = require('util');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');


const signToken = id => {
  return jwt.sign({ id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
})
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 *60 * 1000),
        secure: true,
        httpOnly: true
    }

    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);

    user.password = undefined;
  
    res.status(statusCode).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  };

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt
    });

    createSendToken(newUser, 201, res);

    next();
});

exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body;

    // Check if email and password exist
    if(!email || !password) {
       return next(new AppError('Please provide email and password'), 400);

    }

    // If user exists
    const user = await User.findOne({email}).select('+password');

    console.log(user)

    if(!user || !await user.correctPassword(password, user.password))  {
        return next(new AppError('Incorrect email or password', 401));
    }

    // If everithing is OK, send JWT to client
    createSendToken(user, 200, res);
})

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    // Getting token and check if it is there
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
       token = req.headers.authorization.split(' ')[1];
    }

  if(!token) {
      return next(new AppError('You are not logged in.', 401))
  }

    // Validate token - verification
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET )

    // Check user exists
    const freshUser = await User.findById(decoded.id);

    if(!freshUser) {
      return next(new AppError('The user does no longer exist', 401));
    }

    // Check if user changed password after token is there

    if(freshUser.changedPasswordAfter(decoded.iat)) {
        return next (
            new AppError('User recently changed password. Please try again', 401)
        )
    }
    
    // Grant access to the protected route
    req.user = freshUser;
    
    next()
})

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        //roles is array of ['admin', 'lead-guide']
        if(!roles.includes(req.user.role)) {
            return next(new AppError('You dont have permission to perform this action'), 403)
        }

        next()
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {

    //get user based on posted email
    const user = await User.findOne({email: req.body.email});

    if(!user) return next(new AppError('There is no user with that email', 404));
    console.log(user)

    //generate random token
    const resetToken = user.createPasswordTokenReset();

    await user.save({validateBeforeSave: false});

    // send back as an email
    const resetURL = `${req.protocol}://${req.get('host')}/app/v1/users/reset-password/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 minutes)',
            message
        })
    
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email.'
        })
    
    } catch(e) {
        user.passwordResetToken = undifined,
        user.passwordResetExpires = undifined

        await user.save({validateBeforeSave: false});

        return next(new AppError('There was an error sending email. Try again', 500))
    }
    
    
})

exports.resetPassword = catchAsync(async (req, res, next) => {
    // get user based on the token 
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({passwordResetToken : hashedToken, passwordResetExpires: {$gt: Date.now() }});

    // set new password if token has not expired
    if (!user) {
        return next(new AppError('Token is invalid or expired', 400))
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined,
    user.passwordResetExpires = undefined;

    await user.save();

    // update changedPasswordAt property for the current user

    createSendToken(user, 200, res);

    // logged user in, send JWT
})

exports.updatePassword = catchAsync(async (req, res, next) => {
    // get user from collection

    const user = await User.findById(req.user.id).select('+password');

    // check if posted password is correect
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))) return next(new AppError('The password is not correct. Please try again', 400))

    // if is, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    await user.save()
    
    // log in password, send JWT

    createSendToken(user, 200, res);

})