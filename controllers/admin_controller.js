const conn = require("../conn/connection.js");
const jwt = require("jsonwebtoken");
var request = require("request");
// Toggle double vote feature

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
        quotient = Math.ceil(quotient / 15);
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
                                groupID = Math.ceil(teacherCount / 15);
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
                                res.status(200).json({
                                  message: "Groups updated Successfully",
                                  // isEmailVerified: true,
                                  message1: "Next Phase Started Successfully",
                                });
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

module.exports = {
  check_tournament_status,
  toggle_double_vote,
  get_winner,
  contest_start_step_1,
  toggle_registration,
  start_contest_step_2,
  contest_next_phase,
};
