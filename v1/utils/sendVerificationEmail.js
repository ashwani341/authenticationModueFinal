const { transporter } = require("../configs/transporter");
const { generateVerificationToken } = require("./jwt/jwtUtil");

async function sendVerificationEmail(user) {
  // console.log("🚀 ~ file: sendVerificationEmail.js:5 ~ sendVerificationEmail ~ user:", user)

  const token = generateVerificationToken(user);

  const link =
    "<a href=" +
    `${process.env.FRONTEND_URI}/user?token=${token}` +
    "> Click here to Activate </a>";

  const mailOptions = {
    from: '"Shahshikant" <shashikantdhamame07@gmail.com>', // sender address
    to: `${user.email}`, // list of receivers
    subject: "Verify and Activate Your Account", // Subject line
    html: `Dear ${user.email},
            <p>Greetings from C-DAC !!!</p>
            <p>In order to get started. please activate your account by clicking on the link below:</p>
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
  sendVerificationEmail,
};
