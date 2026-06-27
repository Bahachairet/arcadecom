const userRepository = require("./user.repository");

const getAllUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    const filters = {};
    if (role) filters.role = role;
    if (status) filters.status = status;
    if (search) filters.search = search;

    const users = await userRepository.findAllUsers(filters);
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userRepository.findUserById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["active", "suspended", "banned"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const user = await userRepository.findUserById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const updated = await userRepository.updateUserStatus(req.params.id, status);
    return res.json({ user: updated });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllUsers, getUserById, updateUserStatus };
