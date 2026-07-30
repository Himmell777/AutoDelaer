const express = require("express");
const cors = require("cors");
const { listDeals, getProductDetail } = require("./db/queries");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "autodealer-backend" });
});

app.get("/api/deals", (req, res, next) => {
  try {
    const deals = listDeals({
      category: req.query.category,
      sortBy: req.query.sortBy,
      minDiscount: req.query.minDiscount,
      minDrop: req.query.minDrop,
    });

    res.json({ count: deals.length, deals });
  } catch (err) {
    next(err);
  }
});

app.get("/api/deals/:id", (req, res, next) => {
  try {
    const detail = getProductDetail(req.params.id);
    if (!detail) {
      res.status(404).json({ error: "Product not found." });
      return;
    }

    res.json(detail);
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AutoDealer API running at http://localhost:${PORT}`);
});
