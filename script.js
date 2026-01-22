const STORAGE_KEY = "subtle_8bit_bookmarks";
const TODO_STORAGE_KEY = "subtle_8bit_todos";
// Default search engine (Startpage). Change to your preference.
const SEARCH_ENGINE = "https://www.startpage.com/do/search?query=";
const bookmarksGrid = document.getElementById("bookmarks-grid");
const searchInput = document.getElementById("search-input");
const searchSuggestions = document.getElementById("search-suggestions");
const addForm = document.getElementById("add-form");
const todoList = document.getElementById("todo-list");
const todoForm = document.getElementById("todo-form");

let bookmarks = [];
let todos = [];
let selectedSuggestionIndex = -1;

function init() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    bookmarks = JSON.parse(saved);
  } else {
    // Default bookmarks if none exist
    bookmarks = [];
    save();
  }

  const savedTodos = localStorage.getItem(TODO_STORAGE_KEY);
  if (savedTodos) {
    todos = JSON.parse(savedTodos);
  } else {
    todos = [];
    saveTodos();
  }

  render();
  renderTodos();
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}

function saveTodos() {
  localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
}

function render() {
  if (!bookmarksGrid) return;
  bookmarksGrid.innerHTML = "";
  bookmarks.forEach((bm, index) => {
    const item = document.createElement("a");
    item.href = bm.url;
    item.className = "bookmark-item";
    item.innerHTML = `
      <span class="bm-name">${bm.name}</span>
      <button class="delete-btn" onclick="deleteBookmark(event, ${index})">[DEL]</button>
    `;
    bookmarksGrid.appendChild(item);
  });
}

// Exposed to window for onclick handler
window.deleteBookmark = function (e, index) {
  e.preventDefault();
  e.stopPropagation();
  bookmarks.splice(index, 1);
  save();
  render();
};

function renderTodos() {
  if (!todoList) return;
  todoList.innerHTML = "";
  todos.forEach((todo, index) => {
    const item = document.createElement("div");
    item.className = "todo-item";
    item.innerHTML = `
      <input type="checkbox" class="todo-checkbox" ${todo.completed ? "checked" : ""} onchange="toggleTodo(${index})">
      <input type="text" class="todo-text ${todo.completed ? "completed" : ""}" value="${todo.text}" onchange="updateTodo(${index}, this.value)">
      <div class="todo-actions">
        <button class="todo-btn del" onclick="deleteTodo(${index})">[DEL]</button>
      </div>
    `;
    todoList.appendChild(item);
  });
}

window.toggleTodo = function (index) {
  todos[index].completed = !todos[index].completed;
  saveTodos();
  renderTodos();
};

window.updateTodo = function (index, newText) {
  todos[index].text = newText.toUpperCase();
  saveTodos();
  renderTodos();
};

window.deleteTodo = function (index) {
  todos.splice(index, 1);
  saveTodos();
  renderTodos();
};

if (addForm) {
  addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("name-input");
    const urlInput = document.getElementById("url-input");

    if (nameInput && urlInput) {
      bookmarks.push({
        name: nameInput.value.toUpperCase(),
        url: urlInput.value,
      });

      save();
      render();
      addForm.reset();
    }
  });
}

if (todoForm) {
  todoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const todoInput = document.getElementById("todo-input");
    if (todoInput && todoInput.value.trim()) {
      todos.push({
        text: todoInput.value.trim().toUpperCase(),
        completed: false,
      });
      saveTodos();
      renderTodos();
      todoForm.reset();
    }
  });
}

