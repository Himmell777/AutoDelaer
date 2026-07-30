const fs = require("fs");
const path = require("path");

const dataFile = path.join(__dirname, "data.json");

const initialData = {
  products: [],
  offers: [],
  dealPosts: [],
  priceHistory: [],
  nextOfferId: 1,
  nextDealPostId: 1,
  nextHistoryId: 1,
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function ensureDataFile() {
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify(initialData, null, 2));
  }
}

function load() {
  ensureDataFile();
  const raw = fs.readFileSync(dataFile, "utf8");
  return { ...clone(initialData), ...JSON.parse(raw) };
}

function save(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

function update(mutator) {
  const data = load();
  const result = mutator(data);
  save(data);
  return result;
}

module.exports = {
  load,
  save,
  update,
};
