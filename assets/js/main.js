const formScreen = document.querySelector('[data-screen="form"]');
const displayScreen = document.querySelector('[data-screen="display"]');
const form = document.getElementById("generator-form");
const phraseInput = document.getElementById("phrase");
const previewSample = document.getElementById("preview-sample");
const pattern = document.getElementById("pattern");
const backButton = document.getElementById("back-button");

const controls = {
  fontSize: document.getElementById("font-size"),
  fontWeight: document.getElementById("font-weight"),
  letterSpacing: document.getElementById("letter-spacing"),
  wordGap: document.getElementById("word-gap"),
  textColor: document.getElementById("text-color"),
  backgroundColor: document.getElementById("background-color"),
  fontFamily: document.getElementById("font-family"),
};

const outputs = {
  fontSize: document.getElementById("font-size-value"),
  fontWeight: document.getElementById("font-weight-value"),
  letterSpacing: document.getElementById("letter-spacing-value"),
  wordGap: document.getElementById("word-gap-value"),
};

const styleState = {
  fontSize: "56px",
  fontWeight: "700",
  letterSpacing: "0.02em",
  wordGap: "20px",
  textColor: "#111111",
  backgroundColor: "#f6f3ea",
  fontFamily: "'Noto Sans JP', sans-serif",
};

function updateOutputs() {
  outputs.fontSize.value = styleState.fontSize;
  outputs.fontWeight.value = styleState.fontWeight;
  outputs.letterSpacing.value = styleState.letterSpacing;
  outputs.wordGap.value = styleState.wordGap;
}

function applyCustomProperties() {
  const root = document.documentElement;
  root.style.setProperty("--font-size", styleState.fontSize);
  root.style.setProperty("--font-weight", styleState.fontWeight);
  root.style.setProperty("--letter-spacing", styleState.letterSpacing);
  root.style.setProperty("--word-gap", styleState.wordGap);
  root.style.setProperty("--text", styleState.textColor);
  root.style.setProperty("--bg", styleState.backgroundColor);
  root.style.setProperty("--font-family", styleState.fontFamily);
}

function updatePreview() {
  const phrase = phraseInput.value.trim() || "はな";
  previewSample.textContent = `${phrase} ${phrase} ${phrase}`;
  previewSample.style.color = styleState.textColor;
  previewSample.style.backgroundColor = styleState.backgroundColor;
}

function syncStateFromControls() {
  styleState.fontSize = `${controls.fontSize.value}px`;
  styleState.fontWeight = controls.fontWeight.value;
  styleState.letterSpacing = `${(Number(controls.letterSpacing.value) / 100).toFixed(2)}em`;
  styleState.wordGap = `${controls.wordGap.value}px`;
  styleState.textColor = controls.textColor.value;
  styleState.backgroundColor = controls.backgroundColor.value;
  styleState.fontFamily = controls.fontFamily.value;

  updateOutputs();
  applyCustomProperties();
  updatePreview();
}

function measurePatternCell(phrase) {
  const probe = document.createElement("span");
  probe.className = "pattern__item";
  probe.textContent = phrase;
  probe.style.visibility = "hidden";
  probe.style.left = "0";
  probe.style.top = "0";
  pattern.appendChild(probe);

  const width = Math.ceil(probe.getBoundingClientRect().width);
  const height = Math.ceil(probe.getBoundingClientRect().height);
  probe.remove();

  return { width, height };
}

function createPatternItems(phrase) {
  pattern.innerHTML = "";

  const fragment = document.createDocumentFragment();
  const minimumGap = Number(controls.wordGap.value);
  const { width: cellWidth, height: cellHeight } = measurePatternCell(phrase);
  const availableWidth = Math.max(pattern.clientWidth, cellWidth);
  const availableHeight = Math.max(pattern.clientHeight, cellHeight);
  const columns = Math.max(
    Math.floor((availableWidth + minimumGap) / Math.max(cellWidth + minimumGap, 1)),
    1
  );
  const rows = Math.max(
    Math.floor((availableHeight + minimumGap) / Math.max(cellHeight + minimumGap, 1)),
    1
  );
  const gapX =
    columns > 1 ? (availableWidth - cellWidth * columns) / (columns - 1) : 0;
  const gapY =
    rows > 1 ? (availableHeight - cellHeight * rows) / (rows - 1) : 0;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = column * (cellWidth + gapX);
      const y = row * (cellHeight + gapY);

      const item = document.createElement("p");
      item.className = "pattern__item";
      item.textContent = phrase;
      item.style.left = `${x}px`;
      item.style.top = `${y}px`;
      fragment.appendChild(item);
    }
  }

  if (!fragment.childNodes.length) {
    const item = document.createElement("p");
    item.className = "pattern__item";
    item.textContent = phrase;
    item.style.left = "0";
    item.style.top = "0";
    fragment.appendChild(item);
  }

  pattern.appendChild(fragment);
}

function showScreen(target) {
  const showForm = target === "form";
  formScreen.classList.toggle("is-active", showForm);
  displayScreen.classList.toggle("is-active", !showForm);
  displayScreen.setAttribute("aria-hidden", String(showForm));
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const phrase = phraseInput.value.trim();
  if (!phrase) {
    phraseInput.focus();
    return;
  }

  syncStateFromControls();
  showScreen("display");
  createPatternItems(phrase);
});

backButton.addEventListener("click", () => {
  showScreen("form");
  phraseInput.focus();
});

Object.values(controls).forEach((control) => {
  control.addEventListener("input", syncStateFromControls);
});

window.addEventListener("resize", () => {
  if (!displayScreen.classList.contains("is-active")) {
    return;
  }

  const phrase = phraseInput.value.trim();
  if (phrase) {
    createPatternItems(phrase);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && displayScreen.classList.contains("is-active")) {
    showScreen("form");
    phraseInput.focus();
  }
});

syncStateFromControls();
