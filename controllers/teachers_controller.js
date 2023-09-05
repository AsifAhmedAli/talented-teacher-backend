const conn = require("../conn/connection.js");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const bcrypt = require("bcryptjs");
const request = require("request");

const {
  sendConfirmationEmail,
  reset_password_email,
  sendVerificationSuccessEmail,
  sendreceipt,
} = require("../helpers/email");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// // Register a new teacher
// function register_teacher(req, res) {
//   const { name, email, password, questions } = req.body;

//   // Check if profile picture is provided
//   if (!req.file) {
//     return res.status(400).json({ error: 'Profile picture is required' });
//   }

//   // Upload the profile picture to Cloudinary
//   cloudinary.uploader.upload(req.file.path, { folder: 'profile_pictures', resource_type: 'auto' }, (error, result) => {
//     if (error) {
//       console.error('Error uploading profile picture:', error);
//       return res.status(500).json({ error: 'Failed to register teacher' });
//     }

//     const profile_picture = result.secure_url;

//     // Generate verification token using JWT
//     const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });

//     // Check if email already exists in the `teachers` table
//     conn.query(
//       'SELECT * FROM teachers WHERE email = ?',
//       [email],
//       (error, results) => {
//         if (error) {
//           console.error('Error checking existing email:', error);
//           return res.status(500).json({ error: 'Failed to register teacher' });
//         }

//         if (results.length > 0) {
//           // Email already registered
//           return res.status(400).json({ error: 'Email already registered' });
//         }

//         // Hash the password
//         bcrypt.hash(password, 10, (error, hashedPassword) => {
//           if (error) {
//             console.error('Error hashing password:', error);
//             return res.status(500).json({ error: 'Failed to register teacher' });
//           }

//           // Insert the teacher's data into the `teachers` table with the hashed password
//           conn.query(
//             'INSERT INTO teachers (name, email, password, profile_picture) VALUES (?, ?, ?, ?)',
//             [name, email, hashedPassword, profile_picture],
//             (error, results) => {
//               if (error) {
//                 console.error('Error registering teacher:', error);
//                 return res.status(500).json({ error: 'Failed to register teacher' });
//               }

//               const teacherId = results.insertId;

//               // Insert the security questions into the `questions` table
//               conn.query(
//                 'INSERT INTO questions (teacher_id, question1, question2, question3) VALUES (?, ?, ?, ?)',
//                 [teacherId, questions[0], questions[1], questions[2]],
//                 (error) => {
//                   if (error) {
//                     console.error('Error inserting security questions:', error);
//                     return res.status(500).json({ error: 'Failed to register teacher' });
//                   }

//                   // Send confirmation email
//                   sendConfirmationEmail(email, verificationToken);

//                   res.status(200).json({ message: 'Registration successful! Please check your email to verify your account.' });
//                 }
//               );
//             }
//           );
//         });
//       }
//     );
//   });
// }

// // Register a new teacher
// function register_teacher(req, res) {
//     const { name, email, password, address, phone } = req.body;

//     // Check if email already exists in the `teachers` table
//     conn.query(
//       'SELECT * FROM teachers WHERE email = ?',
//       [email],
//       (error, results) => {
//         if (error) {
//           console.error('Error checking existing email:', error);
//           return res.status(500).json({ error: 'Failed to register teacher' });
//         }

//         if (results.length > 0) {
//           // Email already registered
//           return res.status(400).json({ error: 'Email already registered' });
//         }

//         // Hash the password
//         bcrypt.hash(password, 10, (error, hashedPassword) => {
//           if (error) {
//             console.error('Error hashing password:', error);
//             return res.status(500).json({ error: 'Failed to register teacher' });
//           }

//           // Generate verification token using JWT
//           const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });

//           // Insert the teacher's data into the `teachers` table with the hashed password and address/phone
//           conn.query(
//             'INSERT INTO teachers (name, email, password, address, phone) VALUES (?, ?, ?, ?, ?)',
//             [name, email, hashedPassword, address, phone],
//             (error, results) => {
//               if (error) {
//                 console.error('Error registering teacher:', error);
//                 return res.status(500).json({ error: 'Failed to register teacher' });
//               }

//               const teacherId = results.insertId;

//               // Send confirmation email
//               sendConfirmationEmail(email, verificationToken);

//               res.status(200).json({ message: 'Registration successful! Please check your email to verify your account.' });
//             }
//           );
//         });
//       }
//     );
//   }

// Register a new teacher
function register_teacher(req, res) {
  const { name, email, password, address, phone, how_hear, othervalue } =
    req.body;
  // console.log(req.body)

  // Check if email already exists in the `teachers` table
  conn.query(
    "SELECT * FROM teachers WHERE email = ?",
    [email],
    (error, results) => {
      if (error) {
        console.error("Error checking existing email:", error);
        return res.status(500).json({ error: "Failed to register teacher" });
      }

      if (results.length > 0) {
        // Email already registered
        return res.status(400).json({ error: "Email already registered" });
      }

      // Hash the password
      bcrypt.hash(password, 10, (error, hashedPassword) => {
        if (error) {
          console.error("Error hashing password:", error);
          return res.status(500).json({ error: "Failed to register teacher" });
        }

        // Generate verification token using JWT
        const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, {
          expiresIn: "1d",
        });

        // Insert the teacher's data into the `teachers` table with the hashed password, address, and phone
        conn.query(
          "INSERT INTO teachers (name, email, password, address, phone, hear_how, other_value) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [name, email, hashedPassword, address, phone, how_hear, othervalue],
          (error, results) => {
            if (error) {
              console.error("Error registering teacher:", error);
              return res
                .status(500)
                .json({ error: "Failed to register teacher" });
            }

            const teacherId = results.insertId;
            const options = {
              method: "POST",
              url: `${process.env.active_campaign_URL}/api/3/contacts`,
              headers: {
                accept: "application/json",
                "content-type": "application/json",
                "Api-Token": `${process.env.ACTIVE_CAMPAIGN_API_KEY}`,
              },
              body: {
                contact: {
                  email: email,
                  firstName: name,
                  phone: phone,
                  fieldValues: [],
                },
              },
              json: true,
            };
            request(options, function (error, response, body) {
              if (error) throw new Error(error);

              // console.log(body);
            });
            // Send confirmation email
            sendConfirmationEmail(name, email, verificationToken);

            res.status(200).json({
              message:
                "Registration successful! Please check your email to verify your account.",
            });
          }
        );
      });
    }
  );
}

