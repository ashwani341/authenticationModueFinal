const Role = require("../models/Role");
const mongoose = require("mongoose");
const { createRes } = require("../utils/createRes");

//= for creating new roles ====================================================================================================
async function createRole(req, res) {
  try {
    const newRole = req.body;

    const result = await Role.create(newRole);
    return res
      .status(200)
      .json(createRes(["Role created successfully."], result));
  } catch (error) {
    console.error(error.message);
    return res.status(500).json(createRes([error.message], null, true));
  }
}

//= for fetching all the roles ====================================================================================================
async function getAllRoles(req, res) {
  try {
    const roles = await Role.find();

    return res
      .status(200)
      .json(createRes(["Fetched all the roles successfully."], roles));
  } catch (error) {
    console.error(error.message);
    return res.status(500).json(createRes([error.message], null, true));
  }
}

//= for fetching single role ====================================================================================================
async function getRoleById(req, res) {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res
        .status(400)
        .json(createRes([`'${id}' is not a valid ObjectId.`], null, true));

    const role = await Role.findById(id);
    // // console.log(
    // // "🚀 ~ file: roleController.js:45 ~ getRoleById ~ role:",
    // // role
    // // );

    if (!role)
      return res
        .status(200)
        .json(createRes([`No record found with id: '${id}'.`], null, true));

    return res
      .status(200)
      .json(createRes([`Role with id '${id}' fetched successfully.`], role));
  } catch (error) {
    console.error(error.message);
    return res.status(500).json(createRes([error.message], null, true));
  }
}

//= for updating an existing role ====================================================================================================
async function updateRole(req, res) {
  try {
    const id = req.params.id;
    const updatedRole = req.body;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res
        .status(400)
        .json(createRes([`'${id}' is not a valid ObjectId.`], null, true));

    const role = await Role.findByIdAndUpdate({ _id: id }, updatedRole, {
      new: true,
    });
    // console.log(
    // "🚀 ~ file: roleController.js:87 ~ updateRole ~ updatedRole:",
    // updatedRole
    // );

    if (!role)
      return res
        .status(200)
        .json(createRes([`No record found with id: '${id}'.`], null, true));

    return res
      .status(200)
      .json(createRes([`Role with id '${id}' updated successfully.`], role));
  } catch (error) {
    console.error(error.message);
    return res.status(500).json(createRes([error.message], null, true));
  }
}

//= for deleting an existing role ====================================================================================================
async function deleteRole(req, res) {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res
        .status(400)
        .json(createRes([`'${id}' is not a valid ObjectId.`], null, true));

    const deletedRole = await Role.findByIdAndRemove({ _id: id });

    if (!deletedRole)
      return res
        .status(200)
        .json(createRes([`No record found with id: '${id}'.`], null, true));

    return res
      .status(200)
      .json(
        createRes([`Role with id '${id}' deleted successfully.`], deletedRole)
      );
  } catch (error) {
    console.error(error.message);
    return res.status(500).json(createRes([error.message], null, true));
  }
}

module.exports = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
};
