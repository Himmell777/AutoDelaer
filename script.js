var deals = [
    {
        name: "무선 노이즈 캔슬링 헤드폰",
        category: "전자기기",
        shop: "사운드마켓",
        oldPrice: 249000,
        price: 119000,
        shippingFee: 0,
        tag: "오늘 반값급",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
    },
    {
        name: "스마트 워치 스포츠 에디션",
        category: "웨어러블",
        shop: "디지털특가존",
        oldPrice: 189000,
        price: 89000,
        shippingFee: 2500,
        tag: "배송비 포함해도 쌈",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30e?auto=format&fit=crop&w=600&q=80"
    },
    {
        name: "초경량 노트북 14인치",
        category: "노트북",
        shop: "컴퓨터월드",
        oldPrice: 899000,
        price: 659000,
        shippingFee: 0,
        tag: "가격 하락",
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80"
    },
    {
        name: "무선 이어폰 베이직",
        category: "전자기기",
        shop: "이어폰창고",
        oldPrice: 79000,
        price: 29900,
        shippingFee: 3000,
        tag: "입문용 특가",
        image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=600&q=80"
    },
    {
        name: "기계식 키보드 텐키리스",
        category: "컴퓨터 주변기기",
        shop: "키보드팩토리",
        oldPrice: 129000,
        price: 69900,
        shippingFee: 0,
        tag: "쿠폰가 느낌",
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80"
    }
];

function formatWon(number) {
    return number.toLocaleString("ko-KR") + "원";
}

function getTotalPrice(deal) {
    return deal.price + deal.shippingFee;
}

function getDiscountRate(deal) {
    return Math.round((deal.oldPrice - deal.price) / deal.oldPrice * 100);
}

function renderMainDeal(deal) {
    var mainDeal = document.getElementById("mainDeal");

    if (!deal) {
        mainDeal.innerHTML = "<div class='empty-message'>대표로 보여줄 특가 상품이 없습니다.</div>";
        return;
    }

    mainDeal.innerHTML =
        "<img src='" + deal.image + "' alt='" + deal.name + "'>" +
        "<span class='tag'>" + deal.tag + "</span>" +
        "<h3>" + deal.name + "</h3>" +
        "<p>" + deal.shop + " · 배송비 " + formatWon(deal.shippingFee) + "</p>" +
        "<p class='price-line'>" +
            "<span class='old-price'>" + formatWon(deal.oldPrice) + "</span>" +
            "<span class='new-price'>" + formatWon(getTotalPrice(deal)) + "</span>" +
            "<span class='discount'>" + getDiscountRate(deal) + "% 할인</span>" +
        "</p>";
}

function renderDealList(list) {
    var dealList = document.getElementById("dealList");
    var dealCount = document.getElementById("dealCount");
    var html = "";
    var i;

    dealCount.innerHTML = list.length + "개 상품";

    if (list.length === 0) {
        dealList.innerHTML = "<div class='empty-message'>검색 결과가 없습니다.</div>";
        return;
    }

    for (i = 1; i < list.length; i++) {
        html +=
            "<article class='deal-card'>" +
                "<img src='" + list[i].image + "' alt='" + list[i].name + "'>" +
                "<div>" +
                    "<h3>" + list[i].name + "</h3>" +
                    "<p class='shop'>" + list[i].shop + " · " + list[i].category + "</p>" +
                    "<span class='old-price'>" + formatWon(list[i].oldPrice) + "</span>" +
                    "<span class='new-price'>" + formatWon(getTotalPrice(list[i])) + "</span>" +
                    "<p class='info'><strong class='discount'>" + getDiscountRate(list[i]) + "% 할인</strong> · 배송비 포함가</p>" +
                "</div>" +
            "</article>";
    }

    dealList.innerHTML = html;
}

function renderDeals(list) {
    renderMainDeal(list[0]);
    renderDealList(list);
}

function searchDeals(keyword) {
    var result = [];
    var word = keyword.toLowerCase();
    var i;

    for (i = 0; i < deals.length; i++) {
        if (
            deals[i].name.toLowerCase().indexOf(word) !== -1 ||
            deals[i].category.toLowerCase().indexOf(word) !== -1 ||
            deals[i].shop.toLowerCase().indexOf(word) !== -1
        ) {
            result.push(deals[i]);
        }
    }

    renderDeals(result);
}

document.getElementById("searchForm").onsubmit = function(event) {
    event.preventDefault();
    searchDeals(document.getElementById("searchInput").value);
};

document.getElementById("searchInput").oninput = function() {
    searchDeals(this.value);
};

renderDeals(deals);