// Confirm email
function confirm_email(req, res) {
  const { token } = req.params;

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) {
      console.error("Error verifying email token:", error);
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const { email } = decoded;

    // Check if the email is already verified
    conn.query(
      "SELECT is_email_verified FROM teachers WHERE email = ?",
      [email],
      (error, results) => {
        if (error) {
          console.error("Error checking email verification status:", error);
          return res.status(500).json({ error: "Failed to verify email" });
        }

        // Check if email is already verified
        if (results.length > 0 && results[0].is_email_verified === 1) {
          return res.status(400).json({ error: "Email already verified" });
        }
        // Get the count of teachers in the `groups` table
        conn.query(
          "SELECT COUNT(*) AS teacher_count FROM teachers where is_email_verified = 1",
          (error, results) => {
            if (error) {
              console.error(
                "Error retrieving teacher count from groups:",
                error
              );
              return res
                .status(500)
                .json({ error: "Failed to register teacher" });
            }

            const teacherCount = results[0].teacher_count;
            const groupId = Math.floor(teacherCount / 25) + 1; // Calculate the group ID for the teacher

            // Update the teacher's email verification status and set is_email_verified to 1
            conn.query(
              "UPDATE teachers SET is_email_verified = 1, group_id = ? WHERE email = ?",
              [groupId, email],
              (error, results) => {
                if (error) {
                  console.error(
                    "Error updating email verification status:",
                    error
                  );
                  return res
                    .status(500)
                    .json({ error: "Failed to verify email" });
                }
                conn.query(
                  "SELECT * FROM teachers where email = ?",
                  [email],
                  (error, results) => {
                    if (error) {
                      console.error("Error retrieving teacher:", error);
                      return res.status(500).json({
                        error:
                          "Registered but Failed to save teacher as a contact",
                      });
                    }

                    console.log(results[0].id);
                    conn.query(
                      "insert into chatroomsmembers (chatroomID, memberID) values(1, ?)",
                      [results[0].id],
                      (error, results) => {
                        if (error) {
                          console.error(
                            "Error adding to Wellcome chatroom:",
                            error
                          );
                          return res.status(500).json({
                            error:
                              "Registered but Failed to enter wellcome chatroom.",
                          });
                        }

                        sendVerificationSuccessEmail(email);

                        res.status(200).json({
                          message: "Email confirmed successfully",
                          isEmailVerified: true,
                        });
                      }
                    );
                  }
                );
                // https://res.cloudinary.com/dpn5my0oj/video/upload/v1693000910/setup_ingmsh.mp4
                // Send verification success email
              }
            );
          }
        );
      }
    );
  });
}

const resent_verification_email = (req, res) => {
  const email = req.body.email;
  // console.log(email);
  conn.query(
    "select * from teachers where email = ?",
    [email],
    (error, result) => {
      // console.log(result);
      // console.log(result.length);
      if (result.length == 0) {
        return res
          .status(404)
          .json({ error: "This email address is not registered!" });
      }
      if (error) {
        console.error("Error finding the teacher:", error);
        return res.status(500).json({ error: "Failed to find teacher" });
      }
      const isverified = result[0].is_email_verified;
      // console.log(isverified);
      const name = result[0].name;
      if (isverified) {
        console.error("Error: Your email is already verified");
        return res
          .status(400)
          .json({ error: "Your email is already verified" });
      }

      const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      sendConfirmationEmail(name, email, verificationToken);
      res.status(200).json({
        message:
          "Email sent successfully! Please check your inbox to verify your account.",
      });
    }
  );
};
//   Teacher Login API

// function login_teacher(req, res) {
//     const { email, password } = req.body;

//     // Check if email and password are provided
//     if (!email || !password) {
//       return res.status(400).json({ error: 'Email and password are required' });
//     }

//     // Check if the email exists in the `teachers` table
//     conn.query(
//       'SELECT * FROM teachers WHERE email = ?',
//       [email],
//       (error, results) => {
//         if (error) {
//           console.error('Error checking existing email:', error);
//           return res.status(500).json({ error: 'Failed to login' });
//         }

//         if (results.length === 0) {
//           // Email not found
//           return res.status(404).json({ error: 'Email not found' });
//         }

//         const teacher = results[0];

//         // Check if the password is correct
//         bcrypt.compare(password, teacher.password, (error, isMatch) => {
//           if (error) {
//             console.error('Error comparing passwords:', error);
//             return res.status(500).json({ error: 'Failed to login' });
//           }

//           if (!isMatch) {
//             // Incorrect password
//             return res.status(401).json({ error: 'Incorrect password' });
//           }

//           // Generate JWT token
//           const token = jwt.sign({ id: teacher.id, email: teacher.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

//           // Set the token as a cookie
//           res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // 1 day expiration

//           res.status(200).json({ message: 'Login successful', token });
//         });
//       }
//     );
//   }

function login_teacher(req, res) {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  // Check if the email exists in the `teachers` table
  conn.query(
    "SELECT * FROM teachers WHERE email = ?",
    [email],
    (error, results) => {
      if (error) {
        console.error("Error checking existing email:", error);
        return res.status(500).json({ error: "Failed to login" });
      }

      if (results.length === 0) {
        // Email not found
        return res.status(404).json({ error: "Email not found" });
      }

      const teacher = results[0];

      // Check if the teacher's email is verified
      if (teacher.is_email_verified === 0) {
        return res
          .status(403)
          .json({ error: "Please verify your email before login" });
      }

      // Check if the teacher's account is blocked
      if (teacher.status === 0) {
        return res.status(403).json({
          error:
            "Your account has been blocked by the admin. Please contact the administrator",
        });
      }

      // Check if the password is correct
      bcrypt.compare(password, teacher.password, (error, isMatch) => {
        if (error) {
          console.error("Error comparing passwords:", error);
          return res.status(500).json({ error: "Failed to login" });
        }

        if (!isMatch) {
          // Incorrect password
          return res.status(401).json({ error: "Incorrect password" });
        }

        // Generate JWT token
        const token = jwt.sign(
          { id: teacher.id, email: teacher.email, name: teacher.name },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );

        // Set the token as a cookie
        res.cookie("token", token, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        }); // 1 day expiration

        res
          .status(200)
          .json({ message: "Login successful", token, user: teacher.id });
      });
    }
  );
}

// // Get a single teacher by ID
// function get_single_teacher(req, res) {
//     const teacherId = req.params.id;
//     // const loggedInUserId = req.user.id;

//     // Query the `teachers` table to get the teacher by ID
//     conn.query(
//       'SELECT * FROM teachers WHERE id = ?',
//       [teacherId],
//       (error, results) => {
//         if (error) {
//           console.error('Error fetching teacher:', error);
//           return res.status(500).json({ error: 'Failed to get teacher' });
//         }

//         // Check if the teacher exists
//         if (results.length === 0) {
//           return res.status(404).json({ error: 'Teacher not found' });
//         }

//         // Check if the logged-in user is authorized to access this teacher's information
//         const teacher = results[0];
//         // if (teacher.id !== loggedInUserId) {
//         //   return res.status(403).json({ error: 'Forbidden' });
//         // }

//         // Fetch the associated general_photos for the teacher
//         conn.query(
//           'SELECT * FROM general_photos WHERE teacher_id = ?',
//           [teacherId],
//           (error, photoResults) => {
//             if (error) {
//               console.error('Error fetching general photos:', error);
//               return res.status(500).json({ error: 'Failed to get general photos' });
//             }

//             // Exclude the password field from the teacher data
//             const { password, ...teacherData } = teacher;

//             // Add the general_photos to the teacher data
//             teacherData.general_photos = photoResults;

//             res.status(200).json({ teacher: teacherData });
//           }
//         );
//       }
//     );
//   }

