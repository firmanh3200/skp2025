/* ...existing code... */
const mqPortrait = window.matchMedia("(orientation: portrait), (max-width: 879px)");
const root = document.documentElement;
const kegiatan = document.getElementById('kegiatan');
const tabList = document.getElementById('tabList');
const tabs = Array.from(tabList.querySelectorAll('[role="tab"]'));
const panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));
const yearEl = document.getElementById('year');
yearEl.textContent = new Date().getFullYear();

/* build accordion structure for mobile when needed */
function enableAccordion() {
  // add class marker
  if (!kegiatan.classList.contains('is-accordion')) kegiatan.classList.add('is-accordion');
  // ensure panels are rendered as accordion items
  const panelsParent = document.querySelector('.panels');
  // store existing panels in a map before we clear the container (prevents null lookups)
  const existingPanelMap = new Map(panels.map(p => [p.id, p]));
  panelsParent.innerHTML = ''; // clear, we'll re-populate
  tabs.forEach((tab, i) => {
    const id = tab.getAttribute('aria-controls');
    const panel = existingPanelMap.get(id) || document.getElementById(id);
    const item = document.createElement('div');
    item.className = 'accordion-item';
    const trigger = document.createElement('button');
    trigger.className = 'accordion-trigger';
    trigger.type = 'button';
    trigger.setAttribute('aria-expanded', 'false');
    trigger.dataset.target = id;
    trigger.innerHTML = `<span>${tab.textContent}</span><span aria-hidden="true">▾</span>`;
    const content = document.createElement('div');
    content.className = 'accordion-content';
    // avoid duplicate IDs in DOM (use a suffix)
    content.id = id + '-acc';
    // move full panel inner HTML (preserve lists and paragraphs)
    if (panel) {
      // clone inner HTML of the original panel so <p>, <ul>, <li> are preserved
      content.innerHTML = panel.innerHTML;
      // remove any role/aria attributes inside cloned content that might conflict
      content.querySelectorAll('[role]').forEach(n=> n.removeAttribute('role'));
      content.querySelectorAll('[aria-labelledby]').forEach(n=> n.removeAttribute('aria-labelledby'));
    } else {
      content.innerHTML = `<h2>${tab.textContent}</h2>`;
    }
    trigger.addEventListener('click', ()=> {
      const open = trigger.getAttribute('aria-expanded') === 'true';
      // collapse all
      document.querySelectorAll('.accordion-trigger').forEach(t=>t.setAttribute('aria-expanded','false'));
      document.querySelectorAll('.accordion-content').forEach(c=>c.classList.remove('open'));
      if (!open){
        trigger.setAttribute('aria-expanded','true');
        content.classList.add('open');
        // smooth scroll into view
        setTimeout(()=> trigger.scrollIntoView({behavior:'smooth', block:'start'}), 100);
      }
    });
    item.appendChild(trigger);
    item.appendChild(content);
    panelsParent.appendChild(item);
    // open first item by default
    if (i === 0) {
      trigger.setAttribute('aria-expanded','true');
      content.classList.add('open');
    }
  });
}

/* enable tabs layout */
function enableTabs() {
  kegiatan.classList.remove('is-accordion');
  // restore original panels layout
  const panelsParent = document.querySelector('.panels');
  panelsParent.innerHTML = '';
  panels.forEach(p => {
    const clone = p.cloneNode(true);
    panelsParent.appendChild(clone);
  });
  // re-bind tabs to show panels
  const allPanels = Array.from(document.querySelectorAll('[role="tabpanel"]'));
  tabs.forEach(tab=>{
    tab.addEventListener('click', (e)=>{
      tabs.forEach(t=> t.setAttribute('aria-selected','false'));
      tab.setAttribute('aria-selected','true');
      // switch panels
      allPanels.forEach(p=>{
        p.classList.remove('active');
        if (p.id === tab.getAttribute('aria-controls')) p.classList.add('active');
      });
    });
  });
  // ensure first tab active
  tabs.forEach(t=> t.setAttribute('aria-selected','false'));
  tabs[0].setAttribute('aria-selected','true');
  allPanels.forEach(p=> p.classList.remove('active'));
  const firstPanel = document.getElementById(tabs[0].getAttribute('aria-controls'));
  if (firstPanel) firstPanel.classList.add('active');
}

/* watch orientation / size and toggle UI */
function updateMode() {
  if (mqPortrait.matches) {
    enableAccordion();
  } else {
    enableTabs();
  }
}

/* initial run */
updateMode();

/* listen to changes */
mqPortrait.addEventListener ? mqPortrait.addEventListener('change', updateMode) : mqPortrait.addListener(updateMode);

/* small theme toggle (persist in localStorage) */
const themeToggle = document.getElementById('themeToggle');
const setTheme = (dark) => {
  if (dark) {
    document.documentElement.style.setProperty('--bg','#071823');
    document.documentElement.style.setProperty('--card','#061219');
    document.documentElement.style.setProperty('--muted','#9fb6b5');
    document.documentElement.style.setProperty('--accent','#3dd9d3');
    // ensure high contrast readable text in dark mode
    document.documentElement.style.setProperty('--text','#e6f7f6');
    document.documentElement.style.setProperty('--card-text','#bfecea');
    themeToggle.setAttribute('aria-pressed','true');
  } else {
    document.documentElement.style.removeProperty('--bg');
    document.documentElement.style.removeProperty('--card');
    document.documentElement.style.removeProperty('--muted');
    document.documentElement.style.removeProperty('--accent');
    document.documentElement.style.removeProperty('--text');
    document.documentElement.style.removeProperty('--card-text');
    themeToggle.setAttribute('aria-pressed','false');
  }
};
const saved = localStorage.getItem('ds_theme') === 'dark';
if (saved) setTheme(true);
themeToggle.addEventListener('click', ()=>{
  const dark = themeToggle.getAttribute('aria-pressed') !== 'true';
  setTheme(dark);
  localStorage.setItem('ds_theme', dark ? 'dark' : 'light');
});
/* ...existing code... */