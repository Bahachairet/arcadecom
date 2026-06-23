const {
  findProfileByUserId,
  createProfile,
  findAllApplications,
  findApplicationById,
  updateApplicationStatus,
  updateUserRole,
} = require("./seller.repository");

const apply = async (userId, storeName, description) => {
  const existing = await findProfileByUserId(userId);

  if (existing) {
    throw new Error("You have already applied to become a seller");
  }

  const profile = await createProfile(userId, storeName, description);
  return profile;
};

const getApplications = async () => {
  return findAllApplications();
};

const approveApplication = async (applicationId) => {
  const application = await findApplicationById(applicationId);

  if (!application) {
    throw new Error("Application not found");
  }

  if (application.status !== "PENDING") {
    throw new Error("Application has already been reviewed");
  }

  await updateApplicationStatus(applicationId, "APPROVED");
  await updateUserRole(application.user.id, "seller");

  return { message: "Seller application approved" };
};

const rejectApplication = async (applicationId) => {
  const application = await findApplicationById(applicationId);

  if (!application) {
    throw new Error("Application not found");
  }

  if (application.status !== "PENDING") {
    throw new Error("Application has already been reviewed");
  }

  await updateApplicationStatus(applicationId, "REJECTED");

  return { message: "Seller application rejected" };
};

const getMyProfile = async (userId) => {
  const profile = await findProfileByUserId(userId);
  return profile;
};

module.exports = {
  apply,
  getMyProfile,
  getApplications,
  approveApplication,
  rejectApplication,
};
