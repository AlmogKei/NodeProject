const express = require("express");
const { auth } = require("../middlewares/auth");
const { ToyModel, validateToy } = require("../models/toyModel")
const router = express.Router();

// http://localhost:3001/toys?limit=8
// http://localhost:3001/toys?limit=5&page=1
// http://localhost:3001/toys?info

router.get("/", async (req, res) => {
  const limit = Math.min(req.query.limit, 20) || 10;
  const page = req.query.page || 1;
  const _id = req.query.reverse === "yes" ? -1 : 1;
  const query = {};
  if (req.query.catname) {
    query.catname = req.query.catname;
  }
  try {
    const data = await ToyModel.find({ $or: [query] })
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ [req.query.sort || "_id"]: _id });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: err.message });
  }
});

// http://localhost:3001/toys/search?s=lego
router.get("/search", async (req, res) => {
  const limit = Math.min(req.query.limit, 20) || 10;
  const page = req.query.page || 1;
  const _id = req.query.reverse === "yes" ? -1 : 1;
  const query = {};
  if (req.query.s) {
    query.$or = [
      { Name: { $regex: req.query.s, $options: 'i' } },
      { info: { $regex: req.query.s, $options: 'i' } }
    ];
  }
  try {
    const data = await ToyModel.find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ [req.query.sort || "_id"]: _id });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: err.message });
  }
});


// http://localhost:3001/toys/price?min=100
// http://localhost:3001/toys/price?max=50
router.get("/price", async (req, res) => {
  const min = req.query.min || 0;
  const max = req.query.max || Infinity;
  try {
    const data = await ToyModel.find({ price: { $gte: min, $lte: max } })
      .limit(20);
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

// http://localhost:3001/toys/count
router.get("/count", async (req, res) => {
  try {
    const limit = req.query.limit || 5;
    const count = await ToyModel.countDocuments({});
    res.json({ count, pages: Math.ceil(count / limit) });
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

router.post("/", auth, async (req, res) => {
  const validBody = validateToy(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details)
  }
  try {
    const toy = new ToyModel(req.body);
    toy.user_id = req.tokenData._id;
    await toy.save();
    res.status(201).json(toy);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

router.put("/:id", auth, async (req, res) => {
  const validBody = validateToy(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details)
  }
  try {
    const id = req.params.id;
    const data = await ToyModel.updateOne({ _id: id, user_id: req.tokenData._id }, req.body);
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})


router.delete("/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    let data;
    if (req.tokenData.role == "admin" || req.tokenData.role == "superadmin") {
      data = await ToyModel.deleteOne({ _id: id });
    }
    else {
      data = await ToyModel.deleteOne({ _id: id, user_id: req.tokenData._id });
    }
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

// export default
module.exports = router;