/*
 * ÖFFENTLICHE INHALTE PFLEGEN
 *
 * Freie Gärten: Parzellennummern in "available" eintragen.
 * Noch ungeklärte Parzellen: Nummern in "checking" eintragen.
 * Veröffentlichte Ideen: Objekte in "ideas" ergänzen; ein Beispiel steht in der README.
 * Gartenbörse: geprüfte Einträge in "gardenExchange" ergänzen.
 */
const publicContent = {
  gardenAvailability: {
    available: [],
    checking: [],
    updated: "noch keine Statusmeldung veröffentlicht",
  },
  ideas: [],
  gardenExchange: [],
};

const body = document.body;
const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#main-nav");

function closeNavigation() {
  body.classList.remove("nav-open");
  navToggle?.setAttribute("aria-expanded", "false");
}

navToggle?.addEventListener("click", () => {
  const willOpen = !body.classList.contains("nav-open");
  body.classList.toggle("nav-open", willOpen);
  navToggle.setAttribute("aria-expanded", String(willOpen));
});

nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNavigation));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeNavigation();
});

window.addEventListener(
  "scroll",
  () => header?.classList.toggle("is-scrolled", window.scrollY > 12),
  { passive: true },
);

document.querySelectorAll("[data-current-year]").forEach((item) => {
  item.textContent = new Date().getFullYear();
});

function validPlotNumbers(values) {
  return [...new Set(values)]
    .map(Number)
    .filter((number) => Number.isInteger(number) && number >= 1 && number <= 117)
    .sort((a, b) => a - b);
}

const availablePlots = validPlotNumbers(publicContent.gardenAvailability.available);
const checkingPlots = validPlotNumbers(publicContent.gardenAvailability.checking).filter(
  (number) => !availablePlots.includes(number),
);
const gardenMap = document.querySelector("[data-garden-map]");

function applyGardenAvailability() {
  const mapDocument = gardenMap?.contentDocument;
  if (!mapDocument) return;

  mapDocument.querySelectorAll(".plot").forEach((plot) => plot.classList.remove("is-free", "is-checking"));
  availablePlots.forEach((number) => mapDocument.querySelector(`#plot-${number}`)?.classList.add("is-free"));
  checkingPlots.forEach((number) => mapDocument.querySelector(`#plot-${number}`)?.classList.add("is-checking"));
}

gardenMap?.addEventListener("load", applyGardenAvailability);
if (gardenMap?.contentDocument?.documentElement) applyGardenAvailability();

document.querySelectorAll("[data-map-status]").forEach((item) => {
  const count = availablePlots.length;
  const freeText = count
    ? `${count === 1 ? "Als frei markiert ist" : "Als frei markiert sind"}: ${availablePlots.join(", ")}.`
    : "Derzeit sind keine freien Parzellen öffentlich markiert.";
  item.textContent = `${freeText} Stand: ${publicContent.gardenAvailability.updated}.`;
});

const ideaList = document.querySelector("[data-idea-list]");

if (ideaList && publicContent.ideas.length) {
  ideaList.replaceChildren();

  publicContent.ideas.forEach((idea) => {
    const article = document.createElement("article");
    article.className = "idea-card";

    const headingGroup = document.createElement("div");
    const category = document.createElement("span");
    category.className = "idea-card__category";
    category.textContent = idea.category;
    const heading = document.createElement("h4");
    heading.textContent = idea.title;
    headingGroup.append(category, heading);

    const status = document.createElement("span");
    status.className = "idea-card__status";
    status.textContent = idea.status;

    const description = document.createElement("p");
    description.textContent = idea.description;

    article.append(headingGroup, status, description);
    ideaList.append(article);
  });
}

const exchangeList = document.querySelector("[data-exchange-list]");
const exchangeFilters = document.querySelectorAll("[data-exchange-filter]");
const exchangeCategories = ["Verschenken", "Tauschen", "Verleihen", "Suche"];

function activeExchangeEntries() {
  if (!Array.isArray(publicContent.gardenExchange)) return [];

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  return publicContent.gardenExchange.filter((entry) => {
    if (!exchangeCategories.includes(entry.category)) return false;
    if (!entry.expires) return true;
    const expiration = new Date(`${entry.expires}T23:59:59`);
    return Number.isNaN(expiration.getTime()) || expiration >= startOfToday;
  });
}

