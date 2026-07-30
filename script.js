var API_URL = "http://localhost:3000/api/deals";
var deals = [];

function formatWon(number) {
    return Number(number || 0).toLocaleString("ko-KR") + "원";
}

function escapeHtml(text) {
    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getTag(deal) {
    if (deal.discountRate >= 50) return "반값급 특가";
    if (deal.priceDropRate >= 20) return "가격 급하락";
    if (deal.discountRate >= 20) return "오늘의 특가";
    return "추천 상품";
}

function showMessage(message) {
    document.getElementById("mainDeal").innerHTML =
        "<div class='empty-message'>" + escapeHtml(message) + "</div>";
    document.getElementById("dealList").innerHTML = "";
    document.getElementById("dealCount").innerHTML = "0개 상품";
}

function renderMainDeal(deal) {
    var mainDeal = document.getElementById("mainDeal");

    if (!deal) {
        mainDeal.innerHTML = "<div class='empty-message'>대표로 보여줄 특가 상품이 없습니다.</div>";
        return;
    }

    mainDeal.innerHTML =
        "<img src='" + escapeHtml(deal.image) + "' alt='" + escapeHtml(deal.name) + "'>" +
        "<span class='tag'>" + getTag(deal) + "</span>" +
        "<h3>" + escapeHtml(deal.name) + "</h3>" +
        "<p>" + escapeHtml(deal.category) + " · 판매처 " + deal.offerCount + "곳 비교</p>" +
        "<p class='price-line'>" +
            "<span class='old-price'>" + formatWon(deal.originalPrice) + "</span>" +
            "<span class='new-price'>" + formatWon(deal.lowestPrice) + "</span>" +
            "<span class='discount'>" + deal.discountRate + "% 할인 · " + deal.priceDropRate + "% 하락</span>" +
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

    if (list.length === 1) {
        dealList.innerHTML = "<div class='empty-message'>조건에 맞는 상품이 1개라 대표 상품만 표시됩니다.</div>";
        return;
    }

    for (i = 1; i < list.length; i++) {
        html +=
            "<article class='deal-card'>" +
                "<img src='" + escapeHtml(list[i].image) + "' alt='" + escapeHtml(list[i].name) + "'>" +
                "<div>" +
                    "<h3>" + escapeHtml(list[i].name) + "</h3>" +
                    "<p class='shop'>" + escapeHtml(list[i].category) + " · 판매처 " + list[i].offerCount + "곳</p>" +
                    "<span class='old-price'>" + formatWon(list[i].originalPrice) + "</span>" +
                    "<span class='new-price'>" + formatWon(list[i].lowestPrice) + "</span>" +
                    "<p class='info'><strong class='discount'>" + list[i].discountRate + "% 할인</strong> · 배송비 포함 최저가 · " + list[i].priceDropRate + "% 하락</p>" +
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
            deals[i].category.toLowerCase().indexOf(word) !== -1
        ) {
            result.push(deals[i]);
        }
    }

    renderDeals(result);
}

function loadDeals() {
    showMessage("백엔드에서 특가 상품을 불러오는 중입니다.");

    fetch(API_URL + "?sortBy=discount")
        .then(function(response) {
            if (!response.ok) {
                throw new Error("API 응답 오류");
            }
            return response.json();
        })
        .then(function(data) {
            deals = data.deals || [];
            renderDeals(deals);
        })
        .catch(function() {
            showMessage("백엔드 서버가 꺼져 있습니다. 먼저 autodealer-backend에서 npm.cmd start를 실행하세요.");
        });
}

document.getElementById("searchForm").onsubmit = function(event) {
    event.preventDefault();
    searchDeals(document.getElementById("searchInput").value);
};

document.getElementById("searchInput").oninput = function() {
    searchDeals(this.value);
};

loadDeals();