// Get a single teacher by ID
function get_single_teacher(req, res) {
  const teacherId = req.params.id;

  // Query the `teachers` table to get the teacher by ID
  conn.query(
    "SELECT * FROM teachers WHERE id = ?",
    [teacherId],
    (error, results) => {
      if (error) {
        console.error("Error fetching teacher:", error);
        return res.status(500).json({ error: "Failed to get teacher" });
      }

      // Check if the teacher exists
      if (results.length === 0) {
        return res.status(404).json({ error: "Teacher not found" });
      }

      // Fetch the associated profile_picture from the profile_pictures table
      conn.query(
        "SELECT * FROM profile_pictures WHERE teacher_id = ?",
        [teacherId],
        (error, photoResults) => {
          if (error) {
            console.error("Error fetching profile picture:", error);
            return res
              .status(500)
              .json({ error: "Failed to get profile picture" });
          }

          // Exclude the password field from the teacher data
          const { password, ...teacherData } = results[0];

          // Add the profile_picture to the teacher data
          teacherData.profile_picture =
            photoResults.length > 0 ? photoResults[0].picture_url : null;

          // Fetch the associated general_photos for the teacher
          conn.query(
            "SELECT * FROM general_photos WHERE teacher_id = ?",
            [teacherId],
            (error, generalPhotoResults) => {
              if (error) {
                console.error("Error fetching general photos:", error);
                return res
                  .status(500)
                  .json({ error: "Failed to get general photos" });
              }

              // Add the general_photos to the teacher data
              teacherData.general_photos = generalPhotoResults;
              conn.query(
                "SELECT * FROM questions WHERE teacher_id = ?",
                [teacherId],
                (error, questionsResults) => {
                  if (error) {
                    console.error("Error fetching questions:", error);
                    return res
                      .status(500)
                      .json({ error: "Failed to get questions" });
                  }

                  // Add the general_photos to the teacher data
                  teacherData.questions = questionsResults;

                  res.status(200).json({ teacher: teacherData });
                }
              );
            }
          );
        }
      );
    }
  );
}

function getateacher(req, res) {
  const teacherId = req.params.id;

  // Query the `teachers` table to get the teacher by ID
  conn.query(
    "SELECT * FROM teachers WHERE id = ?",
    [teacherId],
    (error, results) => {
      if (error) {
        console.error("Error fetching teacher:", error);
        return res.status(500).json({ error: "Failed to get teacher" });
      }

      // Check if the teacher exists
      if (results.length === 0) {
        return res.status(404).json({ error: "Teacher not found" });
      }

      // Fetch the associated profile_picture from the profile_pictures table
      conn.query(
        "SELECT * FROM profile_pictures WHERE teacher_id = ?",
        [teacherId],
        (error, photoResults) => {
          if (error) {
            console.error("Error fetching profile picture:", error);
            return res
              .status(500)
              .json({ error: "Failed to get profile picture" });
          }

          // Exclude the password field from the teacher data
          const { password, ...teacherData } = results[0];

          // Add the profile_picture to the teacher data
          teacherData.profile_picture =
            photoResults.length > 0 ? photoResults[0].picture_url : null;

          // Fetch the associated general_photos for the teacher
          conn.query(
            "SELECT * FROM general_photos WHERE teacher_id = ?",
            [teacherId],
            (error, generalPhotoResults) => {
              if (error) {
                console.error("Error fetching general photos:", error);
                return res
                  .status(500)
                  .json({ error: "Failed to get general photos" });
              }

              // Add the general_photos to the teacher data
              teacherData.general_photos = generalPhotoResults;
              conn.query(
                "SELECT * FROM questions WHERE teacher_id = ?",
                [teacherId],
                (error, questionsResults) => {
                  if (error) {
                    console.error("Error fetching questions:", error);
                    return res
                      .status(500)
                      .json({ error: "Failed to get questions" });
                  }

                  // Add the general_photos to the teacher data
                  teacherData.questions = questionsResults;

                  res.status(200).json({ teacher: teacherData });
                }
              );
            }
          );
        }
      );
    }
  );
}
// /teacher/getateacher
// get all teachers API

function get_all_teachers(req, res) {
  const page = parseInt(req.query.page) || 1; // Current page number
  const limit = parseInt(req.query.limit); // Number of teachers per page

  // Calculate the offset based on the page and limit values
  const offset = limit ? (page - 1) * limit : undefined;

  // Query the `teachers` table to get the total count of teachers
  conn.query(
    "SELECT COUNT(*) AS total_count FROM teachers",
    (error, countResult) => {
      if (error) {
        console.error("Error fetching teacher count:", error);
        return res.status(500).json({ error: "Failed to get teacher count" });
      }

      const totalCount = countResult[0].total_count;

      // Query the `teachers` table with pagination
      const query = limit
        ? "SELECT * FROM teachers order by group_id asc LIMIT ? OFFSET ?"
        : "SELECT * FROM teachers order by group_id asc";
      const params = limit ? [limit, offset] : [];

      conn.query(query, params, (error, results) => {
        if (error) {
          console.error("Error fetching teachers:", error);
          return res.status(500).json({ error: "Failed to get teachers" });
        }

        // Check if any teachers were found
        if (results.length === 0) {
          return res.status(404).json({ error: "No teachers found" });
        }

        // Create an array to store teacher data
        const teachersData = [];

        // Iterate over the results and fetch associated data for each teacher
        results.forEach((teacher) => {
          const teacherId = teacher.id;

          // Fetch the associated profile_picture from the profile_pictures table
          conn.query(
            "SELECT * FROM profile_pictures WHERE teacher_id = ?",
            [teacherId],
            (error, photoResults) => {
              if (error) {
                console.error("Error fetching profile picture:", error);
                return res
                  .status(500)
                  .json({ error: "Failed to get profile picture" });
              }

              // Exclude the password field from the teacher data
              const { password, ...teacherData } = teacher;

              // Add the profile_picture to the teacher data
              teacherData.profile_picture =
                photoResults.length > 0 ? photoResults[0].picture_url : null;

              // Fetch the associated general_photos for the teacher
              conn.query(
                "SELECT * FROM general_photos WHERE teacher_id = ?",
                [teacherId],
                (error, generalPhotoResults) => {
                  if (error) {
                    console.error("Error fetching general photos:", error);
                    return res
                      .status(500)
                      .json({ error: "Failed to get general photos" });
                  }

                  // Add the general_photos to the teacher data
                  teacherData.general_photos = generalPhotoResults;

                  // Fetch the associated questions for the teacher
                  conn.query(
                    "SELECT * FROM questions WHERE teacher_id = ?",
                    [teacherId],
                    (error, questionsResults) => {
                      if (error) {
                        console.error("Error fetching questions:", error);
                        return res
                          .status(500)
                          .json({ error: "Failed to get questions" });
                      }

                      // Add the questions to the teacher data
                      teacherData.questions = questionsResults;

                      // Add the teacher data to the teachersData array
                      teachersData.push(teacherData);

                      // Check if all teachers have been processed
                      if (teachersData.length === results.length) {
                        // Return the totalCount, teachersData, and pagination information as the response
                        const totalPages = Math.ceil(totalCount / limit);
                        const nextPage = page < totalPages ? page + 1 : null;
                        const prevPage = page > 1 ? page - 1 : null;

                        res.status(200).json({
                          totalCount,
                          totalPages,
                          currentPage: page,
                          nextPage,
                          prevPage,
                          teachers: teachersData,
                        });
                      }
                    }
                  );
                }
              );
            }
          );
        });
      });
    }
  );
}

