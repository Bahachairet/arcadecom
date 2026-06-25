const { placeBid, getBidHistory } = require("./bid.service");

const placeBidHandler = async (req, res) => {
  try {
    const { amount } = req.body;
    const io = req.app.get("io");

    const result = await placeBid(
      req.params.bidProductId,
      req.user.id,
      amount,
      io
    );

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getBidHistoryHandler = async (req, res) => {
  try {
    const result = await getBidHistory(req.params.bidProductId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { placeBidHandler, getBidHistoryHandler };
