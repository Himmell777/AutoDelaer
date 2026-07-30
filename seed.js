const {
  upsertProduct,
  upsertOffer,
  insertDealPost,
  addPriceHistory,
} = require("./queries");

const products = [
  {
    id: "P001",
    name: "Wireless Noise Canceling Headphones",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    originalPrice: 249000,
    history: [
      ["2026-07-01 09:00:00", 169000],
      ["2026-07-16 09:00:00", 139000],
    ],
    offers: [
      {
        sellerName: "Sound Market",
        price: 119000,
        shippingFee: 0,
        url: "https://example.com/headphones/sound-market",
      },
      {
        sellerName: "Digital Deal Zone",
        price: 115000,
        shippingFee: 3000,
        url: "https://example.com/headphones/digital-deal-zone",
      },
      {
        sellerName: "Audio Outlet",
        price: 112000,
        shippingFee: 5000,
        url: "https://example.com/headphones/audio-outlet",
      },
    ],
    posts: [
      {
        source: "ppomppu",
        title: "Headphones hot deal, final price 117000 won",
        url: "https://example.com/community/post-001",
        extractedPrice: 117000,
      },
    ],
  },
  {
    id: "P002",
    name: "Smart Watch Sport Edition",
    category: "wearable",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
    originalPrice: 189000,
    history: [
      ["2026-07-01 09:00:00", 129000],
      ["2026-07-20 09:00:00", 99000],
    ],
    offers: [
      {
        sellerName: "Digital Deal Zone",
        price: 89000,
        shippingFee: 2500,
        url: "https://example.com/watch/digital-deal-zone",
      },
      {
        sellerName: "Computer World",
        price: 92000,
        shippingFee: 0,
        url: "https://example.com/watch/computer-world",
      },
    ],
    posts: [
      {
        source: "quasarzone",
        title: "Smart watch coupon deal",
        url: "https://example.com/community/post-002",
        extractedPrice: 91500,
      },
    ],
  },
  {
    id: "P003",
    name: "Lightweight Laptop 14 Inch",
    category: "laptop",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80",
    originalPrice: 899000,
    history: [
      ["2026-07-01 09:00:00", 749000],
      ["2026-07-18 09:00:00", 699000],
    ],
    offers: [
      {
        sellerName: "Computer World",
        price: 659000,
        shippingFee: 0,
        url: "https://example.com/laptop/computer-world",
      },
      {
        sellerName: "Notebook Mall",
        price: 649000,
        shippingFee: 12000,
        url: "https://example.com/laptop/notebook-mall",
      },
    ],
    posts: [
      {
        source: "ruliweb",
        title: "14 inch laptop price dropped again",
        url: "https://example.com/community/post-003",
        extractedPrice: 659000,
      },
    ],
  },
];

for (const product of products) {
  upsertProduct(product);

  for (const [recordedAt, price] of product.history) {
    addPriceHistory(product.id, price, recordedAt);
  }

  for (const offer of product.offers) {
    upsertOffer({ productId: product.id, ...offer });
  }

  for (const post of product.posts) {
    insertDealPost({
      productId: product.id,
      postedAt: null,
      ...post,
    });
  }
}

console.log(`Seed complete: ${products.length} products inserted or updated.`);
