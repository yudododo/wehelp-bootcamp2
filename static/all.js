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
document.addEventListener('DOMContentLoaded', () => {
  // 判斷當前頁面是首頁
  if (window.location.pathname === '/' || window.location.pathname.includes('index')) {
    fetchMRTStations();
    loadAttractions(currentPage, currentKeyword);
  }
});

// fetchMRTStations();
// loadAttractions(currentPage, currentKeyword);

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
if (searchButton) {
  searchButton.addEventListener("click", () => {
    const keyword = searchInput.value.trim();
    startSearch(keyword);
  });
} else {
  console.log(".searchButton 元素未找到");
}

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
    const link = document.createElement("a");
    link.href = `/attraction/${item.id}`;
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

    attractionCard.appendChild(attractionImg);
    attractionCard.appendChild(attractionInfo);
    attractionCard.dataset.id = item.id;

    // attractionCard.appendChild(attraction);
    // attractionsContainer.appendChild(attractionCard);
    link.appendChild(attractionCard);
    attractionsContainer.appendChild(link);
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

if (more) {
  observer.observe(more);
} else {
  console.log('未找到 .more 元素');
}

// observer.observe(more);

// ✅ 7. MRT 捷運站左右滾動
if (btnLeft) {
  btnLeft.addEventListener("click", () => {
    mrtContainer.scrollBy({ left: -150, behavior: "smooth" });
  });
} else {
  console.log(".leftBtn 元素未找到");
}

if (btnRight) {
  btnRight.addEventListener("click", () => {
    mrtContainer.scrollBy({ left: 150, behavior: "smooth" });
  });
} else {
  console.log(".rightBtn 元素未找到");
}


document.addEventListener("DOMContentLoaded", () => {
  const url = window.location.pathname;  // 獲取當前頁面的 URL
  const attractionId = url.split('/').pop();  // 提取 URL 中的 id 部分
  fetchAttractionDetails(attractionId);
});

