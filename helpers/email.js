const nodemailer = require("nodemailer");

// Create a nodemailer transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to send the confirmation email
function sendConfirmationEmail(name, email, verificationToken) {
  const confirmationLink = `https://talentedteacher.org/verify.html?code=${verificationToken}`;

  const emailContent = `

  Dear ${name}, 
  <br>
  <br>
  Congratulations! You have successfully registered for the Talented Teacher 2023 Competition. 
  We are thrilled to have you as part of this prestigious event that celebrates excellence 
  in education across the USA.
  <br>
  <br>
  To ensure the security of your account and activate your participation, 
  please verify your email address by clicking on the link below:
  <br>
  <br>
  <a href="${confirmationLink}">Click here to verify you Email</a>
  <br>
  <br>
  
  By verifying your email, you will gain full access to your competition profile and receive 
  important updates throughout the competition journey.
  <br>
  <br>
  We understand that being an outstanding 
  educator requires passion, dedication, and innovation.That's why we created the Talented Teacher 
  competition to recognize and reward the exceptional teachers like you, who positively impact the 
  lives of students and communities everyday.
  <br>
  <br>
  Throughout the competition, you will have the opportunity 
  to showcase your teaching prowess, engage with a supportive community of educators, and vie for the 
  coveted title of the 2023 Talented Teacher. We are excited to witness your journey and the inspiring 
  stories you'll share with us.
  <br>
  <br>
  Don't forget to mark your calendar for the upcoming competition phases, 
  important announcements, and voting periods. We'll keep you updated through regular emails and on our website.
  <br>
  <br>
  If you have any questions, concerns, or require assistance at any stage of the competition, please don't hesitate 
  to reach out to us.
  We're here to support you every step of the way.
  <br>
  <br>
  Once again, welcome to the Talented Teacher 
  2023 Competition! We can't wait to witness your talent, dedication, and the positive impact you make as an exceptional educator.
  `;
  Subject: transporter.sendMail(
    {
      from: `Talented Teachers ${process.env.EMAIL_SENDER}`,
      to: email,
      subject: "Welcome to the Talented Teacher 2023 Competition!",
      html: emailContent,
    },
    (error, info) => {
      if (error) {
        console.error("Error sending confirmation email:", error);
      } else {
        console.log("Confirmation email sent:", info.response);
      }
    }
  );
}
// send receipt email
function getMonthName(monthNumber) {
  const date = new Date();
  date.setMonth(monthNumber - 1);

  return date.toLocaleString("en-US", {
    month: "long",
  });
}

