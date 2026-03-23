const formScreen = document.querySelector('[data-screen="form"]');
const displayScreen = document.querySelector('[data-screen="display"]');
const form = document.getElementById("generator-form");
const phraseInput = document.getElementById("phrase");
const previewSample = document.getElementById("preview-sample");
const pattern = document.getElementById("pattern");
const backButton = document.getElementById("back-button");
const localeSelect = document.getElementById("locale-select");

const translations = {
  en: {
    languageLabel: "Language",
    title: "Fill the screen with your words",
    intro:
      "Type a word or short phrase, adjust the look and density, then fill the entire screen with the same text.",
    aboutTitle: "What is semantic satiation?",
    aboutBody:
      "Semantic satiation is the effect where a word temporarily feels unfamiliar or loses its meaning when you repeat it many times. This page helps you experience that sensation quickly by filling the screen with the same text.",
    phraseLabel: "Text",
    phrasePlaceholder: "Example: flower",
    fontSizeLabel: "Font Size",
    fontWeightLabel: "Font Weight",
    letterSpacingLabel: "Letter Spacing",
    wordGapLabel: "Text Spacing",
    textColorLabel: "Text Color",
    backgroundColorLabel: "Background Color",
    fontFamilyLabel: "Font",
    previewLabel: "Preview",
    submitLabel: "Fill the Screen",
    backButtonLabel: "Back to input screen",
    previewFallback: "flower",
  },
  ja: {
    languageLabel: "言語",
    title: "入力した言葉で画面を埋める",
    intro:
      "単語や短いフレーズを入力して、表示の密度や雰囲気を調整してから、画面全体を同じ言葉で満たします。",
    aboutTitle: "意味飽和とは？",
    aboutBody:
      "意味飽和とは、同じ単語を何度も繰り返して見たり聞いたりすることで、その言葉が一時的に見慣れないものに感じられたり、意味が薄れて感じられたりする現象です。このページでは、同じ文字列で画面を埋めることで、その感覚を手早く体験できます。",
    phraseLabel: "文字列",
    phrasePlaceholder: "例: はな",
    fontSizeLabel: "文字サイズ",
    fontWeightLabel: "文字の太さ",
    letterSpacingLabel: "文字間隔",
    wordGapLabel: "文字列の間隔",
    textColorLabel: "文字色",
    backgroundColorLabel: "背景色",
    fontFamilyLabel: "フォント",
    previewLabel: "プレビュー",
    submitLabel: "画面いっぱいに表示",
    backButtonLabel: "入力画面に戻る",
    previewFallback: "はな",
  },
};

let currentLocale = "en";

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
  wordGap: "30px",
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

function translate(key) {
  return translations[currentLocale][key];
}

function detectLocale() {
  const browserLocale = navigator.language?.toLowerCase() || "en";
  return browserLocale.startsWith("ja") ? "ja" : "en";
}

function applyLocale(locale) {
  currentLocale = translations[locale] ? locale : "en";
  document.documentElement.lang = currentLocale;
  localeSelect.value = currentLocale;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = translate(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.setAttribute("placeholder", translate(element.dataset.i18nPlaceholder));
  });

  backButton.setAttribute("aria-label", translate("backButtonLabel"));
  localeSelect.setAttribute("aria-label", translate("languageLabel"));
  updatePreview();
}

function updatePreview() {
  const phrase = phraseInput.value.trim() || translate("previewFallback");
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

phraseInput.addEventListener("input", updatePreview);
localeSelect.addEventListener("change", (event) => {
  applyLocale(event.target.value);
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

applyLocale(detectLocale());
syncStateFromControls();
phraseInput.focus();