function formattedExpiration(value) {
  if (!value) return "Bis auf Widerruf";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return `Gültig bis ${new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(date)}`;
}

function createExchangeEmptyState(filter) {
  const empty = document.createElement("div");
  empty.className = "exchange-empty";

  const symbol = document.createElement("span");
  symbol.setAttribute("aria-hidden", "true");
  symbol.textContent = "↔";

  const heading = document.createElement("h3");
  heading.textContent = filter === "Alle" ? "Noch keine Einträge veröffentlicht" : `Keine Einträge unter „${filter}“`;

  const copy = document.createElement("p");
  copy.textContent = "Sobald der Vorstand einen passenden Eintrag freigibt, erscheint er hier.";

  const link = document.createElement("a");
  link.className = "text-link";
  link.href = "#angebot-einreichen";
  link.textContent = "Eintrag einreichen ↓";

  empty.append(symbol, heading, copy, link);
  return empty;
}

function renderExchange(filter = "Alle") {
  if (!exchangeList) return;
  const entries = activeExchangeEntries().filter((entry) => filter === "Alle" || entry.category === filter);
  exchangeList.replaceChildren();

  if (!entries.length) {
    exchangeList.append(createExchangeEmptyState(filter));
    return;
  }

  entries.forEach((entry) => {
    const article = document.createElement("article");
    article.className = "exchange-card";
    article.dataset.category = entry.category;

    const top = document.createElement("div");
    top.className = "exchange-card__top";
    const category = document.createElement("span");
    category.className = "exchange-card__category";
    category.textContent = entry.category;
    const expiration = document.createElement("span");
    expiration.className = "exchange-card__expiration";
    expiration.textContent = formattedExpiration(entry.expires);
    top.append(category, expiration);

    const heading = document.createElement("h3");
    heading.textContent = entry.title;
    const description = document.createElement("p");
    description.textContent = entry.description;

    const footer = document.createElement("div");
    footer.className = "exchange-card__footer";
    const details = document.createElement("span");
    details.textContent = entry.details || "Übergabe nach Absprache";
    const contact = document.createElement("a");
    contact.className = "text-link";
    const subject = `Gartenbörse: Interesse an „${entry.title}“`;
    const bodyText = `Guten Tag,\r\n\r\nich interessiere mich für den Gartenbörsen-Eintrag „${entry.title}“. Bitte stellen Sie den Kontakt her.\r\n\r\nName:\r\nKontaktmöglichkeit:\r\n\r\nFreundliche Grüße`;
    contact.href = `mailto:kgv.schmiedekamp@gmx.de?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
    contact.textContent = "Interesse melden →";
    footer.append(details, contact);

    article.append(top, heading, description, footer);
    exchangeList.append(article);
  });
}

if (exchangeList) renderExchange();

exchangeFilters.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.exchangeFilter;
    exchangeFilters.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    renderExchange(filter);
  });
});

const revealItems = document.querySelectorAll("[data-reveal]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

function toCalendarDate(value) {
  return value.replaceAll("-", "").replaceAll(":", "");
}

function escapeCalendarText(value) {
  return value.replaceAll("\\", "\\\\").replaceAll(",", "\\,").replaceAll(";", "\\;").replaceAll("\n", "\\n");
}

document.querySelectorAll("[data-calendar-event]").forEach((button) => {
  button.addEventListener("click", () => {
    const title = button.dataset.title;
    const start = button.dataset.start;
    const end = button.dataset.end;
    const location = button.dataset.location;
    const uid = `${start.replace(/[^0-9]/g, "")}@kgv-schmiedekamp.de`;
    const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const calendar = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//KGV Schmiedekamp//Vereinswebsite//DE",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART:${toCalendarDate(start)}`,
      `DTEND:${toCalendarDate(end)}`,
      `SUMMARY:${escapeCalendarText(title)}`,
      `LOCATION:${escapeCalendarText(location)}`,
      "DESCRIPTION:Öffentlicher Termin des KGV Schmiedekamp e.V.",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([calendar], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const download = document.createElement("a");
    download.href = url;
    download.download = `${title.replace("MUSTER: ", "").toLowerCase().replace(/[^a-z0-9äöüß]+/g, "-")}.ics`;
    document.body.append(download);
    download.click();
    download.remove();
    URL.revokeObjectURL(url);
  });
});
