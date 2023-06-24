const nodemailer = require('nodemailer');


// Create a nodemailer transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to send the confirmation email
function sendConfirmationEmail(email, verificationToken) {
  const confirmationLink = `${process.env.BASE_URL}/confirm-email/${verificationToken}`;

  const emailContent = `
    <h1>Email Confirmation</h1>
    <p>Please click the following link to confirm your email:</p>
    <a href="${confirmationLink}">Click here to verify you Email</a>
  `;

  transporter.sendMail({
    from: process.env.EMAIL_SENDER,
    to: email,
    subject: 'Email Confirmation Required',
    html: emailContent,
  }, (error, info) => {
    if (error) {
      console.error('Error sending confirmation email:', error);
    } else {
      console.log('Confirmation email sent:', info.response);
    }
  });
}

// Function to send the verification success email
function sendVerificationSuccessEmail(email) {
  const emailContent = `
    <h1>Email Verified Successfully</h1>
    <p>Your email (${email}) has been successfully verified and now you can Login </p>
  `;

  transporter.sendMail({
    from: process.env.EMAIL_SENDER,
    to: email,
    subject: 'Email Verified',
    html: emailContent,
  }, (error, info) => {
    if (error) {
      console.error('Error sending verification success email:', error);
    } else {
      console.log('Verification success email sent:', info.response);
    }
  });
}

module.exports = { sendConfirmationEmail, sendVerificationSuccessEmail };
