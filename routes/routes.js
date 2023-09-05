const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  upload,
  handleUploadError,
  attachment_upload,
  chat_upload,
} = require("../helpers/multer_config.js");

const teachers_controller = require("../controllers/teachers_controller.js");
const admin_controller = require("../controllers/admin_controller.js");
const chat_controller = require("../controllers/chat_controller.js");
const {
  authMiddleware,
  authMiddlewareForAdmin,
} = require("../middlewares/authMiddleware.js");

const {
  validateRegistration,
} = require("../middlewares/validateMiddleware.js");

// new teacher registration route
router.post(
  "/teacher-registration",
  // upload.single("profile_picture"),
  validateRegistration,
  teachers_controller.register_teacher
);
// handleUploadError middleware after the upload middleware
// router.use(handleUploadError);

// photos upload routes
router.post(
  "/teacher/forget-password-send-mail",
  teachers_controller.send_forget_pass_mail
);

router.post(
  "/teacher/update-reset-password",
  teachers_controller.update_reset_password
);

router.post(
  "/teacher/upload-photos",
  // authMiddleware,
  upload.array("photos", 5),
  // validateRegistration,
  teachers_controller.add_photos
);
// handleUploadError middleware after the upload middleware
router.use(handleUploadError);
// handleUploadError middleware after the upload middleware
// router.use(handleUploadError);

// Confirm email
router.get("/confirm-email/:token", teachers_controller.confirm_email);

// Teacher Login Route
router.post(
  "/teacher-login",
  // validateRegistration,
  teachers_controller.login_teacher
);

// get single teacher
router.get(
  "/get-single-teacher/:id",
  authMiddleware,
  teachers_controller.get_single_teacher
);

// get all teachers
router.get(
  "/get-all-teachers",
  // authMiddleware,
  teachers_controller.get_all_teachers
);

//  ###### Edit routes ########

// Edit teacher's credentials and profile picture
router.put(
  "/teacher/edit-teacher/:id",
  authMiddleware,
  // upload.single("profile_picture"),
  // handleUploadError,
  teachers_controller.edit_teacher
);

router.post(
  "/resend/verification-email",
  teachers_controller.resent_verification_email
);
router.get(
  "/teacher/fetch-groups/",
  // upload.single("profile_picture"),
  // handleUploadError,
  admin_controller.fetch_groups
);
router.get(
  "/teacher/getateacher/:id",
  // upload.single("profile_picture"),
  // handleUploadError,
  teachers_controller.getateacher
);
// Change  profile picture
router.put(
  "/teacher/change_profile-picture/:id",
  authMiddleware,
  upload.single("profile_picture"),
  teachers_controller.change_profile_picture
);

router.get(
  "/chat-room-history1/:chatroomID",
  authMiddleware,
  chat_controller.get_all_messages_of_a_chatroom1
);
//  ###### Delete routes ########

// route for deleting a photo

router.delete(
  "/teacher/delete-photo/:id",
  // authMiddleware,
  teachers_controller.delete_photo
);

router.post("/teacher/update-questions", teachers_controller.update_questions);
router.post("/teacher/support", teachers_controller.supportform);
// ####### votes
router.get("/all-votes/:id", teachers_controller.all_votes);
router.get("/all-hero-votes/:id", teachers_controller.all_hero_votes);

// route for casting a normal vote
router.post("/teachers/:id/normal-vote", teachers_controller.normal_vote);
router.get(
  "/check-registration-status",
  teachers_controller.check_registration_status
);
router.get(
  "/check-doutle-vote-status",
  admin_controller.check_double_vote_status
);
router.post("/members-of-a-group", teachers_controller.members_of_a_group);
router.post("/cast-hero-vote/:id", teachers_controller.hero_vote);
router.post(
  "/send-message1",
  authMiddleware,
  teachers_controller.send_message1
);

router.post(
  "/fetch-latest-chatroom-of-a-user/:id",
  authMiddleware,
  chat_controller.latest_chat_room
);
// ###### ADMIN ROUTES ############ //

router.post("/admin/login", admin_controller.login_for_admin);

router.get(
  "/admin/check-doutle-vote-status",
  admin_controller.check_double_vote_status
);
router.post("/admin/toggle-double-vote", admin_controller.toggle_double_vote);
router.post("/admin/toggle-registration", admin_controller.toggle_registration);

//calculate positions based on votes in each group
//onload of every page
router.get("/update-positions", teachers_controller.update_positions);
router.get(
  "/get-all-verified-teachers",
  teachers_controller.get_all_verified_teachers
);

router.get(
  "/all-chat-rooms-of-one-user/:id",
  chat_controller.get_all_chat_rooms_of_one_user
);

router.get("/admin/start-contest", admin_controller.contest_start_step_1);
router.post("/admin/start-contest-1", admin_controller.start_contest_step_2);
router.get("/admin/contest-next-phase", admin_controller.contest_next_phase);
router.get(
  "/admin/check-tournament-status",
  admin_controller.check_tournament_status
);

router.get(
  "/teacher/check-tournament-status",
  authMiddleware,
  teachers_controller.check_tournament_status
);
router.get("/admin/get-winner", admin_controller.get_winner);
router.get("/admin/fetch-tickets", admin_controller.fetch_tickets);

// Get All Voter Route

router.get(
  "/get-all-voters",
  authMiddlewareForAdmin,
  admin_controller.get_all_voters
);

// Route for handling file uploads and sending emails
router.post(
  "/send-emails",
  authMiddlewareForAdmin,
  attachment_upload.array("attachments", 5),
  admin_controller.sendEmailToVoters
);

// ##### CHAT ROUTES ##### //

// creating new chat room
router.post(
  "/admin/new-chat-room",
  authMiddlewareForAdmin,
  chat_controller.new_chat_room
);

// ADD MEMBERS
router.post(
  "/admin/add-members",
  authMiddlewareForAdmin,
  chat_controller.add_members
);

// New Messag Route

router.post(
  "/send-message",
  authMiddlewareForAdmin,
  chat_controller.send_message
);

// attachments route

router.post(
  "/admin/message-attachments",
  authMiddlewareForAdmin,
  chat_upload.array("attachment", 5),
  chat_controller.message_attachments
);

// Chta history of a single chat room

router.get(
  "/chat-room-history/:chatroomID",
  authMiddlewareForAdmin,
  chat_controller.get_all_messages_of_a_chatroom
);

// get members of chat room

router.get(
  "/chat-room/members/:chatroomID",
  authMiddlewareForAdmin,
  chat_controller.get_members_of_chat_room
);

// getAll chat rooms

router.get(
  "/all-chat-rooms",
  authMiddlewareForAdmin,
  chat_controller.get_all_chat_rooms
);

module.exports = router;
