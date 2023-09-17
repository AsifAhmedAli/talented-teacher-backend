const conn = require("../conn/connection.js");
const jwt = require("jsonwebtoken");
var request = require("request");
const cloudinary = require("cloudinary").v2;
const nodemailer = require("nodemailer");
const util = require("util");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Toggle double vote feature
function toggle_double_vote(req, res) {
  // Retrieve the current state of the double vote feature from the configuration table
  conn.query(
    "SELECT double_vote_on_off FROM dbl_vote_configuration",
    (error, results) => {
      if (error) {
        console.error("Error retrieving double vote state:", error);
        return res.status(500).json({ error: "Failed to toggle double vote" });
      }

      let currentState;
      if (results && results.length > 0) {
        currentState = results[0].double_vote_on_off;
      } else {
        // If no configuration row exists, assume the double vote feature is disabled
        currentState = "off";
      }

      const newState = currentState === "off" ? "on" : "off"; // Toggle the current state (on -> off, off -> on)

      // Update the double vote state in the configuration table
      conn.query(
        "INSERT INTO dbl_vote_configuration (config_id, double_vote_on_off) VALUES (?, ?) ON DUPLICATE KEY UPDATE double_vote_on_off = ?",
        [1, newState, newState],
        (error) => {
          if (error) {
            console.error("Error toggling double vote:", error);
            return res
              .status(500)
              .json({ error: "Failed to toggle double vote" });
          }

          res.status(200).json({
            message: "Double vote feature toggled successfully",
            enabled: newState,
          });
        }
      );
    }
  );
}
const toggle_registration = (req, res) => {
  conn.query(
    "SELECT status FROM registeration_configuration",
    (error, results) => {
      if (error) {
        console.error("Error retrieving registration state:", error);
        return res
          .status(500)
          .json({ error: "Failed to toggle registration status" });
      }

      let currentState;
      if (results && results.length > 0) {
        currentState = results[0].status;
      } else {
        // If no configuration row exists, assume the double vote feature is disabled
        currentState = "off";
      }

      const newState = currentState === "off" ? "on" : "off"; // Toggle the current state (on -> off, off -> on)

      // Update the double vote state in the configuration table
      conn.query(
        "INSERT INTO registeration_configuration (id, status) VALUES (?, ?) ON DUPLICATE KEY UPDATE status = ?",
        [1, newState, newState],
        (error) => {
          if (error) {
            console.error("Error toggling registration:", error);
            return res
              .status(500)
              .json({ error: "Failed to toggle registration" });
          }

          res.status(200).json({
            message: "Registration feature toggled successfully",
            enabled: newState,
          });
        }
      );
    }
  );
};