function get_all_verified_teachers(req, res) {
  const page = parseInt(req.query.page) || 1; // Current page number
  const limit = parseInt(req.query.limit); // Number of teachers per page

  // Calculate the offset based on the page and limit values
  const offset = limit ? (page - 1) * limit : undefined;

  // Query the `teachers` table to get the total count of teachers
  conn.query(
    "SELECT COUNT(*) AS total_count FROM teachers where is_email_verified = 1",
    (error, countResult) => {
      if (error) {
        console.error("Error fetching teacher count:", error);
        return res.status(500).json({ error: "Failed to get teacher count" });
      }

      const totalCount = countResult[0].total_count;

      // Query the `teachers` table with pagination
      const query = limit
        ? "SELECT * FROM teachers where is_email_verified = 1 LIMIT ? OFFSET ?"
        : "SELECT * FROM teachers where is_email_verified = 1";
      const params = limit ? [limit, offset] : [];

      conn.query(query, params, (error, results) => {
        if (error) {
          console.error("Error fetching teachers:", error);
          return res.status(500).json({ error: "Failed to get teachers" });
        }

        // Check if any teachers were found
        if (results.length === 0) {
          return res.status(404).json({ error: "No teachers found" });
        }

        // Create an array to store teacher data
        const teachersData = [];

        // Iterate over the results and fetch associated data for each teacher
        results.forEach((teacher) => {
          const teacherId = teacher.id;

          // Fetch the associated profile_picture from the profile_pictures table
          conn.query(
            "SELECT * FROM profile_pictures WHERE teacher_id = ?",
            [teacherId],
            (error, photoResults) => {
              if (error) {
                console.error("Error fetching profile picture:", error);
                return res
                  .status(500)
                  .json({ error: "Failed to get profile picture" });
              }

              // Exclude the password field from the teacher data
              const { password, ...teacherData } = teacher;

              // Add the profile_picture to the teacher data
              teacherData.profile_picture =
                photoResults.length > 0 ? photoResults[0].picture_url : null;

              // Fetch the associated general_photos for the teacher
              conn.query(
                "SELECT * FROM general_photos WHERE teacher_id = ?",
                [teacherId],
                (error, generalPhotoResults) => {
                  if (error) {
                    console.error("Error fetching general photos:", error);
                    return res
                      .status(500)
                      .json({ error: "Failed to get general photos" });
                  }

                  // Add the general_photos to the teacher data
                  teacherData.general_photos = generalPhotoResults;

                  // Fetch the associated questions for the teacher
                  conn.query(
                    "SELECT * FROM questions WHERE teacher_id = ?",
                    [teacherId],
                    (error, questionsResults) => {
                      if (error) {
                        console.error("Error fetching questions:", error);
                        return res
                          .status(500)
                          .json({ error: "Failed to get questions" });
                      }

                      // Add the questions to the teacher data
                      teacherData.questions = questionsResults;

                      // Add the teacher data to the teachersData array
                      teachersData.push(teacherData);

                      // Check if all teachers have been processed
                      if (teachersData.length === results.length) {
                        // Return the totalCount, teachersData, and pagination information as the response
                        const totalPages = Math.ceil(totalCount / limit);
                        const nextPage = page < totalPages ? page + 1 : null;
                        const prevPage = page > 1 ? page - 1 : null;

                        res.status(200).json({
                          totalCount,
                          totalPages,
                          currentPage: page,
                          nextPage,
                          prevPage,
                          teachers: teachersData,
                        });
                      }
                    }
                  );
                }
              );
            }
          );
        });
      });
    }
  );
}
//   upload photos API by logged-in user

//   function add_photos(req, res) {
//     const teacherId = req.user.id; // Assuming you have implemented user authentication

//     // Get the array of photo files from the request body
//     const photos = req.files;

//     // Check if the number of photos exceeds the limit
//     // if (photos.length > 5) {
//     //   return res.status(400).json({ error: 'Maximum of 5 photos can be uploaded.' });
//     // }

//     // Check if the user has already uploaded 5 photos
//     conn.query(
//       'SELECT COUNT(*) AS photo_count FROM general_photos WHERE teacher_id = ?',
//       [teacherId],
//       (error, results) => {
//         if (error) {
//           console.error('Error retrieving photo count:', error);
//           return res.status(500).json({ error: 'Failed to retrieve photo count' });
//         }

//         const photoCount = results[0].photo_count;

//         // Check if the user has already uploaded 5 photos
//         if (photoCount >= 5) {
//           return res.status(400).json({ error: 'Maximum of 5 photos have already been uploaded.' });
//         }

//         // Array to store the generated photo URLs
//         const photoUrls = [];

//         // Create a folder in Cloudinary for the logged-in user
//         cloudinary.api.create_folder(`general_photos/${teacherId}`, (error, result) => {
//           if (error) {
//             console.error('Error creating folder in Cloudinary:', error);
//             return res.status(500).json({ error: 'Failed to create folder in Cloudinary' });
//           }

//           // Iterate through the photos array
//           for (const photo of photos) {
//             // Upload the photo to Cloudinary inside the folder
//             cloudinary.uploader.upload(photo.path, { folder: `general_photos/${teacherId}` }, (error, result) => {
//               if (error) {
//                 console.error('Error uploading photo:', error);
//                 return res.status(500).json({ error: 'Failed to upload photo' });
//               }

//               // Save the generated photo URL to the array
//               photoUrls.push(result.secure_url);

//               // Check if all photos have been processed
//               if (photoUrls.length === photos.length) {
//                 // Save the photo URLs in the general_photos table
//                 const photoRecords = photoUrls.map((photoUrl) => [teacherId, photoUrl]);

//                 conn.query(
//                   'INSERT INTO general_photos (teacher_id, photo_url) VALUES ?',
//                   [photoRecords],
//                   (error, results) => {
//                     if (error) {
//                       console.error('Error saving photo records:', error);
//                       return res.status(500).json({ error: 'Failed to save photo records' });
//                     }

//                     res.status(200).json({ message: 'Photos added successfully' });
//                   }
//                 );
//               }
//             });
//           }
//         });
//       }
//     );
//   }

