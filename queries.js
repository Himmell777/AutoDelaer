const store = require("./index");

function now() {
  return new Date().toISOString();
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getProductOffers(data, productId) {
  return data.offers.filter((offer) => offer.productId === productId && offer.isActive);
}

function getLowestTotalPrice(data, productId) {
  const offers = getProductOffers(data, productId);
  if (offers.length === 0) return 0;
  return Math.min(...offers.map((offer) => offer.totalPrice));
}

function toApiProduct(data, product) {
  const offers = getProductOffers(data, product.id);
  const totals = offers.map((offer) => offer.totalPrice);
  const lowestPrice = totals.length ? Math.min(...totals) : 0;
  const averagePrice = totals.length
    ? Math.round(totals.reduce((sum, price) => sum + price, 0) / totals.length)
    : 0;
  const originalPrice = toNumber(product.originalPrice);

  const discountRate =
    originalPrice > 0 && lowestPrice > 0
      ? Math.max(0, Math.round((1 - lowestPrice / originalPrice) * 100))
      : 0;

  const history = data.priceHistory
    .filter((row) => row.productId === product.id)
    .sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));
  const firstHistoryPrice = history.length ? history[0].lowestTotalPrice : lowestPrice;

  const priceDropRate =
    firstHistoryPrice > lowestPrice && lowestPrice > 0
      ? Math.round(((firstHistoryPrice - lowestPrice) / firstHistoryPrice) * 100)
      : 0;

  return {
    id: product.id,
    name: product.name,
    category: product.category,
    image: product.image,
    originalPrice,
    lowestPrice,
    averagePrice,
    discountRate,
    priceDropRate,
    offerCount: offers.length,
    dealPostCount: data.dealPosts.filter((post) => post.productId === product.id).length,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

function upsertProduct(product) {
  return store.update((data) => {
    const current = data.products.find((item) => item.id === product.id);

    if (current) {
      current.name = product.name;
      current.category = product.category || current.category || "etc";
      current.image = product.image || current.image || "";
      if (toNumber(product.originalPrice) > 0) {
        current.originalPrice = toNumber(product.originalPrice);
      }
      current.updatedAt = now();
      return current;
    }

    const created = {
      id: product.id,
      name: product.name,
      category: product.category || "etc",
      image: product.image || "",
      originalPrice: toNumber(product.originalPrice),
      createdAt: now(),
      updatedAt: now(),
    };

    data.products.push(created);
    return created;
  });
}

function upsertOffer(offer) {
  const price = toNumber(offer.price);
  const shippingFee = toNumber(offer.shippingFee);
  const totalPrice = price + shippingFee;

  const result = store.update((data) => {
    const current = data.offers.find(
      (item) => item.productId === offer.productId && item.sellerName === offer.sellerName
    );

    if (current) {
      current.price = price;
      current.shippingFee = shippingFee;
      current.totalPrice = totalPrice;
      current.url = offer.url || "";
      current.isActive = true;
      current.collectedAt = now();
    } else {
      data.offers.push({
        id: data.nextOfferId++,
        productId: offer.productId,
        sellerName: offer.sellerName,
        price,
        shippingFee,
        totalPrice,
        url: offer.url || "",
        isActive: true,
        collectedAt: now(),
      });
    }

    return getLowestTotalPrice(data, offer.productId);
  });

  snapshotPriceHistory(offer.productId, result);
}

function deactivateMissingOffers(productId, seenSellerNames) {
  const seen = new Set(seenSellerNames);

  const lowest = store.update((data) => {
    for (const offer of data.offers) {
      if (offer.productId === productId && !seen.has(offer.sellerName)) {
        offer.isActive = false;
        offer.collectedAt = now();
      }
    }

    return getLowestTotalPrice(data, productId);
  });

  snapshotPriceHistory(productId, lowest);
}

function insertDealPost(post) {
  return store.update((data) => {
    const current = data.dealPosts.find((item) => {
      if (post.url) return item.source === post.source && item.url === post.url;
      return item.source === post.source && item.title === post.title;
    });

    if (current) {
      current.productId = post.productId || current.productId || null;
      current.title = post.title;
      current.extractedPrice = toNumber(post.extractedPrice, null);
      current.postedAt = post.postedAt || current.postedAt || null;
      current.collectedAt = now();
      return current;
    }

    const created = {
      id: data.nextDealPostId++,
      productId: post.productId || null,
      source: post.source,
      title: post.title,
      url: post.url || "",
      extractedPrice: toNumber(post.extractedPrice, null),
      postedAt: post.postedAt || null,
      collectedAt: now(),
    };

    data.dealPosts.push(created);
    return created;
  });
}

function addPriceHistory(productId, lowestTotalPrice, recordedAt) {
  return store.update((data) => {
    const price = toNumber(lowestTotalPrice);
    const date = recordedAt || now();
    const exists = data.priceHistory.some(
      (row) =>
        row.productId === productId &&
        row.lowestTotalPrice === price &&
        row.recordedAt === date
    );

    if (exists) return null;

    const created = {
      id: data.nextHistoryId++,
      productId,
      lowestTotalPrice: price,
      recordedAt: date,
    };

    data.priceHistory.push(created);
    return created;
  });
}

function snapshotPriceHistory(productId, knownLowestPrice) {
  const data = store.load();
  const lowestPrice = knownLowestPrice || getLowestTotalPrice(data, productId);
  if (!lowestPrice) return;

  const last = data.priceHistory
    .filter((row) => row.productId === productId)
    .sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))[0];

  if (!last || last.lowestTotalPrice !== lowestPrice) {
    addPriceHistory(productId, lowestPrice);
  }
}

function listDeals(options = {}) {
  const data = store.load();
  const minDiscount = toNumber(options.minDiscount, null);
  const minDrop = toNumber(options.minDrop, null);

  return data.products
    .map((product) => toApiProduct(data, product))
    .filter((deal) => deal.offerCount > 0)
    .filter((deal) => !options.category || deal.category === options.category)
    .filter((deal) => minDiscount == null || deal.discountRate >= minDiscount)
    .filter((deal) => minDrop == null || deal.priceDropRate >= minDrop)
    .sort((a, b) => {
      if (options.sortBy === "price") return a.lowestPrice - b.lowestPrice;
      if (options.sortBy === "discount") return b.discountRate - a.discountRate;
      if (options.sortBy === "drop") return b.priceDropRate - a.priceDropRate;
      if (options.sortBy === "offers") return b.offerCount - a.offerCount;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
}

function getProductDetail(productId) {
  const data = store.load();
  const product = data.products.find((item) => item.id === productId);
  if (!product) return null;

  const offers = getProductOffers(data, productId)
    .slice()
    .sort((a, b) => a.totalPrice - b.totalPrice);

  const dealPosts = data.dealPosts
    .filter((post) => post.productId === productId)
    .slice()
    .sort((a, b) => new Date(b.collectedAt) - new Date(a.collectedAt));

  const priceHistory = data.priceHistory
    .filter((row) => row.productId === productId)
    .slice()
    .sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));

  return {
    ...toApiProduct(data, product),
    offers,
    dealPosts,
    priceHistory,
  };
}

module.exports = {
  upsertProduct,
  upsertOffer,
  deactivateMissingOffers,
  insertDealPost,
  addPriceHistory,
  snapshotPriceHistory,
  listDeals,
  getProductDetail,
};