function fetchAttractionDetails(attractionId) {
  fetch(`/api/attraction/${attractionId}`)
    .then((res) => res.json())
    .then((data) => {
      // console.log("ss")
      if (!data.data) return;
      const attraction = data.data;

      // 📌 建立圖片區
      const imageSlider = document.createElement("div");
      imageSlider.className = "imageSlider";

      const imgElement = document.createElement("img");
      imgElement.src = attraction.images[0]; // 第一張圖片
      imgElement.alt = attraction.name;
      imgElement.className = "attImg";
      imageSlider.appendChild(imgElement);

      // 📌 創建圓圈指示器容器
      const dotsContainer = document.createElement("div");
      dotsContainer.className = "dotsContainer"; 

      // 生成圓圈指示器
      attraction.images.forEach((_, index) => {
        const dot = document.createElement("span");
        dot.className = "dot";
        dot.setAttribute("data-index", index);
        if (index === 0) {
          dot.classList.add("active"); // 預設為第一張圖片
        }
        dotsContainer.appendChild(dot);
      });

      // 在圖片區下方顯示圓圈
      imageSlider.appendChild(dotsContainer);

      // 📌 創建左箭頭
      const prevArrow = document.createElement("img");
      prevArrow.className = "arrow prev";
      prevArrow.src = "/static/img/left arrow.png"; // 左箭頭
      imageSlider.appendChild(prevArrow);

      // 📌 創建右箭頭
      const nextArrow = document.createElement("img");
      nextArrow.className = "arrow next";
      nextArrow.src = "/static/img/right arrow.png"; // 右箭頭
      imageSlider.appendChild(nextArrow);

      let currentIndex = 0; // 記錄當前顯示的圖片索引

      // 更新顯示圖片和圓圈樣式
      function updateSlideShow(index) {
        // 更新圖片
        imgElement.src = attraction.images[index];

        // 更新圓圈樣式
        const dots = dotsContainer.querySelectorAll(".dot");
        dots.forEach(dot => dot.classList.remove("active"));
        dots[index].classList.add("active");
        currentIndex = index;
      }

      prevArrow.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + attraction.images.length) % attraction.images.length; // 循環顯示
        updateSlideShow(currentIndex);
      });
    
      nextArrow.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % attraction.images.length; // 循環顯示
        updateSlideShow(currentIndex);
      });
    
      // 點擊圓圈切換圖片
      dotsContainer.addEventListener("click", (event) => {
        if (event.target.classList.contains("dot")) {
          const index = parseInt(event.target.getAttribute("data-index"));
          updateSlideShow(index);
        }
      });

      // 📌 建立資訊區
      const infoDiv = document.createElement("div");
      infoDiv.className = "info";

      const attName = document.createElement("h3");
      attName.className = "attName";
      attName.textContent = attraction.name;

      const bookingTitle = document.createElement("h4");
      bookingTitle.innerHTML = "<strong>訂購導覽行程</strong>";

      const bookingDescription = document.createElement("p");
      bookingDescription.textContent = "以此景點為中心的一日行程，帶您探索城市角落故事";

      // 📌 景點分類 & 捷運站
      const attInfo = document.createElement("div");
      attInfo.className = "attInfo";

      const attCat = document.createElement("p");
      attCat.className = "attCat";
      attCat.textContent = attraction.category + " at";

      const attMrt = document.createElement("p");
      attMrt.className = "attMrt";
      attMrt.textContent = " " + attraction.mrt;

      attInfo.appendChild(attCat);
      attInfo.appendChild(attMrt);

      // 📌 建立日期選擇
      const dateDiv = document.createElement("div");
      const dateLabel = document.createElement("label");
      dateLabel.innerHTML = "<strong>選擇日期：</strong>";

      const dateInput = document.createElement("input");
      dateInput.type = "date";
      dateDiv.appendChild(dateLabel);
      dateDiv.appendChild(dateInput);

      // 📌 建立時間選擇
      const timeDiv = document.createElement("div");
      timeDiv.className = "time";

      const timeLabel = document.createElement("label");
      timeLabel.innerHTML = "<strong>選擇時間：</strong>";

      const morningRadio = document.createElement("input");
      morningRadio.checked = true;
      morningRadio.type = "radio";
      morningRadio.name = "time";
      morningRadio.value = "morning";

      const morningLabel = document.createElement("label");
      morningLabel.textContent = "上半天";

      const afternoonRadio = document.createElement("input");
      afternoonRadio.type = "radio";
      afternoonRadio.name = "time";
      afternoonRadio.value = "afternoon";

      const afternoonLabel = document.createElement("label");
      afternoonLabel.textContent = "下半天";

      timeDiv.appendChild(timeLabel);
      timeDiv.appendChild(morningRadio);
      timeDiv.appendChild(morningLabel);
      timeDiv.appendChild(afternoonRadio);
      timeDiv.appendChild(afternoonLabel);

      // 📌 建立價格顯示
      const price = document.createElement("p");
      price.className = "price";
      price.innerHTML = `<strong>導覽費用：</strong>新台幣 <span id="price">2000</span> 元`;

      // 📌 監聽時間選擇事件，變更價格
      [morningRadio, afternoonRadio].forEach((radio) => {
        radio.addEventListener("change", (event) => {
          document.getElementById("price").textContent = event.target.value === "morning" ? "2000" : "2500";
        });
      });


      // 📌 建立預約按鈕
      const attBtn = document.createElement("button");
      const a = document.createElement("a");
      attBtn.className = "attBtn";
      a.textContent = "開始預約行程";
      attBtn.appendChild(a);

       // 📌 建立訂購
       const order = document.createElement("div");
       order.className = "order";
       order.appendChild(bookingTitle);
       order.appendChild(bookingDescription);
       order.appendChild(dateDiv);
       order.appendChild(timeDiv);
       order.appendChild(price);
       order.appendChild(attBtn);

      // ✅ 組裝所有元素
      infoDiv.appendChild(attName);
      infoDiv.appendChild(attInfo);
      infoDiv.appendChild(order);
      const attractionDiv = document.querySelector('.attraction');
      attractionDiv.appendChild(imageSlider);
      attractionDiv.appendChild(infoDiv);

      // 📌 創建描述區塊
      const desDiv = document.createElement("div");
      desDiv.className = "des";
      desDiv.textContent = attraction.description;

      // 📌 創建地址區塊
      const addressDiv = document.createElement("div");
      const addressLabel = document.createElement("strong");
      addressLabel.textContent = "景點地址：";
      const addressContent = document.createElement("div");
      addressContent.className = "address";
      addressContent.textContent = attraction.address;
      addressDiv.appendChild(addressLabel);
      addressDiv.appendChild(addressContent);

      // 📌 創建交通方式區塊
      const transportDiv = document.createElement("div");
      const transportLabel = document.createElement("strong");
      transportLabel.textContent = "交通方式：";
      const transportContent = document.createElement("div");
      transportContent.className = "transport";
      transportContent.textContent = attraction.transport;
      transportDiv.appendChild(transportLabel);
      transportDiv.appendChild(transportContent);

      // ✅ 組裝所有元素
      const descriptionDiv = document.querySelector(".description");
      descriptionDiv.appendChild(desDiv);
      descriptionDiv.appendChild(addressDiv);
      descriptionDiv.appendChild(transportDiv);
    })
    .catch((error) => console.error("Error:", error));
}
function closeDialog() {
  document.querySelector(".dialogSignin").style.display = "none";
  document.querySelector(".dialogSignup").style.display = "none";
  document.querySelector(".overlay").style.display = "none";
}
function openDialog(dialogType) {
  if (dialogType === "signin") {
    document.querySelector(".dialogSignin").style.display = "flex";
    document.querySelector(".overlay").style.display = "block";
  } else if (dialogType === "signup") {
    document.querySelector(".dialogSignup").style.display = "flex";
    document.querySelector(".overlay").style.display = "block";
  }
}
function switchToSignup() {
  document.querySelector(".dialogSignin").style.display = "none";
  document.querySelector(".dialogSignup").style.display = "flex"; 
}
function switchToSignin() {
  document.querySelector(".dialogSignup").style.display = "none";
  document.querySelector(".dialogSignin").style.display = "flex";
}

