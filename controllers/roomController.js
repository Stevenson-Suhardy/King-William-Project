// Imports
const pool = require("../database");
const Room = require("../models/Room/Room");
const RoomStatus = require("../models/Room/RoomStatus");

/**
 * All Rooms View
 * @param {*} req
 * @param {*} res
 */
const allRoomsView = async (req, res) => {
  try {
    const rooms = await Room.getByFilters({});
    res.render("room/all-rooms", {
      pageTitle: "King William's - Rooms",
      pageStyle: "/css/room/all-rooms.css",
      rooms: rooms,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

/**
 * Edit Room View
 * @param {*} req
 * @param {*} res
 */
const editRoomView = async (req, res) => {
  try {
    const roomId = req.params.id;
    const room = await Room.findById(roomId);
    const statuses = await RoomStatus.findAll();

    res.render("room/edit-room", {
      pageTitle: "King William's - Edit Room",
      pageStyle: "/css/room/edit-room.css",
      room: room,
      statuses: statuses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

/**
 * Update Room Logic
 * @param {*} req
 * @param {*} res
 */
const updateRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    const updatedData = {
      rm_status_id: req.body.status,
      rm_is_occupied: req.body.occupied,
    };

    await Room.update(roomId, updatedData);
    res.redirect("/room/all-rooms");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

/**
 * Search Rooms Logic
 * @param {*} req
 * @param {*} res
 */
const searchRooms = async (req, res) => {
  try {
    const filters = {
      roomNumber: req.query.roomNumber,
      category: req.query.category,
      occupied: req.query.occupied,
      status: req.query.status,
    };
    console.log("Query parameters received:", req.query);
    const rooms = await Room.getByFilters(req.query);
    res.render("room/all-rooms", {
      pageTitle: "King William's - Rooms",
      pageStyle: "/css/room/all-rooms.css",
      rooms: rooms,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

module.exports = { allRoomsView, searchRooms, editRoomView, updateRoom };