function add_photos(req, res) {
  const teacherId = req.body.id; // Assuming you have implemented user authentication
  // console.log(req.body.id);
  // Get the array of photo files from the request body
  const photos = req.files;

  // Check if the user has already uploaded 5 photos
  conn.query(
    "SELECT COUNT(*) AS photo_count FROM general_photos WHERE teacher_id = ?",
    [teacherId],
    (error, results) => {
      if (error) {
        console.error("Error retrieving photo count:", error);
        return res
          .status(500)
          .json({ error: "Failed to retrieve photo count" });
      }

      const photoCount = results[0].photo_count;

      // Check if the user has already uploaded 5 photos
      if (photoCount >= 6) {
        return res
          .status(400)
          .json({ error: "Maximum of 6 photos have already been uploaded." });
      }

      // Array to store the generated photo URLs and public IDs
      const photoData = [];

      // Create a folder in Cloudinary for the logged-in user
      cloudinary.api.create_folder(
        `general_photos/${teacherId}`,
        (error, result) => {
          if (error) {
            console.error("Error creating folder in Cloudinary:", error);
            return res
              .status(500)
              .json({ error: "Failed to create folder in Cloudinary" });
          }

          // Iterate through the photos array
          for (const photo of photos) {
            // Upload the photo to Cloudinary inside the folder
            cloudinary.uploader.upload(
              photo.path,
              { folder: `general_photos/${teacherId}` },
              (error, result) => {
                if (error) {
                  console.error("Error uploading photo:", error);
                  return res
                    .status(500)
                    .json({ error: "Failed to upload photo" });
                }

                // Extract the public ID and secure URL from the Cloudinary response
                const { public_id, secure_url } = result;

                // Save the generated photo URL and public ID to the array
                photoData.push({
                  teacher_id: teacherId,
                  photo_url: secure_url,
                  public_id,
                });

                // Check if all photos have been processed
                if (photoData.length === photos.length) {
                  // Save the photo data in the general_photos table
                  conn.query(
                    "INSERT INTO general_photos (teacher_id, photo_url, public_id) VALUES ?",
                    [
                      photoData.map(({ teacher_id, photo_url, public_id }) => [
                        teacher_id,
                        photo_url,
                        public_id,
                      ]),
                    ],
                    (error, results) => {
                      if (error) {
                        console.error("Error saving photo data:", error);
                        return res
                          .status(500)
                          .json({ error: "Failed to save photo data" });
                      }

                      res
                        .status(200)
                        .json({ message: "Photos added successfully" });
                    }
                  );
                }
              }
            );
          }
        }
      );
    }
  );
}

// // Update teacher credentials including security questions
// function edit_teacher(req, res) {
//     const teacherId = req.params.id; // Assuming the teacher ID is extracted from req.params
//     const loggedInUserId = req.user.id; // Assuming you have implemented user authentication

//     // Check if the logged-in user is authorized to update the teacher's credentials
//     if (teacherId !== String(loggedInUserId)) {
//       return res.status(403).json({ error: 'Forbidden' });
//     }

//     const { name, email, questions } = req.body;

//     // Check if the email has changed
//     if (email) {
//       // Check if the updated email already exists in the `teachers` table
//       conn.query(
//         'SELECT * FROM teachers WHERE email = ? AND id <> ?',
//         [email, teacherId],
//         (error, results) => {
//           if (error) {
//             console.error('Error checking email availability:', error);
//             return res.status(500).json({ error: 'Failed to update teacher credentials' });
//           }

//           if (results.length > 0) {
//             // Email already exists
//             return res.status(400).json({ error: 'Email already taken' });
//           }

//           // Update the teacher's credentials in the `teachers` table including the email
//           conn.query(
//             'UPDATE teachers SET name = ?, email = ? WHERE id = ?',
//             [name, email, teacherId],
//             (error, results) => {
//               if (error) {
//                 console.error('Error updating teacher credentials:', error);
//                 return res.status(500).json({ error: 'Failed to update teacher credentials' });
//               }

//               // Check if questions array is valid and contains three elements
//               if (questions && questions.length === 3) {
//                 // Update the security questions in the `questions` table
//                 conn.query(
//                   'UPDATE questions SET question1 = ?, question2 = ?, question3 = ? WHERE teacher_id = ?',
//                   [questions[0], questions[1], questions[2], teacherId],
//                   (error) => {
//                     if (error) {
//                       console.error('Error updating security questions:', error);
//                       return res.status(500).json({ error: 'Failed to update teacher credentials' });
//                     }

//                     res.status(200).json({ message: 'Teacher credentials updated successfully' });
//                   }
//                 );
//               } else {
//                 // Questions array is invalid or does not contain three elements
//                 res.status(400).json({ error: 'Invalid questions array' });
//               }
//             }
//           );
//         }
//       );
//     } else {
//       // Update the teacher's credentials in the `teachers` table excluding the email
//       conn.query(
//         'UPDATE teachers SET name = ? WHERE id = ?',
//         [name, teacherId],
//         (error, results) => {
//           if (error) {
//             console.error('Error updating teacher credentials:', error);
//             return res.status(500).json({ error: 'Failed to update teacher credentials' });
//           }

//           // Check if questions array is valid and contains three elements
//           if (questions && questions.length === 3) {
//             // Update the security questions in the `questions` table
//             conn.query(
//               'UPDATE questions SET question1 = ?, question2 = ?, question3 = ? WHERE teacher_id = ?',
//               [questions[0], questions[1], questions[2], teacherId],
//               (error) => {
//                 if (error) {
//                   console.error('Error updating security questions:', error);
//                   return res.status(500).json({ error: 'Failed to update teacher credentials' });
//                 }          res.status(200).json({ message: 'Teacher credentials updated successfully' });
//             }
//           );
//         } else {
//           // Questions array is invalid or does not contain three elements
//           res.status(400).json({ error: 'Invalid questions array' });
//         }
//       }
//     );
// }
// }

function edit_teacher(req, res) {
  const teacherId = req.params.id; // Assuming the teacher ID is extracted from req.params

  // console.log(req.body);
  const loggedInUserId = req.body.id; // Assuming you have implemented user authentication

  // Check if the logged-in user is authorized to update the teacher's credentials
  // console.log(loggedInUserId);
  // console.log(teacherId);
  if (teacherId !== String(loggedInUserId)) {
    return res
      .status(403)
      .json({ error: "Forbidden, you are not allowed to make changes" });
  }

  const { name, phone, address } = req.body;

  // Update the teacher's credentials in the `teachers` table
  conn.query(
    "SELECT * FROM teachers WHERE id = ?",
    [teacherId],
    (error, results) => {
      if (error) {
        console.error("Error retrieving teacher data:", error);
        return res
          .status(500)
          .json({ error: "Failed to update teacher credentials" });
      }

      // Check if the teacher exists
      if (results.length === 0) {
        return res.status(404).json({ error: "Teacher not found" });
      }

      const teacher = results[0];

      // Update the teacher's credentials in the `teachers` table
      conn.query(
        "UPDATE teachers SET name = ?, phone = IFNULL(?, phone), address = IFNULL(?, address) WHERE id = ?",
        [name, phone, address, teacherId],
        (error, results) => {
          if (error) {
            console.error("Error updating teacher credentials:", error);
            return res
              .status(500)
              .json({ error: "Failed to update teacher credentials" });
          }
          res.status(200).json({
            message: "Profile updated successfully",
          });
          // Update the security questions in the `questions` table
        }
      );
    }
  );
}
const update_questions = (req, res) => {
  const { question1, question2, question3, question4, question5 } = req.body;
  const teacherId = req.body.id;

  conn.query(
    "SELECT * FROM questions WHERE teacher_id = ?",
    [teacherId],
    (error, results) => {
      if (error) {
        console.error("Error retrieving security questions:", error);
        return res
          .status(500)
          .json({ error: "Failed to update teacher credentials" });
      }

      if (results.length === 0) {
        // No existing questions, insert new questions
        conn.query(
          "INSERT INTO questions (teacher_id, question1, question2, question3, question4, question5) VALUES (?, ?, ?, ?, ?, ?)",
          [teacherId, question1, question2, question3, question4, question5],
          (error) => {
            if (error) {
              console.error("Error adding security questions:", error);
              return res.status(500).json({
                error: "Failed to update teacher credentials",
              });
            }

            res.status(200).json({
              message: "Questions updated successfully",
            });
          }
        );
      } else {
        // Update existing questions
        conn.query(
          "UPDATE questions SET question1 = ?, question2 = ?, question3 = ? , question4 = ?, question5 = ? WHERE teacher_id = ?",
          [question1, question2, question3, question4, question5, teacherId],
          (error) => {
            if (error) {
              console.error("Error updating security questions:", error);
              return res.status(500).json({
                error: "Failed to update teacher credentials",
              });
            }

            res.status(200).json({
              message: "Questions updated successfully",
            });
          }
        );
      }
    }
  );
};

