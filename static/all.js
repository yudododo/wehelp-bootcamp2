const searchInput = document.querySelector(".searchInput");
const searchButton = document.querySelector(".searchButton");
const attractionsContainer = document.querySelector(".attractions");
const mrtContainer = document.querySelector(".mrtCon");
const btnLeft = document.querySelector(".leftBtn");
const btnRight = document.querySelector(".rightBtn");
const more = document.querySelector(".more");

let currentPage = 0;
let currentKeyword = "";
let nextPage = null;
let isLoading = false;

// ✅ 初始化：載入 MRT 捷運站名稱與景點資料
fetchMRTStations();
loadAttractions(currentPage, currentKeyword);

// ✅ 1. 載入 MRT 捷運站名稱
function fetchMRTStations() {
  fetch("/api/mrts")
    .then((res) => res.json())
    .then((data) => {
      data.data.forEach((mrt) => {
        const mrtItem = document.createElement("a");
        mrtItem.className = "mrt";
        mrtItem.textContent = mrt;
        // 點擊 MRT 站名觸發關鍵字搜尋
        mrtItem.addEventListener("click", () => {
          startSearch(mrt); // 執行基於關鍵字的搜尋
        });
        mrtContainer.appendChild(mrtItem);
      });
    });
}

// ✅ 2. 搜尋功能
searchButton.addEventListener("click", () => {
  const keyword = searchInput.value.trim();
  startSearch(keyword);
});

// ✅ 3. 啟動搜尋並載入景點資料
function startSearch(keyword) {
  currentKeyword = keyword; // 設定當前關鍵字
  currentPage = 0; // 重置頁碼
  attractionsContainer.innerHTML = ""; // 清空舊資料
  loadAttractions(currentPage, currentKeyword); // 載入新資料
}

// ✅ 4. 加載景點資料
function loadAttractions(page, keyword) {
  if (isLoading) return; // 避免重複請求
  isLoading = true;

  const apiUrl = `/api/attractions?page=${page}&keyword=${keyword}`;
  fetch(apiUrl)
    .then((res) => res.json())
    .then((data) => {
      nextPage = data.nextPage; // 儲存下一頁
      renderAttractions(data.data); // 渲染景點
      isLoading = false; // 重置狀態
    });
}

// ✅ 5. 渲染景點列表
function renderAttractions(attractions) {
  attractions.forEach((item) => {
    const attractionCard = document.createElement("div");
    attractionCard.className = "attractionCard";

    const attraction = document.createElement("div");
    attraction.className = "attraction";

    const attractionImg = document.createElement("div");
    attractionImg.className = "attractionImg";

    const img = document.createElement("img");
    img.src = item.images[0];
    img.alt = item.name;

    const h3 = document.createElement("h3");
    h3.className = "attractionName";
    h3.textContent = item.name;

    const attractionInfo = document.createElement("div");
    attractionInfo.className = "attractionInfo";

    const attractionMrt = document.createElement("p");
    attractionMrt.className = "attractionMrt";
    attractionMrt.textContent = item.mrt;

    const attractionCat = document.createElement("p");
    attractionCat.className = "attractionCat";
    attractionCat.textContent = item.category;

    attractionImg.appendChild(img);
    attractionImg.appendChild(h3);

    attractionInfo.appendChild(attractionMrt);
    attractionInfo.appendChild(attractionCat);

    // attraction.appendChild(attractionImg);
    attractionCard.appendChild(attractionImg);
    // attraction.appendChild(attractionInfo);
    attractionCard.appendChild(attractionInfo);

    // attractionCard.appendChild(attraction);
    attractionsContainer.appendChild(attractionCard);
  });
}

// ✅ 6. 監測頁尾，自動載入更多頁面
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && nextPage !== null) {
      loadAttractions(nextPage, currentKeyword);
    }
  });
});
observer.observe(more);

// ✅ 7. MRT 捷運站左右滾動
btnLeft.addEventListener("click", () => {
  mrtContainer.scrollBy({ left: -150, behavior: "smooth" });
});

btnRight.addEventListener("click", () => {
  mrtContainer.scrollBy({ left: 150, behavior: "smooth" });
});
