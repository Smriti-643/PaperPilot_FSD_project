const $ = (id) => document.getElementById(id);
let conferences = [];
let selectedFileName = "";
let toastTimer;

function getRecords() {
  try { return JSON.parse(localStorage.getItem("paperpilot.records") || "[]"); }
  catch (error) { console.error("Saved records could not be read:", error); return []; }
}
function saveRecords(records) {
  try { localStorage.setItem("paperpilot.records", JSON.stringify(records)); return true; }
  catch (error) { console.error("Could not save records:", error); showToast("Browser storage is unavailable. Check your browser settings."); return false; }
}
function showToast(message) {
  const toast = $("toast"); toast.textContent = message; toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}
function goTo(page) {
  document.querySelectorAll(".page-section").forEach(section => section.classList.toggle("active", section.id === `page-${page}`));
  document.querySelectorAll(".nav-link").forEach(link => link.classList.toggle("active", link.dataset.page === page));
  const names = {dashboard:"Overview",conferences:"Explore conferences","new-submission":"New submission",submissions:"My submissions"};
  $("breadcrumbPage").textContent = names[page] || "Overview";
  $("sidebar").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelectorAll("[data-page]").forEach(button => button.addEventListener("click", () => goTo(button.dataset.page)));
document.querySelectorAll("[data-go]").forEach(button => button.addEventListener("click", () => goTo(button.dataset.go)));
$("mobileMenu").addEventListener("click", () => $("sidebar").classList.toggle("open"));

// Fetch API and JSON: conference choices are loaded from a separate JSON resource.
async function loadConferences() {
  $("conferenceMessage").textContent = "Loading conference data…";
  try {
    const response = await fetch("./data/conferences.json");
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
    conferences = await response.json();
    renderConferenceCards(conferences);
    populateConferenceSelect();
    $("conferenceMessage").textContent = "Choose a conference to view it or prepare a paper for it.";
    $("conferenceCount").textContent = `${conferences.length} sample conferences`;
  } catch (error) {
    console.error("Conference data could not be loaded:", error);
    $("conferenceMessage").textContent = "Conference data could not be loaded. Run this project using Live Server or another local web server, then refresh.";
    $("conferenceCount").textContent = "Data unavailable";
  }
}
function renderConferenceCards(items) {
  const grid = $("conferenceGrid"); grid.innerHTML = "";
  if (!items.length) {
    const empty = document.createElement("div"); empty.className = "empty-state"; empty.innerHTML = "<span class='empty-symbol'>⌕</span><strong>No conferences match</strong><p>Try a different name or location.</p>"; grid.appendChild(empty); return;
  }
  items.forEach(item => {
    const card = document.createElement("article"); card.className = "conference-card";
    const top = document.createElement("div"); top.className = "conference-topline";
    const tag = document.createElement("span"); tag.className = "conference-type"; tag.textContent = item.category || "RESEARCH CONFERENCE";
    const date = document.createElement("span"); date.className = "result-count"; date.textContent = item.date;
    top.append(tag,date);
    const title = document.createElement("h3"); title.textContent = item.name;
    const meta = document.createElement("div"); meta.className = "conference-meta";
    const loc = document.createElement("span"); loc.textContent = `⌖  ${item.location}`;
    const mode = document.createElement("span"); mode.textContent = `◇  ${item.mode || "Details available on official website"}`;
    meta.append(loc,mode);
    const choose = document.createElement("button"); choose.type = "button"; choose.textContent = "Prepare for this conference →";
    choose.addEventListener("click", () => { $("conferenceSelect").value = item.id; goTo("new-submission"); showToast("Conference selected. Complete your paper details."); });
    card.append(top,title,meta,choose); grid.appendChild(card);
  });
}
function populateConferenceSelect() {
  const select = $("conferenceSelect"); select.innerHTML = '<option value="">Choose a conference</option>';
  conferences.forEach(item => { const option = document.createElement("option"); option.value = item.id; option.textContent = item.name; select.appendChild(option); });
}
$("conferenceSearch").addEventListener("input", event => {
  const query = event.target.value.trim().toLowerCase();
  const filtered = conferences.filter(item => `${item.name} ${item.location} ${item.category || ""}`.toLowerCase().includes(query));
  renderConferenceCards(filtered); $("conferenceCount").textContent = `${filtered.length} result(s)`;
});

// Character counters are meaningful input events.
$("paperTitle").addEventListener("input", event => $("titleCount").textContent = `${event.target.value.length} / 140`);
$("abstract").addEventListener("input", event => $("abstractCount").textContent = `${event.target.value.length} / 1500`);

// Readiness checklist change events update the completion percentage.
function updateReadiness() {
  const items = [...document.querySelectorAll(".readiness-item")];
  const count = items.filter(item => item.checked).length;
  const percent = Math.round(count / items.length * 100);
  $("readinessCaption").textContent = `${count} of ${items.length} items completed`;
  $("readinessPercent").textContent = `${percent}%`;
  $("readinessBar").style.width = `${percent}%`;
}
document.querySelectorAll(".readiness-item").forEach(item => item.addEventListener("change", updateReadiness));

$("paperFile").addEventListener("change", event => {
  const file = event.target.files[0];
  selectedFileName = file ? file.name : "";
  $("fileLabel").textContent = selectedFileName || "Choose a PDF file";
});

function showFormFeedback(message, type) {
  const box = $("formFeedback"); box.textContent = message;
  box.className = `form-feedback ${type}`;
}
function resetFormUI() {
  $("titleCount").textContent = "0 / 140"; $("abstractCount").textContent = "0 / 1500";
  $("fileLabel").textContent = "Choose a PDF file"; selectedFileName = "";
  $("formFeedback").className = "form-feedback hidden"; updateReadiness();
}
$("submissionForm").addEventListener("reset", () => setTimeout(resetFormUI, 0));

// Form submission event with client-side validation and JSON/localStorage persistence.
$("submissionForm").addEventListener("submit", event => {
  event.preventDefault();
  const conference = conferences.find(item => item.id === $("conferenceSelect").value);
  const title = $("paperTitle").value.trim();
  const author = $("authorName").value.trim();
  const email = $("authorEmail").value.trim();
  const abstract = $("abstract").value.trim();
  const file = $("paperFile").files[0];
  const readyCount = document.querySelectorAll(".readiness-item:checked").length;

  if (!conference) return showFormFeedback("Please select a target conference.", "error");
  if (!title || !author || !email || !abstract) return showFormFeedback("Please complete all required fields.", "error");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showFormFeedback("Enter a valid email address, such as name@example.com.", "error");
  if (abstract.length < 40) return showFormFeedback("Your abstract must contain at least 40 characters.", "error");
  if (file && (file.type !== "application/pdf" || file.size > 5 * 1024 * 1024)) return showFormFeedback("Choose a PDF file no larger than 5 MB.", "error");
  if (readyCount !== 4) return showFormFeedback("Please confirm all four readiness checklist items before saving.", "error");

  const record = {
    id: `PP-${Date.now()}`, conferenceId: conference.id, conferenceName: conference.name,
    title, author, email, abstract, fileName: selectedFileName || "No file attached",
    status: "Draft", createdAt: new Date().toISOString()
  };
  const records = getRecords(); records.push(record);
  if (!saveRecords(records)) return;
  renderAllRecords();
  showFormFeedback("Your preparation record has been saved in this browser. Remember: this does not submit the paper to the conference.", "success");
  showToast("Paper preparation saved successfully.");
  $("submissionForm").reset(); $("conferenceSelect").value = "";
  goTo("submissions");
});

function createRecordRow(record) {
  const row = document.createElement("article"); row.className = "record-row";
  const icon = document.createElement("div"); icon.className = "record-file"; icon.textContent = "▤";
  const main = document.createElement("div"); main.className = "record-main";
  const title = document.createElement("strong"); title.textContent = record.title;
  const detail = document.createElement("small"); detail.textContent = `${record.conferenceName} · ${new Date(record.createdAt).toLocaleDateString()}`;
  main.append(title,detail);
  const status = document.createElement("span"); status.className = `status-pill ${record.status === "Marked submitted" ? "submitted" : ""}`; status.textContent = record.status;
  row.append(icon,main,status);
  const actions = document.createElement("div"); actions.className = "record-actions";
  if (record.status === "Draft") {
    const mark = document.createElement("button"); mark.type = "button"; mark.textContent = "Mark submitted";
    mark.addEventListener("click", () => updateRecordStatus(record.id));
    actions.appendChild(mark);
  }
  const remove = document.createElement("button"); remove.type = "button"; remove.className = "danger"; remove.textContent = "Delete";
  remove.addEventListener("click", () => deleteRecord(record.id));
  actions.appendChild(remove); row.append(actions);
  return row;
}
function updateRecordStatus(id) {
  const records = getRecords().map(record => record.id === id ? {...record,status:"Marked submitted"} : record);
  saveRecords(records); renderAllRecords(); showToast("Tracking status updated. This is a manual record only.");
}
function deleteRecord(id) {
  if (!confirm("Delete this saved preparation record?")) return;
  saveRecords(getRecords().filter(record => record.id !== id)); renderAllRecords(); showToast("Preparation record deleted.");
}
function renderRecent(records) {
  const container = $("recentList"); container.innerHTML = "";
  if (!records.length) {
    const empty = document.createElement("div"); empty.className = "empty-state compact";
    const symbol = document.createElement("span"); symbol.className = "empty-symbol"; symbol.textContent = "▤";
    const strong = document.createElement("strong"); strong.textContent = "Your workspace is ready";
    const p = document.createElement("p"); p.textContent = "Your saved papers will appear here.";
    const button = document.createElement("button"); button.className = "small-primary"; button.textContent = "Create your first submission"; button.addEventListener("click", () => goTo("new-submission"));
    empty.append(symbol,strong,p,button); container.appendChild(empty); return;
  }
  records.slice(-3).reverse().forEach(record => container.appendChild(createRecordRow(record)));
}
function renderAllRecords() {
  const records = getRecords();
  $("statTotal").textContent = records.length;
  $("statDrafts").textContent = records.filter(record => record.status === "Draft").length;
  $("statSubmitted").textContent = records.filter(record => record.status === "Marked submitted").length;
  $("navSubmissionCount").textContent = records.length;
  renderRecent(records);
  const query = $("submissionSearch").value.trim().toLowerCase();
  const status = $("statusFilter").value;
  const filtered = records.filter(record => `${record.title} ${record.conferenceName}`.toLowerCase().includes(query) && (status === "all" || record.status === status));
  const container = $("allSubmissions"); container.innerHTML = "";
  if (!filtered.length) {
    const empty = document.createElement("div"); empty.className = "empty-state";
    const symbol = document.createElement("span"); symbol.className = "empty-symbol"; symbol.textContent = "▤";
    const strong = document.createElement("strong"); strong.textContent = records.length ? "No matching submissions" : "No submissions yet";
    const p = document.createElement("p"); p.textContent = records.length ? "Try changing your search or status filter." : "Your saved preparation records will appear here.";
    empty.append(symbol,strong,p);
    if (!records.length) { const button = document.createElement("button"); button.className = "small-primary"; button.textContent = "Prepare a paper"; button.addEventListener("click", () => goTo("new-submission")); empty.appendChild(button); }
    container.appendChild(empty);
  } else filtered.slice().reverse().forEach(record => container.appendChild(createRecordRow(record)));
}
$("submissionSearch").addEventListener("input", renderAllRecords);
$("statusFilter").addEventListener("change", renderAllRecords);

loadConferences();
renderAllRecords();
updateReadiness();