// Change teacher's profile picture API

// function change_profile_picture(req, res) {
//   const teacherId = req.params.id; // Assuming the teacher ID is extracted from req.params
//   const loggedInUserId = req.body.id; // Assuming you have implemented user authentication

//   // Check if the logged-in user is authorized to update the teacher's profile picture
//   if (teacherId !== String(loggedInUserId)) {
//     return res
//       .status(403)
//       .json({ error: "Forbidden, You are not allowed to make changes" });
//   }

//   const { profile_picture } = req.body;
//   // console.log(profile_picture);
//   // Check if profile picture is provided
//   if (!req.file) {
//     return res.status(400).json({ error: "Profile picture is required" });
//   }

//   // Delete the old profile picture from Cloudinary
//   conn.query(
//     "SELECT picture_url FROM profile_pictures WHERE teacher_id = ?",
//     [teacherId],
//     (error, results) => {
//       if (error) {
//         console.error("Error fetching teacher profile picture:", error);
//         return res
//           .status(500)
//           .json({ error: "Failed to change profile picture" });
//       }

//       // Check if the teacher has an existing profile picture
//       const oldProfilePicture = results[0].picture_url;
//       if (oldProfilePicture) {
//         // Delete the old profile picture from Cloudinary
//         const publicId = oldProfilePicture.split("/").pop().split(".")[0];
//         cloudinary.uploader.destroy(publicId, (error, result) => {
//           if (error) {
//             console.error(
//               "Error deleting old profile picture from Cloudinary:",
//               error
//             );
//             return res
//               .status(500)
//               .json({ error: "Failed to change profile picture" });
//           }

//           // Update the teacher's profile picture in the `teachers` table
//           updateProfilePicture();
//         });
//       } else {
//         // No old profile picture to delete, directly update the teacher's profile picture
//         addProfilePicture();
//       }
//     }
//   );

//   // Update the teacher's profile picture in the `teachers` table
//   function updateProfilePicture() {
//     // Upload the new profile picture to Cloudinary
//     cloudinary.uploader.upload(
//       req.file.path,
//       { folder: "profile_pictures", resource_type: "auto" },
//       (error, result) => {
//         if (error) {
//           console.error(
//             "Error uploading profile picture to Cloudinary:",
//             error
//           );
//           return res
//             .status(500)
//             .json({ error: "Failed to change profile picture" });
//         }

//         const newProfilePicture = result.secure_url;
//         const newProfilePictureid = result.public_id;

//         // Update the teacher's profile picture in the `teachers` table
//         conn.query(
//           "UPDATE profile_pictures SET picture_url = ?, public_id = ? WHERE teacher_id = ?",
//           [newProfilePicture, newProfilePictureid, teacherId],
//           (error, results) => {
//             if (error) {
//               console.error("Error updating teacher profile picture:", error);
//               return res
//                 .status(500)
//                 .json({ error: "Failed to change profile picture" });
//             }

//             res
//               .status(200)
//               .json({ message: "Profile picture changed successfully" });
//           }
//         );
//       }
//     );
//   }

//   function addProfilePicture() {
//     // Upload the new profile picture to Cloudinary
//     cloudinary.uploader.upload(
//       req.file.path,
//       { folder: "profile_pictures", resource_type: "auto" },
//       (error, result) => {
//         if (error) {
//           console.error(
//             "Error uploading profile picture to Cloudinary:",
//             error
//           );
//           return res
//             .status(500)
//             .json({ error: "Failed to change profile picture" });
//         }

//         const newProfilePicture = result.secure_url;
//         const newProfilePictureid = result.public_id;

//         // Update the teacher's profile picture in the `teachers` table
//         conn.query(
//           "insert into profile_pictures (picture_url, public_id, teacher_id) values (?, ?, ?)",
//           [newProfilePicture, newProfilePictureid, teacherId],
//           (error, results) => {
//             if (error) {
//               console.error("Error updating teacher profile picture:", error);
//               return res
//                 .status(500)
//                 .json({ error: "Failed to change profile picture" });
//             }

//             res
//               .status(200)
//               .json({ message: "Profile picture uploaded successfully" });
//           }
//         );
//       }
//     );
//   }
// }

// ####### profile picture chnage API #######

function change_profile_picture(req, res) {
  const teacherId = req.params.id; // Assuming the teacher ID is extracted from req.params
  const loggedInUserId = req.user.id; // Assuming you have implemented user authentication

  // Check if the logged-in user is authorized to update the teacher's profile picture
  if (teacherId !== String(loggedInUserId)) {
    return res
      .status(403)
      .json({ error: "Forbidden, You are not allowed to make changes" });
  }

  // Check if profile picture is provided
  if (!req.file) {
    return res.status(400).json({ error: "Profile picture is required" });
  }

  // Delete the old profile picture from Cloudinary and the profile_pictures table
  conn.query(
    "SELECT picture_url, public_id FROM profile_pictures WHERE teacher_id = ?",
    [teacherId],
    (error, results) => {
      if (error) {
        console.error("Error fetching teacher profile picture:", error);
        return res
          .status(500)
          .json({ error: "Failed to change profile picture" });
      }

      // Check if the teacher has an existing profile picture
      const oldProfilePicture = results[0]?.picture_url;
      const publicId = results[0]?.public_id;

      // Delete the old profile picture from Cloudinary
      if (oldProfilePicture && publicId) {
        cloudinary.uploader.destroy(publicId, (error, result) => {
          if (error) {
            console.error(
              "Error deleting old profile picture from Cloudinary:",
              error
            );
            return res
              .status(500)
              .json({ error: "Failed to change profile picture" });
          }

          // Delete the old profile picture from the profile_pictures table
          conn.query(
            "DELETE FROM profile_pictures WHERE teacher_id = ?",
            [teacherId],
            (error) => {
              if (error) {
                console.error(
                  "Error deleting old profile picture from profile_pictures table:",
                  error
                );
                return res
                  .status(500)
                  .json({ error: "Failed to change profile picture" });
              }

              // Update the teacher's profile picture in the profile_pictures table
              updateProfilePicture();
            }
          );
        });
      } else {
        // No old profile picture to delete, directly update the teacher's profile picture
        updateProfilePicture();
      }
    }
  );

  // Update the teacher's profile picture in the profile_pictures table
  function updateProfilePicture() {
    // Upload the new profile picture to Cloudinary
    cloudinary.uploader.upload(
      req.file.path,
      { folder: "profile_pictures", resource_type: "auto" },
      (error, result) => {
        if (error) {
          console.error(
            "Error uploading profile picture to Cloudinary:",
            error
          );
          return res
            .status(500)
            .json({ error: "Failed to change profile picture" });
        }

        const newProfilePicture = result.secure_url;

        // Insert the new profile picture into the profile_pictures table
        conn.query(
          "INSERT INTO profile_pictures (teacher_id, picture_url, public_id) VALUES (?, ?, ?)",
          [teacherId, newProfilePicture, result.public_id],
          (error, results) => {
            if (error) {
              console.error("Error updating teacher profile picture:", error);
              return res
                .status(500)
                .json({ error: "Failed to change profile picture" });
            }

            res
              .status(200)
              .json({ message: "New Profile picture Added successfully" });
          }
        );
      }
    );
  }
}

