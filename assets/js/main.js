const formScreen = document.querySelector('[data-screen="form"]');
const displayScreen = document.querySelector('[data-screen="display"]');
const form = document.getElementById("generator-form");
const phraseInput = document.getElementById("phrase");
const previewSample = document.getElementById("preview-sample");
const pattern = document.getElementById("pattern");
const backButton = document.getElementById("back-button");
const displayHeader = document.querySelector(".display-header");

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
  previewSample.style.backgroundColor = "transparent";
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

function createPatternItems(phrase) {
  pattern.innerHTML = "";

  const fontSize = Number(controls.fontSize.value);
  const gap = Math.max(Number(controls.wordGap.value), 8);
  const phraseWidthFactor = phrase.length <= 2 ? 1.6 : 1.2;
  const estimatedItemWidth = Math.max(fontSize * (phrase.length * phraseWidthFactor), 120);
  const estimatedItemHeight = Math.max(fontSize * 1.15, 48);
  const horizontalUnit = estimatedItemWidth + gap;
  const verticalUnit = estimatedItemHeight + gap;
  const availableWidth = Math.max(pattern.clientWidth - 40, 1);
  const availableHeight = Math.max(
    window.innerHeight - displayHeader.getBoundingClientRect().height - 40,
    1
  );
  const columns = Math.max(Math.floor((availableWidth + gap) / horizontalUnit), 1);
  const rows = Math.max(Math.floor((availableHeight + gap) / verticalUnit), 1);
  const count = columns * rows;

  pattern.style.setProperty("--pattern-columns", String(columns));
  pattern.style.setProperty("--pattern-rows", String(rows));
  pattern.style.setProperty("--pattern-gap", `${gap}px`);

  const fragment = document.createDocumentFragment();

  for (let index = 0; index < count; index += 1) {
    const item = document.createElement("p");
    item.className = "pattern__item";
    item.textContent = phrase;
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
