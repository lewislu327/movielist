// API節點宣告
const BASE_URL = "https://movie-list.alphacamp.io/";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTERS_URL = BASE_URL + "/posters/";
// 變數宣告
const movies = [];
let filteredMovies = [];
const dataPanel = document.querySelector("#data-panel");
const searchInput = document.querySelector("#search-input");
const searchForm = document.querySelector("#search-form");
const paginator = document.querySelector("#paginator");
// const displayChangeIcons = document.querySelectorAll("#displayChange i");
const displayChange = document.querySelector("#displayChange");
let pageNumber = 1; //預設頁碼為第一頁
const MOVIES_PER_PAGE = 12;
let iconID = "displayCard"; // 預設顯示為卡片模式

//渲染電影清單，卡片模式
function renderMovieToCard(data) {
	let rawHTML = "";
	data.forEach((item) => {
		// title, image
		rawHTML += `
    <div class="col-md-3 col-sm-6">
      <div class="mb-2">
        <div class="card-body ">
          <img src="${POSTERS_URL + item.image}" class="img-fluid" alt="Movie Poster">
          <div class="card-body">
  					<h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
						<button class="btn btn-primary btn-show-movie" 
						data-toggle="modal" 
						data-target="#movie-modal" 
						data-id = ${item.id}> More </button>
						<button class="btn btn-info btn-add-favorite" 
						data-id = ${item.id}> + </button>
          </div>
        </div>
      </div>
    </div>`;
	});
	dataPanel.innerHTML = rawHTML;
}

//渲染電影清單，列表模式
function renderMovieToList(data) {
	let rawHTML = `<ul class="list-group w-100 mt-3">`;
	data.forEach((item) => {
		rawHTML += `
          <li class="list-group-item d-flex justify-content-between" aria-disabled="true">
              <h5 class="pt-2">${item.title}</h5>
              <div>
									<button class="btn btn-primary btn-show-movie" 
													data-toggle="modal" 
													data-target="#movie-modal" 
													data-id="${item.id}">More
                  </button>
                  <button class="btn btn-danger btn-add-favorite" data-id="${item.id}">+</button>
              </div>
          </li>`;
	});
	rawHTML += `</ul>`;
	dataPanel.innerHTML = rawHTML;
}

//分頁器渲染
function renderPaginator(amount) {
	const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
	let rawHTML = "";
	for (let page = 1; page <= numberOfPages; page++) {
		rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
	}
	paginator.innerHTML = rawHTML;
}

//切出目前頁數所需電影
function getMoviesByPage(page) {
	const startIndex = (page - 1) * MOVIES_PER_PAGE;
	const data = filteredMovies.length ? filteredMovies : movies;
	return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

//渲染電影簡介（modal）
function showMovieModal(id) {
	const modalTitle = document.querySelector("#movie-modal-title");
	const modalImage = document.querySelector("#movie-modal-image");
	const modalDate = document.querySelector("#movie-modal-date");
	const modalDescription = document.querySelector("#movie-modal-description");

	axios.get(INDEX_URL + id).then((response) => {
		const data = response.data.results;
		modalTitle.innerText = data.title;
		modalDate.innerText = "Release date:" + data.release_date;
		modalDescription.innerText = data.description;
		modalImage.innerHTML = ` <img src="${
			POSTERS_URL + data.image
		}" alt="movie-poster" class="img-fluid">`;
	});
}

// 獲取API資料
axios.get(INDEX_URL).then((response) => {
	movies.push(...response.data.results);
	renderPaginator(movies.length);
	displayContent();
});

// 新增電影至最愛清單
function addToFavorite(id) {
	function movieIdMatched(movie) {
		return movie.id === id;
	}
	const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
	const movie = movies.find(movieIdMatched);
	if (list.some(movieIdMatched)) {
		return alert("it was already added!");
	}
	list.push(movie);
	localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

//電影註腳按鈕加上監聽器
dataPanel.addEventListener("click", function onPanelClicked(event) {
	if (event.target.matches(".btn-show-movie")) {
		showMovieModal(Number(event.target.dataset.id));
	} else if (event.target.matches(".btn-add-favorite")) {
		addToFavorite(Number(event.target.dataset.id));
	}
});

//搜尋欄加上監聽器
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
	event.preventDefault();
	const keyword = searchInput.value.trim().toLowerCase();
	filteredMovies = movies.filter((movie) =>
		movie.title.toLowerCase().includes(keyword)
	);
	if (filteredMovies.length === 0) {
		return alert("Cannnot find movies with keyword: " + keyword);
	}
	renderPaginator(filteredMovies.length);
	renderMovieToCard(getMoviesByPage(1));
});

// 分頁器加上監聽器
paginator.addEventListener("click", function onPaginatorClicked(event) {
	if (event.target.tagName !== "A") return;
	pageNumber = Number(event.target.dataset.page);
	displayContent();
});

// 判斷是物件id為顯示卡片或顯示列表
function displayContent() {
	iconID === "displayCard"
		? renderMovieToCard(getMoviesByPage(pageNumber))
		: renderMovieToList(getMoviesByPage(pageNumber));
}



// 卡片及列表圖示加上監聽器
displayChange.addEventListener("click", function displayChange(event){
	iconID = event.target.id;
	displayContent()
	}
)
// displayChangeIcons.forEach((item) => {
// 	item.addEventListener("click", (event) => {
// 		iconID = event.target.id;
// 		displayContent();
// 	});
// });