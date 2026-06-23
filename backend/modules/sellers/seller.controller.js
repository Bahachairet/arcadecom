const sellerService = require("./seller.service");

const getMyProfile = async (req, res) => {
  try {
    const profile = await sellerService.getMyProfile(req.user.id);
    return res.json({ profile });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const apply = async (req, res) => {
  try {
    const { storeName, description } = req.body;

    if (!storeName) {
      return res.status(400).json({ message: "Store name is required" });
    }

    const profile = await sellerService.apply(
      req.user.id,
      storeName,
      description
    );

    return res.status(201).json({ message: "Application submitted", profile });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getApplications = async (req, res) => {
  try {
    const applications = await sellerService.getApplications();
    return res.json({ applications });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const approveApplication = async (req, res) => {
  try {
    const result = await sellerService.approveApplication(req.params.id);
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const rejectApplication = async (req, res) => {
  try {
    const result = await sellerService.rejectApplication(req.params.id);
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getMyProfile,
  apply,
  getApplications,
  approveApplication,
  rejectApplication,
};