document.querySelector("#signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  try {
    const res = await fetch("/api/user", {
      method: "POST",
      body: formData
    });
    const result = await res.json();
    if (res.ok) {
      sucSignupMsg = document.querySelector("#sucSignupMsg");
      sucSignupMsg.style.display = "flex";
      sucSignupMsg.textContent = result.message;
    } else {
      const errSignupMsg = document.querySelector("#errSignupMsg");
      errSignupMsg.style.display = "flex";
      errSignupMsg.textContent = result.message;
    }
  } catch (err) {
    console.error("註冊錯誤：", err);
  }
});

const logout = document.querySelector(".logout");
const signin = document.querySelector(".signin");
const signup = document.querySelector(".signup");

logout.addEventListener("click",() => {
  localStorage.removeItem("token"); // 移除 token
  location.reload(); // 重新載入
})

document.querySelector("#signinForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  try {
    const res = await fetch("/api/user/auth", {
      method: "PUT",
      body: formData
    });
    const result = await res.json();
// 3. After successful signing in, the front-end will get signed TOKEN from the back-end.
// Save it into LocalStorage of the user's browser.
    if (res.ok) {
      localStorage.setItem("token", result.token);
      location.reload();
    }else{
      console.log(result);
      const errSigninMsg = document.querySelector("#errSigninMsg");
      errSigninMsg.style.display = "flex";
      errSigninMsg.textContent = result.message;
    }
  } catch (err) {
    console.error(err);
  }
});

// 4. When a signed-in user tries to call APIs which require authorization, our front-end
// code should send a request with Bearer Token in the Authorization header.
window.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (token) {
    // 發送驗證請求
    const res = await fetch("/api/user/auth", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const result = await res.json();
    if (result.data) {
      console.log("使用者資訊：", result.data);
      // token 驗證成功
      document.querySelector(".signinup").style.display = "none";
      document.querySelector(".logout").style.display = "flex";
    } else {
      console.log("未登入或 token 無效");
      // token 無效或過期，
      document.querySelector(".signinup").style.display = "flex";
      document.querySelector(".logout").style.display = "none";
    }
  } else {
    // 沒有 token
    document.querySelector(".signinup").style.display = "flex";
    document.querySelector(".logout").style.display = "none";
  }
});