function sendreceipt(name, amount, email, vote_countaa, tid) {
  const date = new Date();

  let day = date.getDate();
  let month = date.getMonth() + 1;
  const monthname = getMonthName(month);
  let year = date.getFullYear();

  // This arrangement can be altered based on how we want the date's format to appear.
  let currentDate = `${day}-${monthname}-${year}`;
  // console.log(currentDate);
  const emailContent = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Customer Invoice</title>
  
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,700;1,400&display=swap"
        rel="stylesheet"
      />
  
      <style>
        @media only screen and (min-width: 620px) {
          .mail-body {
            width: 600px;
            margin-left: auto;
            margin-right: auto;
          }
        }
  
        @media only screen and (min-width: 568px) {
          .msg-body {
            width: 568px;
            margin-left: auto;
            margin-right: auto;
          }
        }
  
        .msg-body {
          background-color: white;
          padding: 16px;
        }
  
        .mail-body {
          padding: 16px 0;
        }
  
        body {
          margin: 0;
          padding: 0;
        }
  
        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        p {
          margin-top: 0;
        }
  
        table,
        tr,
        td {
          vertical-align: top;
          border-collapse: collapse;
        }
  
        h1 {
          font-family: "Poppins", sans-serif;
          font-weight: bold;
          color: #172130;
          margin-bottom: 16px;
        }
  
        p {
          font-family: "Poppins", sans-serif;
          font-size: 16px;
          font-weight: normal;
          color: #3d4246;
          margin: 0;
          margin-bottom: 4px;
          line-height: 1.5;
        }
  
        a {
          font-family: "Poppins", sans-serif;
          color: #294b93;
          line-height: 1.2;
        }
  
        a[x-apple-data-detectors="true"] {
          color: inherit !important;
          text-decoration: none !important;
        }
  
        .container {
          width: 100%;
        }
  
        :root {
          --primary: #172130;
          --dark: #020c16;
          --dark2: #414850;
          --dark3: #7f858b;
          --primarylight: #e4efff;
          --greenlight: #eaf0f2;
  
          --success: #198754;
          --danger: #dc3545;
          --warning: #ffc107;
        }
      </style>
    </head>
  
    <body>
      <table
        style="
          border-collapse: collapse;
          table-layout: fixed;
          border-spacing: 0;
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
          vertical-align: top;
          min-width: 320px;
          margin: 0 auto;
          width: 100%;
        "
        cellpadding="0"
        cellspacing="0"
      >
        <tbody>
          <tr style="vertical-align: top">
            <td
              style="
                word-break: break-word;
                border-collapse: collapse !important;
                vertical-align: top;
              "
            >
              <div class="container">
                <div class="mail-body">
                  <div class="row">
                    <div
                      style="
                        border-collapse: collapse;
                        display: table;
                        width: 100%;
                        text-align: center;
                      "
                    >
                      <div
                        style="
                          display: table-cell;
                          border: none;
                          padding-bottom: 10px;
                          vertical-align: middle;
                          text-align: center;
                        "
                      >
                        <a href="" style="display: inline-block">
                          <img
                            src="https://res.cloudinary.com/dpn5my0oj/image/upload/v1690890047/talented-teacher-logo_y1wwgs.png"
                            alt="Logo here"
                            height="65"
                          />
                        </a>
                      </div>
                    </div>
                  </div>
                  <div class="msg-body">
                    <div
                      style="
                        border-collapse: collapse;
                        display: table;
                        width: 100%;
                        text-align: left;
                      "
                    >
                      <div style="display: table-cell; border: none">
                        <!-- <img src="./images/receipt_black_24dp.svg" style="display: block; margin: auto; margin-bottom: 8px"
                        height="50" alt="" /> -->
                        <h1
                          style="
                            font-size: 20px;
                            text-align: center;
                            color: #414850;
                            font-family: 'Poppins', sans-serif;
                            font-weight: normal;
                          "
                        >
                          Thank You for Your Donation.
                        </h1>
  
                        <table style="width: 100%">
                          <tr>
                            <td
                              style="
                                color: #414850;
                                font-size: 14px;
                                font-family: 'Poppins';
                                padding: 6px 3px;
                              "
                            >
                              ${name} (${email})
                            </td>
                            <td
                              style="
                                color: #414850;
                                font-size: 14px;
                                font-family: 'Poppins';
                                padding: 6px 3px;
                              "
                            >
                              on Date
                            </td>
                          </tr>
                          <tr>
                            <td
                              style="
                                color: #414850;
                                font-size: 14px;
                                font-family: 'Poppins';
                                padding: 3px;
                              "
                            >
                              Vote# 414222
                            </td>
                            <td
                              style="
                                color: #414850;
                                font-size: 14px;
                                font-family: 'Poppins';
                                padding: 3px;
                              "
                            >
                              ${currentDate}
                            </td>
                          </tr>
                          <tr>
                            <td
                              style="
                                color: #414850;
                                font-size: 14px;
                                font-family: 'Poppins';
                                padding: 3px;
                                padding-top: 12px;
                                border-bottom: 1px solid #000;
                              "
                            >
                              ${vote_countaa} votes
                            </td>
                            <td
                              style="
                                color: #414850;
                                font-size: 14px;
                                font-family: 'Poppins';
                                padding: 3px;
                                padding-top: 12px;
                                border-bottom: 1px solid #000;
                              "
                            >
                              $${amount}
                            </td>
                          </tr>
                          <tr>
                            <td
                              style="
                                color: #414850;
                                font-size: 14px;
                                font-family: 'Poppins';
                                padding: 3px;
                                text-align: right;
                              "
                            >
                              Total
                            </td>
                            <td
                              style="
                                color: #414850;
                                font-size: 14px;
                                font-family: 'Poppins';
                                padding: 3px;
                              "
                            >
                            $${amount}
                            </td>
                          </tr>
                        </table>
                        <div style="text-align: center">
                          <a
                            href="https://talentedteacher.org/profile_third_party.html?id=${tid}"
                            style="
                              display: inline-block;
                              padding: 8px 26px;
                              background-color: #fff;
                              color: #000;
                              text-decoration: none;
                              margin: 16px 0;
                              font: normal 18px 'Poppins', sans-serif;
                              border: 1px solid #000;
                              text-transform: uppercase;
                            "
                          >
                            Vote Again
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div
                      style="
                        border-collapse: collapse;
                        display: table;
                        width: 100%;
                        text-align: center;
                      "
                    >
                      <div style="display: table-cell; border: none">
                        <!-- <p style="
                            margin-top: 16px;
                            font-size: 16px;
                            color: #414850;
                            font-family: 'Poppins', sans-serif;
                          ">
                        <strong>Phone:</strong> 8002444040 |
                        <strong>Email:</strong> cs@saee.sa
                      </p> -->
                        <p
                          style="
                            font-size: 12px;
                            margin-bottom: 0;
                            margin-top: 16px;
                            color: #414850;
                            font-family: 'Poppins', sans-serif;
                          "
                        >
                          Contributions to CGCFcares (EIN: 20‑3887011) from U.S.
                          donors are tax-deductible to the extent allowed by law.
                          No goods or services were provided to you in exchange
                          for your contribution. Grants to qualifying teachers
                          will be granted within thirty (30) days after the
                          conclusion of the Competition. Please keep this email as
                          a receipt for tax purposes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </body>
  </html>
  `;
  Subject: transporter.sendMail(
    {
      from: process.env.EMAIL_SENDER,
      to: email,
      subject: "Payment Receipt!",
      html: emailContent,
    },
    (error, info) => {
      if (error) {
        console.error("Error sending confirmation email:", error);
      } else {
        console.log("Confirmation email sent:", info.response);
      }
    }
  );
}
// Function to send the verification success email
function sendVerificationSuccessEmail(email) {
  const emailContent = `
    <h1>Email Verified Successfully</h1>
    <p>Your email (${email}) has been successfully verified and now you can Login </p>
  `;

  transporter.sendMail(
    {
      from: process.env.EMAIL_SENDER,
      to: email,
      subject: "Email Verified",
      html: emailContent,
    },
    (error, info) => {
      if (error) {
        console.error("Error sending verification success email:", error);
      } else {
        console.log("Verification success email sent:", info.response);
      }
    }
  );
}

function reset_password_email(token, email) {
  const emailContent = `
    <h1>Password Reset</h1>
    <p>Please click on the <a href="https://talentedteacher.org/reset_password.html?token=${token}">link</a> to reset your password.</p>
  `;

  transporter.sendMail(
    {
      from: process.env.EMAIL_SENDER,
      to: email,
      subject: "Reset Password",
      html: emailContent,
    },
    (error, info) => {
      if (error) {
        console.error("Error sending verification success email:", error);
      } else {
        console.log("Verification success email sent:", info.response);
      }
    }
  );
}
module.exports = {
  sendConfirmationEmail,
  sendVerificationSuccessEmail,
  sendreceipt,
  reset_password_email,
};
