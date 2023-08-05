const conn = require("../conn/connection.js");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;



// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to create a new chat room and add members to it

const new_chat_room = (req, res) => {
  const { admin_id, room_name, allVoters, selectedVoters } = req.body;

  // Insert the new chat room into the 'chatrooms' table
  const insertChatroomQuery = 'INSERT INTO chatrooms (admin_id, room_name) VALUES (?, ?)';
  conn.query(insertChatroomQuery, [admin_id, room_name], (err, chatroomResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to create the chat room' });
    }

    const chatroomID = chatroomResult.insertId;

    if (allVoters) {
      // If allVoters is true, insert all voters into the 'chatroomsmembers' table

      // Fetch all voters from the 'teachers' table
      const fetchAllVotersQuery = 'SELECT id FROM teachers';
      conn.query(fetchAllVotersQuery, (err, allVotersResult) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to fetch all voters' });
        }

        const allVoterIDs = allVotersResult.map((voter) => voter.id);

        // Prepare an array of values to be inserted
        const values = allVoterIDs.map((voterID) => [chatroomID, voterID]);

        // Insert multiple members into the 'chatroomsmembers' table
        const insertQuery = 'INSERT INTO chatroomsmembers (chatroomID, memberID) VALUES ?';
        conn.query(insertQuery, [values], (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to add members to the chat room' });
          }

          res.status(201).json({ message: 'Chat room and members added successfully' });
        });
      });
    } else if (selectedVoters && selectedVoters.length > 0) {
      // If selectedVoters is provided and not empty, insert selected voters into the 'chatroomsmembers' table

      // Fetch existing members of the chatroom
      const fetchExistingMembersQuery = 'SELECT memberID FROM chatroomsmembers WHERE chatroomID = ?';
      conn.query(fetchExistingMembersQuery, [chatroomID], (err, existingMembers) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to fetch existing members' });
        }

        const existingMemberIDs = existingMembers.map((member) => member.memberID);

        // Filter out voterIDs that are already associated with the chatroom
        const newVoterIDs = selectedVoters.filter((voterID) => !existingMemberIDs.includes(voterID));

        if (newVoterIDs.length === 0) {
          return res.status(400).json({ error: 'All selected voters are already members of the chatroom' });
        }

        // Prepare an array of values to be inserted
        const values = newVoterIDs.map((voterID) => [chatroomID, voterID]);

        // Insert multiple members into the 'chatroomsmembers' table
        const insertQuery = 'INSERT INTO chatroomsmembers (chatroomID, memberID) VALUES ?';
        conn.query(insertQuery, [values], (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to add members to the chat room' });
          }

          res.status(201).json({ message: 'Chat room and members added successfully' });
        });
      });
    } else {
      return res.status(400).json({ error: 'No voters selected for the chatroom' });
    }
  });
};


// Function to add members to the chat room
// const add_members = (req, res) => {
//     const { admin_id, chatroomID, teacherIDs } = req.body;
  
//     // Fetch existing members of the chatroom
//     const fetchExistingMembersQuery = 'SELECT memberID FROM chatroomsmembers WHERE chatroomID = ?';
//     conn.query(fetchExistingMembersQuery, [chatroomID], (err, existingMembers) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({ error: 'Failed to fetch existing members' });
//       }
  
//       const existingMemberIDs = existingMembers.map((member) => member.memberID);
  
//       // Filter out teacherIDs that are already associated with the chatroom
//       const newTeacherIDs = teacherIDs.filter((teacherID) => !existingMemberIDs.includes(teacherID));
  
//       if (newTeacherIDs.length === 0) {
//         return res.status(400).json({ error: 'All selected teachers are already members of the chatroom' });
//       }
  
//       // Fetch teachers from the 'teachers' table for the newTeacherIDs
//       const fetchTeachersQuery = 'SELECT * FROM teachers WHERE id IN (?)';
//       conn.query(fetchTeachersQuery, [newTeacherIDs], (err, results) => {
//         if (err) {
//           console.error(err);
//           return res.status(500).json({ error: 'Failed to fetch teachers' });
//         }
  
//         if (results.length !== newTeacherIDs.length) {
//           return res.status(404).json({ error: 'One or more teachers not found' });
//         }
  
