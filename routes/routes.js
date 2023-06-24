const express = require("express");
const router = express.Router();
const multer = require("multer");
const { upload, handleUploadError } = require("../helpers/multer_config.js");

const teachers_controller = require("../controllers/teachers_controller.js");
const admin_controller = require("../controllers/admin_controller.js");
const { authMiddleware } = require("../middlewares/authMiddleware.js");

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
  // authMiddleware,
  teachers_controller.get_single_teacher
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

// Change  profile picture
router.put(
  "/teacher/change_profile-picture/:id",
  authMiddleware,
  upload.single("profile_picture"),
  teachers_controller.change_profile_picture
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
// ###### ADMIN ROUTES ############ //

router.post("/admin/toggle-double-vote", admin_controller.toggle_double_vote);
router.post("/admin/toggle-registration", admin_controller.toggle_registration);

//calculate positions based on votes in each group
//onload of every page
router.get("/update-positions", teachers_controller.update_positions);
router.get("/admin/start-contest", admin_controller.contest_start_step_1);
router.post("/admin/start-contest-1", admin_controller.start_contest_step_2);
router.get("/admin/contest-next-phase", admin_controller.contest_next_phase);
router.get(
  "/admin/check-tournament-status",
  admin_controller.check_tournament_status
);
router.get("/admin/get-winner", admin_controller.get_winner);
module.exports = router;
