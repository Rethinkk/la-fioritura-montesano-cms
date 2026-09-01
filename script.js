const CONTENT_URL = "cms/content.json?v=chapter-align-1";
const STORAGE_KEY = "montesano-cms-content-v4";

async function loadContent() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);

  const response = await fetch(CONTENT_URL);
  if (!response.ok) throw new Error("Content could not be loaded");
  return response.json();
}

function textParagraphs(items) {
  return items.map((item) => `<p>${escapeHtml(item)}</p>`).join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function render(content) {
  document.title = content.site.title;
  document.querySelector('meta[name="description"]').setAttribute("content", content.site.description);
  document.getElementById("nav-eyebrow").textContent = content.site.eyebrow;

  document.getElementById("navigation").innerHTML = content.navigation
    .map((item) => `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`)
    .join("");

  const heroVideo = document.getElementById("hero-video");
  heroVideo.src = content.hero.video;
  heroVideo.poster = content.hero.image;
  document.getElementById("hero-image").src = content.hero.image;
  document.getElementById("hero-image").alt = content.hero.alt;

  document.getElementById("land-kicker").textContent = content.land.kicker;
  document.getElementById("land-title").textContent = content.land.title;
  document.getElementById("land-intro").innerHTML = textParagraphs(content.land.intro);

  document.getElementById("story-flow").innerHTML = content.storyBlocks
    .map((block, index) => `
      <article class="story-block ${index % 2 ? "story-block--reverse" : ""}">
        <figure class="story-block__image">
          <img src="${escapeHtml(block.image)}" alt="${escapeHtml(block.alt)}">
        </figure>
        <div class="story-block__rule"></div>
        <div class="story-block__copy">
          <div class="body-copy">${textParagraphs(block.paragraphs)}</div>
          <h3>${escapeHtml(block.label)}</h3>
        </div>
      </article>
    `)
    .join("");

  document.getElementById("making-intro").textContent = content.making.intro;
  document.getElementById("making-kicker").textContent = content.making.kicker;
  document.getElementById("making-title").textContent = content.making.title;
  document.getElementById("making-gallery").innerHTML = content.making.gallery
    .map((item) => `
      <figure>
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.alt)}">
      </figure>
    `)
    .join("");

  document.getElementById("extra-sections").innerHTML = content.placeholderSections
    .map((section) => `
      <article id="${escapeHtml(section.id)}">
        <h2>${escapeHtml(section.title)}</h2>
        <p>${escapeHtml(section.text)}</p>
      </article>
    `)
    .join("");
}

loadContent().then(render).catch((error) => {
  document.body.innerHTML = `<main class="error"><h1>Content unavailable</h1><p>${escapeHtml(error.message)}</p></main>`;
});