//         // Prepare an array of values to be inserted
//         const values = results.map((teacher) => [chatroomID, teacher.id]);
  
//         // Insert multiple members into the 'chatroomsmembers' table
//         const insertQuery = 'INSERT INTO chatroomsmembers (chatroomID, memberID) VALUES ?';
//         conn.query(insertQuery, [values], (err, result) => {
//           if (err) {
//             console.error(err);
//             return res.status(500).json({ error: 'Failed to add members to the chat room' });
//           }
  
//           res.status(201).json({ message: 'Members added successfully' });
//         });
//       });
//     });
//   };
  
  

const add_members = (req, res) => {
    const { admin_id, chatroomID, teacherIDs } = req.body;
  
    // Fetch existing members of the chatroom
    const fetchExistingMembersQuery = 'SELECT cm.memberID, t.name FROM chatroomsmembers cm INNER JOIN teachers t ON cm.memberID = t.id WHERE chatroomID = ?';
    conn.query(fetchExistingMembersQuery, [chatroomID], (err, existingMembers) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch existing members' });
      }
  
      const existingMemberIDs = existingMembers.map((member) => member.memberID);
      const duplicateMembers = existingMembers.filter((member) => teacherIDs.includes(member.memberID));
  
      if (duplicateMembers.length > 0) {
        const existingMembersInfo = duplicateMembers.map((member) => ({ id: member.memberID, name: member.name }));
        return res.status(400).json({ error: 'Some teachers are already members of the chatroom', existingMembers: existingMembersInfo });
      }
  
      // Filter out teacherIDs that are already associated with the chatroom
      const newTeacherIDs = teacherIDs.filter((teacherID) => !existingMemberIDs.includes(teacherID));
  
      if (newTeacherIDs.length === 0) {
        return res.status(400).json({ error: 'All selected teachers are already members of the chatroom' });
      }
  
      // Fetch teachers from the 'teachers' table for the newTeacherIDs
      const fetchTeachersQuery = 'SELECT * FROM teachers WHERE id IN (?)';
      conn.query(fetchTeachersQuery, [newTeacherIDs], (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to fetch teachers' });
        }
  
        if (results.length !== newTeacherIDs.length) {
          return res.status(404).json({ error: 'One or more teachers not found' });
        }
  
        // Prepare an array of values to be inserted
        const values = results.map((teacher) => [chatroomID, teacher.id]);
  
        // Insert multiple members into the 'chatroomsmembers' table
        const insertQuery = 'INSERT INTO chatroomsmembers (chatroomID, memberID) VALUES ?';
        conn.query(insertQuery, [values], (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to add members to the chat room' });
          }
  
          res.status(201).json({ message: 'Members added successfully' });
        });
      });
    });
  };



  
// Send New Message


// Function to send a message in the chat room
const send_message = (req, res) => {
    const { sender_id, chatroomID, message } = req.body;
  
    // Check if the sender_id exists in either 'adminuser' or 'teachers' table
    const checkAdminUserQuery = 'SELECT id FROM adminuser WHERE id = ?';
    const checkTeacherQuery = 'SELECT id FROM teachers WHERE id = ?';
  
    conn.query(checkAdminUserQuery, [sender_id], (err, adminUserResult) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to check admin user' });
      }
  
      conn.query(checkTeacherQuery, [sender_id], (err, teacherResult) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to check teacher' });
        }
  
        if (adminUserResult.length === 0 && teacherResult.length === 0) {
          return res.status(404).json({ error: 'Sender not found' });
        }
  
        // Check if the chatroomID exists in the 'chatrooms' table
        const checkChatroomQuery = 'SELECT id FROM chatrooms WHERE id = ?';
        conn.query(checkChatroomQuery, [chatroomID], (err, chatroomResult) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to check chatroom' });
          }
  
          if (chatroomResult.length === 0) {
            return res.status(404).json({ error: 'Chatroom not found' });
          }
  
          // Insert the message into the 'messages' table
          const insertMessageQuery = 'INSERT INTO messages (sender_id, chatroomID, message) VALUES (?, ?, ?)';
          conn.query(insertMessageQuery, [sender_id, chatroomID, message], (err, result) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ error: 'Failed to send the message' });
            }
  
            res.status(201).json({ message: 'Message sent successfully' });
          });
        });
      });
    });
  };

