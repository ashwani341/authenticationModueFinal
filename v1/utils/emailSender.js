// const nodemailer = require("nodemailer");

// let transporter = nodemailer.createTransport({
//   secure: false,
//   authMethod: "PLAIN",
//   debug: true, // true for 465, false for other ports
//   auth: {
//     user: "", // generated ethereal user
//     pass: "", // generated ethereal password
//     // pass: "cdachyd@123" // generated ethereal password
//   },
//   messageId: "cdaclogin",
// });

// module.exports = {
//   transporter,
// };

// let sendConfirmationMail = async function (email) {
//   let token = await generateMailConfirmationToken(email);
//   // console.log("token .........", token);
//   return new Promise((resolve, reject) => {
//     // console.log(env.verificationURL);
//     // let link =
//     // 	`'<a href=10.244.0.167'/nbf/verify/${token}` +
//     // 	"> Click here to verify </a>";
//     let link =
//       "<a href=" +
//       poeEnv.verificationURL +
//       `/nbf/verify/${token}` +
//       "> Click here to verify </a>";
//     console.log(link);
//     console.log("email.............", email);
//     let mailOptions = {
//       from: '"cdacchain" <cdacchain@cdac.in>',
//       to: email,
//       bcc: "cdacchain@cdac.in",
//       subject: "Verify and Activate Your Account",
//       html: `Dear ${email},
//             <p>Greetings from C-DAC !!!</p>
// 			<p>In order to get started. please activate your account by clicking on the link below:</p>
// 			<br>
//             <p>${link}</p>
//             <br>
// 			<p>If you have any trouble activating your account or if the link doesn't work, please reach out to us at cdacchain@cdac.in and we'll be happy to help.</p>
//             <p>----------------------</p>
//             <p>C-DAC, Hyderabad</p>
//             <br>
//             <br>
//             `,
//     };

//     emailConfig.transporter.sendMail(mailOptions, function (err, info) {
//       if (!err) {
//         console.log("email sent: %s", info.response);
//         resolve(true);
//       } else {
//         console.log("send email failed", err);
//         reject(false);
//       }
//     });
//   });
// };

// let generateMailConfirmationToken = async function (email) {
//   let token = jwt.sign(
//     {
//       exp: Math.floor(Date.now().valueOf() / 1000) + 60 * 60 * 24, // expires in 1 day
//       email: email,
//     },
//     "cdac@123hash"
//   );
//   return token;
// };
