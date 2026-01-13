const STORAGE_KEY = "subtle_8bit_bookmarks";
// Priority: Home row, then top, then bottom
const SHORTCUT_KEYS = "fjdksalghrueiwoqtyvbnmcz".split("");

const bookmarksGrid = document.getElementById("bookmarks-grid");
const addForm = document.getElementById("add-form");

let bookmarks = [];

function init() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    bookmarks = JSON.parse(saved);
  } else {
    // Default bookmarks if none exist
    bookmarks = [
      { name: "GITHUB", url: "https://github.com" },
      { name: "YOUTUBE", url: "https://youtube.com" },
      { name: "REDDIT", url: "https://reddit.com" },
    ];
    save();
  }
  render();
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
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