//   Chat Attachments API




// Controller function for uploading attachments to Cloudinary
// const message_attachments = (req, res) => {
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ error: 'No files uploaded' });
//     }
  
//     const uploadPromises = req.files.map(file => {
//       return new Promise((resolve, reject) => {
//         // Upload each file to Cloudinary
//         cloudinary.uploader.upload_stream(
//           {
//             folder: 'chat_attachments', // Folder name where the attachment will be stored
//             public_id: file.originalname, // Use the original file name as the Cloudinary public_id
//             resource_type: 'auto',
//           },
//           (err, result) => {
//             if (err) {
//               console.error(err);
//               reject(err);
//             } else {
//               resolve(result.secure_url);
//             }
//           }
//         ).end(file.buffer);
//       });
//     });
  
//     // Wait for all files to be uploaded to Cloudinary
//     Promise.all(uploadPromises)
//       .then(urls => {
//         res.status(200).json({ success: true, message: 'Attachments uploaded successfully', urls });
//       })
//       .catch(err => {
//         console.error(err);
//         res.status(500).json({ error: 'Failed to upload attachments to Cloudinary' });
//       });
//   };





  

// Controller function for uploading attachments to Cloudinary

// Controller function for uploading attachments to Cloudinary
const message_attachments = (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
  
    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        // Upload each file to Cloudinary
        cloudinary.uploader.upload_stream(
          {
            folder: 'chat_attachments', // Folder name where the attachment will be stored
            public_id: file.originalname, // Use the original file name as the Cloudinary public_id
            resource_type: 'auto',
          },
          (err, result) => {
            if (err) {
              console.error(err);
              reject(err);
            } else {
              resolve(result.secure_url);
             
            }
          }
        ).end(file.buffer);
      });
    });
  
    // Wait for all files to be uploaded to Cloudinary
    Promise.all(uploadPromises)
      .then(urls => {
        // Save attachment information to the database
        const chatroomID = req.body.chatroomID;
        const sender_id = req.body.sender_id;
        const message = req.body.message;
        const timestamp = new Date();
  
        // Insert the message into the 'messages' table
        const insertMessageQuery = 'INSERT INTO messages (sender_id, chatroomID, message, timestamp) VALUES (?, ?, ?, ?)';
        conn.query(insertMessageQuery, [sender_id, chatroomID, message, timestamp], (err, messageResult) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to save the message to the database' });
          }
  
          const message_id = messageResult.insertId;
          const attachments = req.files.map((file, index) => ({
            chatroomID,
            sender_id,
            message_id,
            file_name: file.originalname,
            file_path: urls[index],
            timestamp,
          }));
  
          // Insert the attachments into the 'attachments' table
          const insertAttachmentsQuery = 'INSERT INTO attachments (chatroomID, sender_id, message_id, file_name, file_path, created_at) VALUES ?';
          conn.query(insertAttachmentsQuery, [attachments.map(att => Object.values(att))], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ error: 'Failed to save attachments to the database' });
            }
  
            res.status(200).json({ success: true, message: 'Attachments uploaded and saved successfully', urls });
          });
        });
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Failed to upload attachments to Cloudinary' });
      });
  };

//   Chat history of a Chat Room



// const get_all_messages_of_a_chatroom = (req, res) => {
//     const chatroomID = req.params.chatroomID; // Assuming you are passing the chatroomID in the URL parameter
  
//     // Retrieve all messages of the specified chatroom from the 'messages' table
//     const getMessagesQuery = 'SELECT * FROM messages WHERE chatroomID = ?';
//     conn.query(getMessagesQuery, [chatroomID], (err, messagesResult) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({ error: 'Failed to fetch messages' });
//       }
  
//       if (messagesResult.length === 0) {
//         return res.status(404).json({ error: 'No messages found for the chatroom' });
//       }
  
//       // Retrieve all attachments of the specified chatroom from the 'attachments' table
//       const getAttachmentsQuery = 'SELECT * FROM attachments WHERE chatroomID = ?';
//       conn.query(getAttachmentsQuery, [chatroomID], (err, attachmentResult) => {
//         if (err) {
//           console.error(err);
//           return res.status(500).json({ error: 'Failed to fetch attachments' });
//         }
  