const contest_start_step_1 = (req, res) => {
  conn.query(
    "SELECT t.group_id FROM teachers t where t.group_id IS NOT NULL group by t.group_id",
    (error, results) => {
      if (error) {
        // console.error("Error checking email verification status:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      var phasecount = 1;
      var quotient = results.length;
      // var quotient = Math.ceil(x/15);
      while (quotient > 1) {
        quotient = Math.ceil(quotient / 25);
        phasecount++;
      }
      res.status(200).json({
        message: "Number of phases depending upon users",
        number_of_phases: phasecount,
      });
    }
  );
};

const start_contest_step_2 = (req, res) => {
  const all_phases = req.body;
  // console.log(all_phases);
  var result = [];
  var x = 0;
  for (var i in all_phases) {
    result.push([i, all_phases[i]]);
  }

  // console.log(result);
  result.forEach((element) => {
    if (x == 0) {
      conn.query(
        "INSERT INTO contest_setup (phase, status, end_date) VALUES (?, ?, ?)",
        [element[0], 1, element[1]],
        (error) => {
          if (error) {
            console.error("Error setting up contest:", error);
            return res
              .status(500)
              .json({ error: "Failed to setup the contest" });
          }
        }
      );
      x = 1;
    } else {
      conn.query(
        "INSERT INTO contest_setup (phase, status, end_date) VALUES (?, ?, ?)",
        [element[0], 0, element[1]],
        (error) => {
          if (error) {
            console.error("Error setting up contest:", error);
            return res
              .status(500)
              .json({ error: "Failed to setup the contest" });
          }
        }
      );
    }
  });
  res.status(200).json({
    message: "Contest setup successfully",
  });

  // conn.query("UPDATE registeration_configuration SET status = off", (error) => {
  //   if (error) {
  //     console.error("Error in turing of the registration", error);
  //     return res.status(500).json({
  //       error: "Error in turing of the registration",
  //     });
  //   }

  //   // res.status(200).json({
  //   //   message: "Teacher credentials updated successfully",
  //   // });
  // });
};

const contest_next_phase = (req, res) => {
  var options = {
    method: "GET",
    url: `${process.env.BASE_URL}/update-positions/`,
    headers: {},
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    // console.log(response.body);
    conn.query(
      "select * from contest_setup where status = 1",
      (error, results) => {
        if (error) {
          return res.status(500).json({ error: "Internal Server Error2" });
        }
        if (results[0].length == 0) {
          return res.status(500).json({ error: "Internal Server Error2" });
        }
        var i, j;
        // results.forEach((element) => {
        if (results[0].status == 1) {
          j = results[0].id;
          i = j + 1;
          conn.query(
            `update contest_setup set status = 0 where id = ${j}`,
            (error, results) => {
              if (error) {
                return res
                  .status(500)
                  .json({ error: "Internal Server Error3" });
              }
              conn.query(
                `update contest_setup set status = 1 where id = ${i}`,
                (error, results) => {
                  if (error) {
                    return res
                      .status(500)
                      .json({ error: "Internal Server Error4" });
                  }

                  conn.query(
                    "update teachers set position = 0, group_id = NULL where position > 1 || position < 1",
                    (error, results) => {
                      if (error) {
                        // console.error("Error checking email verification status:", error);
                        return res
                          .status(500)
                          .json({ error: "Internal Server Error1" });
                      }
                      conn.query(
                        "SELECT COUNT(*) AS teacher_count FROM teachers where position = 1",
                        (error, results) => {
                          if (error) {
                            console.error(
                              "Error retrieving teacher count from groups:",
                              error
                            );
                            return res
                              .status(500)
                              .json({ error: "Failed to fetch teacher count" });
                          }
                          var teacherCount = results[0].teacher_count;

                          // Calculate the group ID for the teacher
                          conn.query(
                            "SELECT * FROM teachers where position = 1 order by id asc",
                            (error, results) => {
                              if (error) {
                                console.error(
                                  "Error retrieving teacher:",
                                  error
                                );
                                return res.status(500).json({
                                  error: "Failed to fetch teacher",
                                });
                              }
                              var groupID;
                              results.forEach((element) => {
                                groupID = Math.ceil(teacherCount / 25);
                                // console.log(groupID);
                                teacherCount--;
                                conn.query(
                                  `UPDATE teachers SET group_id = ? WHERE  id = ${element.id}`,
                                  [groupID],
                                  (error, results) => {
                                    if (error) {
                                      console.error(
                                        "Error updating group:",
                                        error
                                      );
                                      return res.status(500).json({
                                        error: "Failed to update groupID",
                                      });
                                    }
                                    // Send verification success email
                                    // sendVerificationSuccessEmail(email);
                                  }
                                );
                              });
                              var options = {
                                method: "GET",
                                url: `${process.env.BASE_URL}/update-positions/`,
                                headers: {},
                              };
                              request(options, function (error, response) {
                                if (error) throw new Error(error);
                                conn.query(
                                  "select * from votes",
                                  (error, results) => {
                                    if (error) {
                                      console.log(error);
                                      return res.status(500).json({
                                        error: "Internal Server Error",
                                      });
                                    }
                                    // console.log(results[0].vote_id);
                                    results.forEach((element) => {
                                      conn.query(
                                        `insert into votes_archives (vote_id, voter_name, voter_email, vote_date, teacher_id, hero, voteCount) values(?, ?, ?, ?, ?, ?, ?)`,
                                        [
                                          element.vote_id,
                                          element.voter_name,
                                          element.voter_email,
                                          element.vote_date,
                                          element.teacher_id,
                                          element.hero,
                                          element.voteCount,
                                        ],
                                        (error, results) => {
                                          if (error) {
                                            console.log(error);
                                            return res.status(500).json({
                                              error: "Internal Server Error",
                                            });
                                          }
                                          // console.log(results);
                                        }
                                      );
                                    });

                                    conn.query(
                                      `delete from votes`,
                                      (error, results) => {
                                        if (error) {
                                          console.log(error);
                                          return res.status(500).json({
                                            error: "Internal Server Error",
                                          });
                                        }

                                        conn.query(
                                          `update teachers set vote_count = ?`,
                                          [0],
                                          (error, results) => {
                                            if (error) {
                                              console.log(error);
                                              return res.status(500).json({
                                                error: "Internal Server Error",
                                              });
                                            }
                                            res.status(200).json({
                                              message:
                                                "Groups updated Successfully",
                                              message1:
                                                "Next Phase Started Successfully",
                                            });
                                          }
                                        );
                                        // console.log(results);
                                      }
                                    );

                                    //
                                  }
                                );
                              });
                            }
                          );

                          // Update the teacher's email verification status and set is_email_verified to 1
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
        // });
      }
    );
  });
};
//check contest status
const check_tournament_status = (req, res) => {
  conn.query(
    "select * from contest_setup where status = 1",
    (error, results) => {
      if (error) {
        console.error("Error getting contest status:", error);
        return res.status(500).json({
          error: "Failed to get contest status",
        });
      }
      if (results.length == 0) {
        return res.status(200).json({ msg: "Contest Ended" });
      }
      return res.status(200).json({ Current_phase: results[0].phase });
    }
  );
};

//get winner
// const get_winner = (req, res) => {
//   conn.query(
//     "select * from contest_setup where status = 1",
//     (error, results) => {
//       if (error) {
//         console.error("Error getting contest status:", error);
//         return res.status(500).json({
//           error: "Failed to get contest status",
//         });
//       }
//       if (results.length == 0) {
//         // return res.status(200).json({ msg: "Contest Ended" });
//         conn.query(
//           "select * from teachers where position = 1",
//           (error, results) => {
//             if (error) {
//               console.error("Error getting winner:", error);
//               return res.status(500).json({
//                 error: "Failed to get the winner",
//               });
//             }
//             // console.log(results[0]);
//             delete results[0].password;
//             return res.status(200).json({ winner: results[0] });
//           }
//         );
//       }
//       // return res.status(200).json({ Current_phase: results[0].phase });
//     }
//   );
// };

const get_winner = (req, res) => {
  conn.query(
    "SELECT * FROM contest_setup WHERE status = 1",
    (error, results) => {
      if (error) {
        console.error("Error getting contest status:", error);
        return res.status(500).json({
          error: "Failed to get contest status",
        });
      }
      if (results.length === 0) {
        conn.query(
          "SELECT * FROM teachers WHERE position = 1 ORDER BY vote_count DESC LIMIT 1",
          (error, results) => {
            if (error) {
              console.error("Error getting winner:", error);
              return res.status(500).json({
                error: "Failed to get the winner",
              });
            }
            delete results[0].password;
            return res.status(200).json({ winner: results[0] });
          }
        );
      } else {
        return res.status(200).json({ message: "Contest is still active" });
      }
    }
  );
};

const fetch_groups = (req, res) => {
  conn.query(
    "select t.id from teachers t join profile_pictures pp on pp.teacher_id = t.id where t.is_email_verified = 1 group by t.group_id",
    (error, result) => {
      if (error) {
        return res.status(500).json({ msg: "Could not fetch the details" });
      }
      console.log(result);
      // res.status(200).json({response: result});
    }
  );
};

const check_double_vote_status = (req, res) => {
  // const teacher_id = req.params.id;
  conn.query("select * from dbl_vote_configuration", (error, results) => {
    if (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.status(200).json({ response: results });
  });
};

const fetch_tickets = (req, res) => {
  conn.query(
    "select * from support_tickets order by id desc",
    (error, results) => {
      if (error) {
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.status(200).json({ response: results });
    }
  );
};

// Function to upload attachment to Cloudinary
async function uploadAttachmentToCloudinary(attachment) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      attachment.path,
      { resource_type: "auto", folder: "email_attachments" },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
  });
}

// Function to send email to selected voters or all voters
async function sendEmailToVoters(req, res) {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_SENDER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    const sendTo = req.body.sendTo; // Get the value of 'sendTo' from the request body

    if (sendTo === "selected") {
      let recipientEmails = req.body.selectedVoters; // Get the selectedVoters from the request body

      if (!recipientEmails) {
        return res.status(400).json({
          error: "Please enter at least 1 recipient email to send the email.",
        });
      }

      // Convert a single email to an array
      if (!Array.isArray(recipientEmails)) {
        recipientEmails = [recipientEmails];
      }

      // Prepare email details
      const mailOptions = {
        from: process.env.EMAIL_SENDER,
        to: recipientEmails.join(", "), // Join email addresses with a comma and space
        subject: req.body.subject,
        // text: req.body.text,
        html: req.body.html,
        attachments: [],
      };

      // Upload and attach files to the email
      for (const file of req.files) {
        const attachmentUrl = await uploadAttachmentToCloudinary(file);
        mailOptions.attachments.push({
          filename: file.originalname,
          path: attachmentUrl,
        });
      }

      // Send the email
      await transporter.sendMail(mailOptions);

      res.status(200).json({ message: "Email sent successfully." });
    } else if (sendTo === "all") {
      // Retrieve all voters from the database
      const query = "SELECT voter_email FROM votes";
      const queryPromise = util.promisify(conn.query).bind(conn);
      const result = await queryPromise(query);

      // Extract email addresses from the result
      const recipientEmails = result.map((row) => row.voter_email);

      if (recipientEmails.length === 0) {
        return res
          .status(400)
          .json({ error: "There are no voters to send the email to." });
      }

      // Prepare email details
      const mailOptions = {
        from: process.env.EMAIL_SENDER,
        to: recipientEmails.join(", "), // Join email addresses with a comma and space
        subject: req.body.subject,
        text: req.body.text,
        attachments: [],
      };

      // Upload and attach files to the email
      for (const file of req.files) {
        const attachmentUrl = await uploadAttachmentToCloudinary(file);
        mailOptions.attachments.push({
          filename: file.originalname,
          path: attachmentUrl,
        });
      }

      // Send the email
      await transporter.sendMail(mailOptions);

      res.status(200).json({ message: "Email sent successfully." });
    } else {
      return res.status(400).json({
        error:
          'Invalid value for "sendTo" field. Please select "selected" or "all".',
      });
    }
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email." });
  }
}

// Login for admin
const login_for_admin = (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  // Check if the user exists in the database
  conn.query(
    "SELECT * FROM adminuser WHERE email = ?",
    [email],
    (error, results) => {
      if (error) {
        console.error("Error querying the database:", error);
        return res.status(500).json({ error: "Internal server error." });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      const user = results[0];

      if (password !== user.pass) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      // Generate JWT token with user id as the payload
      const tokenPayload = { id: user.id, email: user.email };
      // console.log(tokenPayload)
      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET_ADMIN);

      // Set the expiration time for the cookie (e.g., 7 days from now)
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7);

      // Store the token in a cookie
      res.cookie("token", token, {
        httpOnly: true, // The cookie cannot be accessed by JavaScript on the client-side
        secure: true, // Set this to true if your application is using HTTPS
        expires: expirationDate, // Set the expiration time for the cookie
        // You can also set additional options like 'domain' or 'path' if needed
      });

      // Send a success response
      res
        .status(200)
        .json({ message: "Login successful.", token, expirationDate });
    }
  );
};

function get_all_voters(req, res) {
  // const page = parseInt(req.query.page) || 1; // Current page number
  // const limit = parseInt(req.query.limit) || 10; // Number of voters per page

  // Calculate the offset based on the page and limit values
  // const offset = (page - 1) * limit;

  // Query the `votes` table to get the total count of voters
  conn.query(
    "SELECT COUNT(*) AS total_count FROM votes",
    (error, countResult) => {
      if (error) {
        console.error("Error fetching voter count:", error);
        return res.status(500).json({ error: "Failed to get voter count" });
      }

      const totalCount = countResult[0].total_count;

      // Query the `votes` table with pagination
      conn.query(
        "SELECT distinct voter_name,voter_email FROM votes",
        (error, results) => {
          if (error) {
            console.error("Error fetching voters:", error);
            return res.status(500).json({ error: "Failed to get voters" });
          }
          // console.log(results);
          // Check if any voters were found
          if (results.length === 0) {
            return res.status(404).json({ error: "No voters found" });
          }

          // Return the totalCount, voters, and pagination information as the response

          res.status(200).json({
            totalCount,
            voters: results,
          });
        }
      );
    }
  );
}

module.exports = {
  check_double_vote_status,
  check_tournament_status,
  toggle_double_vote,
  get_winner,
  contest_start_step_1,
  toggle_registration,
  start_contest_step_2,
  contest_next_phase,
  fetch_groups,
  fetch_tickets,
  get_all_voters,
  sendEmailToVoters,
  login_for_admin,
};