//

function delete_photo(req, res) {
  const loggedInUserId = req.body.id; // Assuming you have implemented user authentication
  const photoId = req.params.id; // Assuming the photo ID is extracted from the URL parameters

  // Retrieve the photo public ID and teacher ID from the general_photos table
  conn.query(
    "SELECT public_id, teacher_id FROM general_photos WHERE id = ?",
    [photoId],
    (error, results) => {
      if (error) {
        console.error("Error retrieving photo details:", error);
        return res.status(500).json({ error: "Failed to delete photo" });
      }

      // Check if the photo exists
      if (results.length === 0) {
        return res.status(404).json({ error: "Photo not found" });
      }

      const { public_id: publicId, teacher_id: photoTeacherId } = results[0];

      // Check if the logged-in user is the owner of the photo
      const teacherid = parseInt(photoTeacherId);
      const loggeduser = parseInt(loggedInUserId);
      if (teacherid !== loggeduser) {
        return res.status(403).json({
          error: "Forbidden, You are not allowed to delete this photo",
        });
      }

      // Delete the photo from Cloudinary
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          console.error("Error deleting photo from Cloudinary:", error);
          return res.status(500).json({ error: "Failed to delete photo" });
        }

        // Delete the photo record from the general_photos table
        conn.query(
          "DELETE FROM general_photos WHERE id = ?",
          [photoId],
          (error) => {
            if (error) {
              console.error(
                "Error deleting photo from general_photos table:",
                error
              );
              return res.status(500).json({ error: "Failed to delete photo" });
            }

            res.status(200).json({ message: "Photo deleted successfully" });
          }
        );
      });
    }
  );
}

//   ###### normal vote cast API #######