//         const messagesWithAttachments = messagesResult.map(message => {
//           // Filter attachments for the current message
//           const attachments = attachmentResult.filter(attachment => attachment.message_id === message.id);
//           return { ...message, attachments };
//         });
  
//         res.status(200).json({ messages: messagesWithAttachments });
//       });
//     });
//   };
  

const get_all_messages_of_a_chatroom = (req, res) => {
  const chatroomID = req.params.chatroomID; // Assuming you are passing the chatroomID in the URL parameter

  // Retrieve all messages of the specified chatroom from the 'messages' table along with sender names from 'teachers' table
  const getMessagesQuery = `
    SELECT messages.*, teachers.name AS sender_name 
    FROM messages 
    LEFT JOIN teachers ON messages.sender_id = teachers.id 
    WHERE messages.chatroomID = ?
  `;

  conn.query(getMessagesQuery, [chatroomID], (err, messagesResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }

    if (messagesResult.length === 0) {
      return res.status(404).json({ error: 'No messages found for the chatroom' });
    }

    // Retrieve all attachments of the specified chatroom from the 'attachments' table
    const getAttachmentsQuery = 'SELECT * FROM attachments WHERE chatroomID = ?';
    conn.query(getAttachmentsQuery, [chatroomID], (err, attachmentResult) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch attachments' });
      }

      // Merge sender names with messages
      const messagesWithAttachments = messagesResult.map(message => {
        // Filter attachments for the current message
        const attachments = attachmentResult.filter(attachment => attachment.message_id === message.id);
        return { ...message, attachments };
      });

      res.status(200).json({ messages: messagesWithAttachments });
    });
  });
};
  
  

//    get members of a single chat room

// const get_members_of_chat_room = (req, res) => {
//     const chatroomID = req.params.chatroomID; 
  
//     // Retrieve all members of the specified chat room from the 'chatroomsmembers' table
//     const getMembersQuery = 'SELECT memberID FROM chatroomsmembers WHERE chatroomID = ?';
//     conn.query(getMembersQuery, [chatroomID], (err, result) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({ error: 'Failed to fetch chat room members' });
//       }
  
//       if (result.length === 0) {
//         return res.status(404).json({ error: 'No chat room found with the given ID' });
//       }
  
//       const members = [];
//       for (let i = 0; i < result.length; i++) {
//         members.push(result[i].memberID);
//       }
  
//       // Count the total number of members
//       const totalMembers = result.length;
  
//       // Send the response with members and totalMembers
//       res.status(200).json({ totalMembers,members });
//     });
//   };
  


const get_members_of_chat_room = (req, res) => {
    const chatroomID = req.params.chatroomID; // Assuming you are passing the chatroomID in the URL parameter
  
    // Retrieve members and chatroom name of the specified chat room
    const getMembersQuery = `
      SELECT c.room_name, cm.memberID AS id
      FROM chatrooms c
      JOIN chatroomsmembers cm ON c.id = cm.chatroomID
      WHERE cm.chatroomID = ?;
    `;
  
    conn.query(getMembersQuery, [chatroomID], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch chat room members' });
      }
  
      if (result.length === 0) {
        return res.status(404).json({ error: 'No members found for the given chatroom ID' });
      }
  
      const chatroomName = result[0].room_name;
      const memberIDs = result.map((row) => row.id);
      total_members = result.length
  
      // Send the response with chatroom name and member IDs
      res.status(200).json({ chatroomName,total_members, members: memberIDs });
    });
  };
  

//  Get All Chat Rooms

const get_all_chat_rooms = (req, res) => {
    // Retrieve all chat rooms from the 'chatrooms' table
    const getAllChatRoomsQuery = 'SELECT * FROM chatrooms';
    conn.query(getAllChatRoomsQuery, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch chat rooms' });
      }
  
      // Check if there are no chat rooms in the database
      if (result.length === 0) {
        return res.status(404).json({ error: 'No chat rooms found' });
      }
  
      // Send the response with the list of chat rooms
      res.status(200).json({ chatRooms: result });
    });
  };
  

  


module.exports = {
  new_chat_room,
  add_members,
  send_message,
  message_attachments,
  get_all_messages_of_a_chatroom,
  get_members_of_chat_room,
  get_all_chat_rooms
};