// Search and Autocomplete Logic
function updateSuggestions() {
  const query = searchInput.value.trim();
  searchSuggestions.innerHTML = "";
  selectedSuggestionIndex = -1;

  if (!query) {
    searchSuggestions.classList.remove("active");
    return;
  }

  const lowQuery = query.toLowerCase();
  const matches = bookmarks
    .filter(
      (bm) =>
        bm.name.toLowerCase().includes(lowQuery) ||
        bm.url.toLowerCase().includes(lowQuery),
    )
    .sort((a, b) => {
      const aNameStart = a.name.toLowerCase().startsWith(lowQuery);
      const bNameStart = b.name.toLowerCase().startsWith(lowQuery);
      if (aNameStart && !bNameStart) return -1;
      if (!aNameStart && bNameStart) return 1;
      return a.name.length - b.name.length;
    })
    .slice(0, 5);

  const options = [...matches];
  options.push({
    name: `SEARCH: ${query}`,
    url: SEARCH_ENGINE + encodeURIComponent(query),
    isSearch: true,
  });

  selectedSuggestionIndex = 0;
  options.forEach((match, index) => {
    const div = document.createElement("div");
    div.className = `suggestion-item${index === 0 ? " selected" : ""}`;
    div.setAttribute("data-url", match.url);
    div.innerHTML = `
      <span class="suggestion-name">${match.name}</span>
      <span class="suggestion-url">${match.isSearch ? "" : match.url}</span>
    `;
    div.onclick = () => {
      window.location.href = match.url;
    };
    searchSuggestions.appendChild(div);
  });
  searchSuggestions.classList.add("active");
}

function handleSearch(e) {
  if (e.key === "Enter") {
    const suggestions = searchSuggestions.querySelectorAll(".suggestion-item");
    if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
      const url = suggestions[selectedSuggestionIndex].getAttribute("data-url");
      window.location.href = url;
    } else {
      const query = searchInput.value.trim();
      if (query) {
        if (
          query.match(/^https?:\/\//) ||
          query.match(/^[a-z0-9-]+\.[a-z]{2,}/i)
        ) {
          // It looks like a URL
          window.location.href = query.startsWith("http")
            ? query
            : "https://" + query;
        } else {
          // Search it
          window.location.href = SEARCH_ENGINE + encodeURIComponent(query);
        }
      }
    }
  } else if (e.key === "ArrowDown") {
    const suggestions = searchSuggestions.querySelectorAll(".suggestion-item");
    if (suggestions.length > 0) {
      e.preventDefault();
      selectedSuggestionIndex =
        (selectedSuggestionIndex + 1) % suggestions.length;
      updateSelectedSuggestion(suggestions);
    }
  } else if (e.key === "ArrowUp") {
    const suggestions = searchSuggestions.querySelectorAll(".suggestion-item");
    if (suggestions.length > 0) {
      e.preventDefault();
      selectedSuggestionIndex =
        (selectedSuggestionIndex - 1 + suggestions.length) % suggestions.length;
      updateSelectedSuggestion(suggestions);
    }
  } else if (e.key === "Escape") {
    searchSuggestions.classList.remove("active");
    searchInput.blur();
  }
}

function updateSelectedSuggestion(suggestions) {
  suggestions.forEach((s, i) => {
    s.classList.toggle("selected", i === selectedSuggestionIndex);
  });
}

if (searchInput) {
  searchInput.addEventListener("input", updateSuggestions);
  searchInput.addEventListener("keydown", handleSearch);

  // Close suggestions when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-container")) {
      searchSuggestions.classList.remove("active");
    }
  });
}

// Keyboard Listeners
window.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT") {
    if (e.key === "Escape") {
      searchInput.blur();
    }
    return;
  }

  // Focus search bar only on '/'
  if (e.key === "/") {
    e.preventDefault();
    searchInput.focus();
  }
});

function updateClock() {
  const clockEl = document.getElementById("clock");
  const dateEl = document.getElementById("date");

  if (!clockEl || !dateEl) return;

  const now = new Date();
  clockEl.textContent = now.toLocaleTimeString("en-GB", { hour12: false });

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  dateEl.textContent = now.toLocaleDateString(undefined, options);
}

// Initialize
setInterval(updateClock, 1000);
updateClock();
init();
if (searchInput) searchInput.focus();