function normal_vote(req, res) {
  const { voter_name, voter_email } = req.body;
  console.log(req.body);
  const teacher_ID = req.params.id;
  const currentDate = new Date().toISOString().split("T")[0]; // Get the current date

  // Check if the visitor has already cast a vote today using the provided email address
  conn.query(
    "SELECT * FROM votes WHERE voter_email = ? AND vote_date = ? and teacher_id = ?",
    [voter_email, currentDate, teacher_ID],
    (error, results) => {
      if (error) {
        console.error("Error checking existing vote:", error);
        return res.status(500).json({ error: "Failed to cast vote" });
      }

      if (results.length > 0) {
        // Visitor has already cast a vote today
        return res.status(400).json({
          error:
            "You have already cast a vote today to this teacher. Please come back tomorrow",
        });
      }

      // Check if the voter is voting for oneself
      conn.query(
        "SELECT id FROM teachers WHERE id = ? AND email = ?",
        [req.params.id, voter_email],
        (error, results) => {
          if (error) {
            console.error("Error checking self-voting:", error);
            return res.status(500).json({ error: "Failed to cast vote" });
          }

          if (results.length > 0) {
            // Voter is voting for oneself
            return res
              .status(400)
              .json({ error: "You cannot vote for yourself" });
          }

          // Retrieve the double vote configuration
          conn.query(
            "SELECT double_vote_on_off FROM dbl_vote_configuration",
            (error, results) => {
              if (error) {
                console.error(
                  "Error retrieving double vote configuration:",
                  error
                );
                return res.status(500).json({ error: "Failed to cast vote" });
              }

              const doubleVoteEnabled = results[0].double_vote_on_off === "on";

              // Update the vote count based on the double vote configuration
              const voteCount = doubleVoteEnabled ? 2 : 1;

              // Insert the vote into the `votes` table
              conn.query(
                "INSERT INTO votes (voter_name, voter_email,vote_date, teacher_id, hero, voteCount) VALUES (?, ?, ?, ?, ?, ?)",
                [
                  voter_name,
                  voter_email,
                  currentDate,
                  req.params.id,
                  0,
                  voteCount,
                ],
                (error, results) => {
                  if (error) {
                    console.error("Error casting vote:", error);
                    return res
                      .status(500)
                      .json({ error: "Failed to cast vote" });
                  }

                  // Update the vote_count in the `teachers` table
                  conn.query(
                    "UPDATE teachers SET vote_count = vote_count + ? WHERE id = ?",
                    [voteCount, req.params.id],
                    (error) => {
                      if (error) {
                        console.error("Error updating vote count:", error);
                        return res
                          .status(500)
                          .json({ error: "Failed to cast vote" });
                      }

                      res
                        .status(200)
                        .json({ message: "Vote cast successfully" });
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
}

//cast hero vote

function hero_vote(req, res) {
  const { voter_name, voter_email } = req.body;
  // console.log(req.body);
  // console.log(voter_email);
  // const teacher_ID = req.params.id;
  const amount = req.body.amount;
  // console.log(amount);

  const currentDate = new Date().toISOString().split("T")[0]; // Get the current date

  // Check if the visitor has already cast a vote today using the provided email address

  // Check if the voter is voting for oneself

  // Retrieve the double vote configuration
  conn.query(
    "SELECT double_vote_on_off FROM dbl_vote_configuration",
    (error, results) => {
      if (error) {
        console.error("Error retrieving double vote configuration:", error);
        return res.status(500).json({ error: "Failed to cast vote" });
      }

      const doubleVoteEnabled = results[0].double_vote_on_off === "on";

      // Update the vote count based on the double vote configuration
      var voteCount = doubleVoteEnabled ? 2 : 1;
      // var newvotecount = voteCount;
      voteCount = voteCount * amount;
      // console.log(voteCount);
      // Insert the vote into the `votes` table
      conn.query(
        "INSERT INTO votes (voter_name, voter_email,vote_date, teacher_id, hero, voteCount) VALUES (?, ?, ?,?, ?,  ?)",
        [voter_name, voter_email, currentDate, req.params.id, 1, voteCount],
        (error, results) => {
          if (error) {
            console.error("Error casting vote:", error);
            return res.status(500).json({ error: "Failed to cast vote" });
          }

          // Update the vote_count in the `teachers` table
          conn.query(
            "UPDATE teachers SET vote_count = vote_count + ? WHERE id = ?",
            [voteCount, req.params.id],
            (error) => {
              if (error) {
                console.error("Error updating vote count:", error);
                return res.status(500).json({ error: "Failed to cast vote" });
              }
              sendreceipt(
                voter_name,
                amount,
                voter_email,
                voteCount,
                req.params.id
              );
              res.status(200).json({ message: "Vote Casted Successfully" });
            }
          );
        }
      );
    }
  );
}
const update_positions = (req, res) => {
  // SELECT * FROM groups g join teachers t on g.teacher_id = t.id order by g.group_id asc
  conn.query(
    "SELECT t.group_id FROM teachers t where t.group_id IS NOT NULL group by t.group_id",
    (error, results) => {
      if (error) {
        // console.error("Error checking email verification status:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      // Check if email is already verified
      // if (results.length > 0 && results[0].is_email_verified === 1) {
      //   return res.status(400).json({ error: "Email already verified" });
      // }
      // console.log(results);

      results.forEach((key) => {
        conn.query(
          `SELECT * FROM teachers t where t.group_id = ${key.group_id} order by t.vote_count desc`,
          (error, results1) => {
            if (error) {
              // console.error("Error checking email verification status:", error);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            var position = 1;
            var vote_counta = 0;
            results1.forEach((key1) => {
              if (vote_counta == key1.vote_count) {
                position--;
              }
              vote_counta = key1.vote_count;
              conn.query(
                `UPDATE teachers t SET t.position = ${position} WHERE t.id = ?`,
                [key1.id],
                (error, results) => {
                  if (error) {
                    console.error("Error updating positions:", error);
                    return res
                      .status(500)
                      .json({ error: "Failed to update Postions" });
                  }
                }
              );
              position++;
              // console.log(key1.vote_count + " ID: " + key1.id);
            });
          }
        );
      });
      res.status(200).json({
        message: "Positions updated successfully",
      });
    }
  );
};
//get normal votes
const all_votes = (req, res) => {
  const teacher_id = req.params.id;
  conn.query(
    "select * from votes where teacher_id = ? and hero = 0 order by vote_id desc limit 10",
    [teacher_id],
    (error, results) => {
      if (error) {
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.status(200).json({ response: results });
    }
  );
};

//get hero votes
const all_hero_votes = (req, res) => {
  const teacher_id = req.params.id;
  conn.query(
    "select * from votes where teacher_id = ? and hero = 1 order by vote_id desc limit 10",
    [teacher_id],
    (error, results) => {
      if (error) {
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.status(200).json({ response: results });
    }
  );
};

const check_registration_status = (req, res) => {
  // const teacher_id = req.params.id;
  conn.query("select * from registeration_configuration", (error, results) => {
    if (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.status(200).json({ response: results });
  });
};
const supportform = (req, res) => {
  const { id, fullname, email, message } = req.body;
  conn.query(
    "insert into support_tickets (teacher_id, fullname, email, message) values (?,?,?,?)",
    [id, fullname, email, message],
    (error, results) => {
      if (error) {
        return res.status(500).json({ error: "Internal Server Error" });
      } else {
        res.status(200).json({ success: "Ticket Submitted Successfully" });
      }
    }
  );
};

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

const members_of_a_group = (req, res) => {
  const group_id = req.body.id;
  conn.query(
    "select * from teachers where group_id = ? order by position asc",
    [group_id],
    (error, results) => {
      if (error) {
        console.error("Error getting contest status:", error);
        return res.status(500).json({
          error: "Failed to get contest status",
        });
      }
      // console.log(results.position);
      results.forEach((element) => {
        console.log(element.position);
      });
      return res.status(200).json({ members: results });
    }
  );
};

//  Get all voters API

const send_message1 = (req, res) => {
  const { sender_id, chatroomID, message } = req.body;

  // Check if the sender_id exists in either 'adminuser' or 'teachers' table
  const checkTeacherQuery = "SELECT id FROM teachers WHERE id = ?";

  conn.query(checkTeacherQuery, [sender_id], (err, teacherResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to check teacher" });
    }

    if (teacherResult.length === 0) {
      return res.status(404).json({ error: "Sender not found" });
    }

    // Check if the chatroomID exists in the 'chatrooms' table
    const checkChatroomQuery = "SELECT id FROM chatrooms WHERE id = ?";
    conn.query(checkChatroomQuery, [chatroomID], (err, chatroomResult) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to check chatroom" });
      }

      if (chatroomResult.length === 0) {
        return res.status(404).json({ error: "Chatroom not found" });
      }

      // Insert the message into the 'messages' table
      const insertMessageQuery =
        "INSERT INTO messages (sender_id, chatroomID, message) VALUES (?, ?, ?)";
      conn.query(
        insertMessageQuery,
        [sender_id, chatroomID, message],
        (err, result) => {
          if (err) {
            console.error(err);
            return res
              .status(500)
              .json({ error: "Failed to send the message" });
          }

          res.status(201).json({ message: "Message sent successfully" });
        }
      );
    });
  });
};
const send_forget_pass_mail = (req, res) => {
  const email = req.body.email;
  // program to generate random strings

  // declare all characters
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 20;
  let token = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    token += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  conn.query(
    "update teachers set reset_code = ? where email = ?",
    [token, email],
    (error, result) => {
      if (error) {
        // console.error(err);
        return res.status(500).json({ error: "Failed to save the token" });
      }
      reset_password_email(token, email);
      return res
        .status(200)
        .json({ message: "Email Sent. Please check your inbox!" });
    }
  );
};

const update_reset_password = (req, res) => {
  const newpass = req.body.newpass;
  const token = req.body.token;
  bcrypt.hash(newpass, 10, (error, hashedPassword) => {
    if (error) {
      console.error("Error hashing password:", error);
      return res.status(500).json({ error: "Failed to register teacher" });
    }
    conn.query(
      "update teachers set password = ? where reset_code = ?",
      [hashedPassword, token],
      (error, result) => {
        if (error) {
          // console.error(err);
          return res
            .status(500)
            .json({ error: "Failed to reset the password" });
        }
        conn.query(
          `update teachers set reset_code = ? where reset_code = ?`,
          [null, token],
          (error, result) => {
            if (error) {
              // console.error(err);
              return res
                .status(500)
                .json({ error: "Failed to save the token" });
            }
            return res
              .status(200)
              .json({ message: "Password updated successfully" });
          }
        );
      }
    );
  });
};
// latest_chat_room;
module.exports = {
  register_teacher,
  all_hero_votes,
  check_tournament_status,
  get_all_verified_teachers,
  confirm_email,
  all_votes,
  login_teacher,
  supportform,
  get_single_teacher,
  get_all_teachers,
  members_of_a_group,
  add_photos,
  edit_teacher,
  change_profile_picture,
  delete_photo,
  update_questions,
  normal_vote,
  send_message1,
  getateacher,
  check_registration_status,
  send_forget_pass_mail,
  update_positions,
  update_reset_password,
  resent_verification_email,
  hero_vote,
};
