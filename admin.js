const CONTENT_URL = "cms/content.json?v=chapter-align-1";
const STORAGE_KEY = "montesano-cms-content-v4";

const form = document.getElementById("cms-form");
let content;

async function loadContent() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);

  const response = await fetch(CONTENT_URL);
  return response.json();
}

function field(name, label, value, multiline = false) {
  const safeValue = String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
  return `
    <label>
      ${label}
      ${multiline
        ? `<textarea name="${name}">${safeValue}</textarea>`
        : `<input name="${name}" value="${safeValue}">`}
    </label>
  `;
}

function renderForm() {
  form.innerHTML = `
    <fieldset>
      <legend>Site</legend>
      <div class="grid">
        ${field("site.title", "Title", content.site.title)}
        ${field("site.description", "Description", content.site.description)}
        ${field("site.eyebrow", "Navigation eyebrow", content.site.eyebrow)}
      </div>
    </fieldset>

    <fieldset>
      <legend>Hero</legend>
      <div class="grid">
        ${field("hero.video", "Video path", content.hero.video)}
        ${field("hero.image", "Fallback image path", content.hero.image)}
        ${field("hero.alt", "Image alt text", content.hero.alt)}
      </div>
    </fieldset>

    <fieldset>
      <legend>Navigation</legend>
      ${content.navigation.map((item, index) => `
        <div class="grid">
          ${field(`navigation.${index}.label`, `Label ${index + 1}`, item.label)}
          ${field(`navigation.${index}.href`, `Anchor ${index + 1}`, item.href)}
        </div>
      `).join("")}
    </fieldset>

    <fieldset>
      <legend>The Land</legend>
      <div class="grid">
        ${field("land.kicker", "Kicker", content.land.kicker)}
        ${field("land.title", "Title", content.land.title)}
      </div>
      ${field("land.intro", "Intro paragraphs, one per line", content.land.intro.join("\\n"), true)}
    </fieldset>

    ${content.storyBlocks.map((block, index) => `
      <fieldset>
        <legend>${block.label || `Story ${index + 1}`}</legend>
        <div class="grid">
          ${field(`storyBlocks.${index}.label`, "Label", block.label)}
          ${field(`storyBlocks.${index}.image`, "Image path", block.image)}
          ${field(`storyBlocks.${index}.alt`, "Image alt text", block.alt)}
        </div>
        ${field(`storyBlocks.${index}.paragraphs`, "Paragraphs, one per line", block.paragraphs.join("\\n"), true)}
      </fieldset>
    `).join("")}

    <fieldset>
      <legend>The Making</legend>
      <div class="grid">
        ${field("making.kicker", "Kicker", content.making.kicker)}
        ${field("making.title", "Title", content.making.title)}
      </div>
      ${field("making.intro", "Intro", content.making.intro, true)}
    </fieldset>

    <fieldset>
      <legend>Gallery</legend>
      ${content.making.gallery.map((item, index) => `
        <div class="grid">
          ${field(`making.gallery.${index}.image`, `Image ${index + 1}`, item.image)}
          ${field(`making.gallery.${index}.alt`, `Alt ${index + 1}`, item.alt)}
        </div>
      `).join("")}
    </fieldset>

    <fieldset>
      <legend>Extra Sections</legend>
      ${content.placeholderSections.map((section, index) => `
        <div class="grid">
          ${field(`placeholderSections.${index}.id`, "Anchor", section.id)}
          ${field(`placeholderSections.${index}.title`, "Title", section.title)}
        </div>
        ${field(`placeholderSections.${index}.text`, "Text", section.text, true)}
      `).join("")}
    </fieldset>
  `;
}

function setPath(target, path, value) {
  const parts = path.split(".");
  let cursor = target;
  while (parts.length > 1) {
    cursor = cursor[parts.shift()];
  }
  cursor[parts[0]] = value;
}

function collectForm() {
  const data = structuredClone(content);
  const formData = new FormData(form);
  for (const [name, value] of formData.entries()) {
    const listField = name === "land.intro" || name.endsWith(".paragraphs");
    setPath(data, name, listField ? String(value).split("\\n").filter(Boolean) : String(value));
  }
  return data;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  content = collectForm();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content, null, 2));
});

document.getElementById("download-json").addEventListener("click", () => {
  const data = collectForm();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "content.json";
  link.click();
  URL.revokeObjectURL(link.href);
});

document.getElementById("import-json").addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  content = JSON.parse(await file.text());
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content, null, 2));
  renderForm();
});

document.getElementById("reset-content").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
});

loadContent().then((data) => {
  content = data;
  renderForm();
});
