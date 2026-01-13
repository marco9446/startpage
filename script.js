const STORAGE_KEY = "subtle_8bit_bookmarks";
const TODO_STORAGE_KEY = "subtle_8bit_todos";
// Priority: Home row, then top, then bottom
const SHORTCUT_KEYS = "fjdksalghrueiwoqtyvbnmcz".split("");

const bookmarksGrid = document.getElementById("bookmarks-grid");
const addForm = document.getElementById("add-form");
const todoList = document.getElementById("todo-list");
const todoForm = document.getElementById("todo-form");

let bookmarks = [];
let todos = [];

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
    const key = SHORTCUT_KEYS[index] || "";
    const item = document.createElement("a");
    item.href = bm.url;
    item.className = "bookmark-item";
    item.innerHTML = `
      ${key ? `<span class="shortcut-hint">${key.toUpperCase()}</span>` : ""}
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

// Keyboard Listeners
window.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT") return;

  const pressedKey = e.key.toLowerCase();
  const index = SHORTCUT_KEYS.indexOf(pressedKey);

  if (index !== -1 && index < bookmarks.length) {
    window.location.href = bookmarks[index].url;
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
