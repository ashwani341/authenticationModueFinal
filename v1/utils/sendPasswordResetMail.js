const { transporter } = require("../configs/transporter");
const PasswordResetToken = require("../models/PasswordResetToken");
const { generatePasswordResetToken } = require("./jwt/jwtUtil");

async function sendPasswordVerificationMail(user) {
  // console.log("🚀 ~ file: sendVerificationEmail.js:5 ~ sendVerificationEmail ~ user:", user)

  const token = generatePasswordResetToken(user);

  //= store token in the db ====================================================================================================
  const passwordResetToken = await PasswordResetToken.findOneAndUpdate(
    { email: user.email },
    { token },
    { new: true }
  );
  if (!passwordResetToken)
    await PasswordResetToken.create({ email: user.email, token });

  const link =
    "<a href=" +
    `${process.env.FRONTEND_URI}/password/reset?token=${token}` +
    "> Reset Password </a>";

  const mailOptions = {
    from: '"Shahshikant" <shashikantdhamame07@gmail.com>', // sender address
    to: `${user.email}`, // list of receivers
    subject: "Reset Your Account Password", // Subject line
    html: `Dear ${user.email},
            <p>Greetings from C-DAC !!!</p>
            <p>Your username is <strong>${user.username}</strong>.</p>
            <p>In order to reset your password. please click on the link below:</p>
            <p>${link}</p>
            <br/>
            <p>----------------------</p>
            <p>C-DAC, Hyderabad</p>
            <br/>
            <br/>
        `, // html body
  };

  const info = await transporter.sendMail(mailOptions);

  console.log(`Email sent: ${info.messageId}`);
}

module.exports = {
  sendPasswordVerificationMail,
};
