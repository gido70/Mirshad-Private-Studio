const state = {
  data: null,
  radar: null,
  view: 'radar',
  favorites: JSON.parse(localStorage.getItem('mirshad:favorites') || '{"tools":[],"workflows":[]}'),
  videoDone: JSON.parse(localStorage.getItem('mirshad:video-progress') || '[]'),
  radarRead: JSON.parse(localStorage.getItem('mirshad:radar-read') || '[]'),
  radarUnreadOnly: false,
  toolLimit: 36,
  deferredInstall: null
};

const videoSteps = [
  ['الهدف والجمهور', 'حدد الرسالة، المشاهد، منصة العرض، والنتيجة المطلوبة.', 'قرار بشري'],
  ['البحث والمصادر', 'اجمع المصادر الأصلية وسجل ما يدعم كل ادعاء.', 'بحث'],
  ['كتابة النص', 'اكتب نصًا عربيًا مناسبًا لمدة 60–90 ثانية.', 'نص'],
  ['لوحة المشاهد', 'حوّل النص إلى لقطات محددة مع الزمن والحركة.', 'تخطيط'],
  ['توليد الصور', 'أنشئ أو اختر الأصول البصرية مع ثبات الهوية.', 'صورة'],
  ['تحويل النص إلى صوت', 'اختبر صوتًا عربيًا ثابتًا واحفظ قاموس النطق.', 'صوت'],
  ['فحص النطق العربي', 'راجع الأسماء والأرقام والتشكيل واللهجة.', 'جودة'],
  ['توليد أو تحريك المشاهد', 'نفّذ عينة قصيرة أولًا قبل بقية اللقطات.', 'فيديو'],
  ['المونتاج', 'ادمج المشاهد والصوت والموسيقى وانتقالات محدودة.', 'تحرير'],
  ['تحويل الصوت إلى نص', 'استخرج التفريغ النهائي من النسخة الممنتجة.', 'تفريغ'],
  ['الترجمة والتسميات', 'صحح Captions واختبر قراءتها على الهاتف.', 'إتاحة'],
  ['التصدير والقياس', 'صدّر النسخة، ثم سجل الزمن والتكلفة والجودة والأخطاء.', 'اعتماد']
];

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

function normalizeArabic(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ـ/g, '')
    .trim();
}

function esc(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

function toast(message) {
  const node = qs('#toast');
  node.textContent = message;
  node.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove('show'), 2200);
}

function saveFavorites() {
  localStorage.setItem('mirshad:favorites', JSON.stringify(state.favorites));
}

function isFavorite(type, id) {
  return state.favorites[type].includes(Number(id));
}

function toggleFavorite(type, id) {
  const numericId = Number(id);
  const list = state.favorites[type];
  const index = list.indexOf(numericId);
  if (index >= 0) list.splice(index, 1);
  else list.push(numericId);
  saveFavorites();
  toast(index >= 0 ? 'أُزيل من المحفوظات' : 'حُفظ للرجوع إليه');
  renderCurrentView();
}

function setView(view, updateHash = true) {
  if (!qs(`#view-${view}`)) view = 'radar';
  if (updateHash && (state.view !== view || location.hash !== `#${view}`)) {
    const trail = [...(history.state?.mirshadTrail || [state.view]), view];
    history.pushState({ mirshadTrail: trail }, '', `#${view}`);
  }
  state.view = view;
  qsa('.view').forEach((node) => node.classList.toggle('active', node.id === `view-${view}`));
  qsa('[data-view]').forEach((button) => button.classList.toggle('active', button.dataset.view === view));
  qs('#page-title').textContent = qs(`#view-${view}`).dataset.title;
  qs('#sidebar').classList.remove('open');
  qs('#menu-button').setAttribute('aria-expanded', 'false');
  renderJourney();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  renderCurrentView();
}

function renderJourney() {
  const trail = history.state?.mirshadTrail || [state.view];
  qs('#journey-trail').innerHTML = trail.map((view, index) => {
    const title = qs(`#view-${view}`)?.dataset.title || view;
    return `<button type="button" data-journey-index="${index}" ${index === trail.length - 1 ? 'aria-current="page"' : ''}>${esc(title)}</button>`;
  }).join('<span aria-hidden="true">‹</span>');
  qs('#journey-back').disabled = trail.length <= 1;
}

function workflowCard(item) {
  const saved = isFavorite('workflows', item.id);
  return `<article class="workflow-card">
    <div class="card-head"><h3>${esc(item.title)}</h3><span class="risk ${item.risk === 'مرتفع' ? 'risk-high' : 'risk-medium'}">${esc(item.risk)}</span></div>
    <p class="card-copy"><b>المدخلات:</b> ${esc(item.input)}</p>
    <div class="card-meta"><span>${esc(item.steps.split('←').length)} مراحل</span><span>قرار بشري محفوظ</span></div>
    <div class="card-actions"><button class="open-detail" data-workflow-id="${item.id}" type="button">فتح الطريق ←</button><button class="favorite-button ${saved ? 'saved' : ''}" data-favorite-type="workflows" data-favorite-id="${item.id}" type="button" aria-label="${saved ? 'إزالة من المحفوظات' : 'حفظ'}">${saved ? '♥' : '♡'}</button></div>
  </article>`;
}

function toolCard(item) {
  const saved = isFavorite('tools', item.id);
  return `<article class="tool-card">
    <div class="card-head"><h3 dir="auto">${esc(item.name)}</h3><span class="evidence evidence-${item.evidence}">${esc(item.evidence)}</span></div>
    <p class="card-copy">${esc(item.note)}</p>
    <div class="card-meta"><span>${esc(item.categoryLabel)}</span><span>${esc(item.kind)}</span><span>${esc(item.access)}</span></div>
    <div class="card-actions"><button class="open-detail" data-tool-id="${item.id}" type="button">التفاصيل ←</button><button class="favorite-button ${saved ? 'saved' : ''}" data-favorite-type="tools" data-favorite-id="${item.id}" type="button" aria-label="${saved ? 'إزالة من المحفوظات' : 'حفظ'}">${saved ? '♥' : '♡'}</button></div>
  </article>`;
}

function formatArabicDate(value) {
  if (!value) return 'غير محدد';
  return new Intl.DateTimeFormat('ar-AE', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
}

function radarCard(item) {
  const isRead = state.radarRead.includes(item.id);
  return `<article class="radar-card ${isRead ? 'read' : ''}">
    <div class="radar-card-rail"><span class="radar-product">${esc(item.product)}</span><time datetime="${esc(item.date)}">${esc(formatArabicDate(item.date))}</time></div>
    <div class="radar-card-body">
      <div class="radar-card-top">
        <div class="radar-tags"><span class="priority priority-${item.priority === 'عالية' ? 'high' : item.priority === 'متوسطة' ? 'medium' : 'low'}">${esc(item.priority)}</span><span>${esc(item.category)}</span><span>${esc(item.type)}</span></div>
        ${isRead ? '<span class="read-state">مقروء</span>' : '<span class="new-state"><i></i> جديد</span>'}
      </div>
      <h3>${esc(item.title)}</h3>
      <p class="radar-summary-copy">${esc(item.summary)}</p>
      <div class="radar-impact"><span>لماذا يهمك؟</span><p>${esc(item.impact)}</p></div>
      <div class="content-angle"><span>فكرة محتوى</span><p>${esc(item.contentIdea)}</p></div>
      <div class="radar-facts"><span>العربية: ${esc(item.arabic)}</span><span>الوصول: ${esc(item.cost)}</span><span>القرار: ${esc(item.decision)}</span></div>
      <div class="radar-card-actions"><a href="${esc(item.sourceUrl)}" target="_blank" rel="noopener">المصدر الرسمي ↗</a><button type="button" data-radar-read="${esc(item.id)}">${isRead ? 'إعادة إلى غير المقروء' : 'تعليم كمقروء'}</button></div>
    </div>
  </article>`;
}

function updateRadarMetrics() {
  if (!state.radar) return;
  const updates = state.radar.updates;
  const unread = updates.filter((item) => !state.radarRead.includes(item.id));
  qs('#radar-total').textContent = updates.length;
  qs('#radar-high').textContent = updates.filter((item) => item.priority === 'عالية').length;
  qs('#radar-content-count').textContent = updates.filter((item) => item.contentIdea).length;
  qs('#radar-unread').textContent = unread.length;
  qs('#radar-nav-badge').hidden = unread.length === 0;
  qs('#radar-nav-badge').textContent = unread.length;
}

function renderRadar() {
  if (!state.radar) return;
  const category = qs('#radar-category').value;
  const priority = qs('#radar-priority').value;
  const filtered = state.radar.updates.filter((item) => {
    const unreadMatch = !state.radarUnreadOnly || !state.radarRead.includes(item.id);
    return unreadMatch && (category === 'all' || item.category === category) && (priority === 'all' || item.priority === priority);
  });
  qs('#radar-cycle').textContent = state.radar.cycle;
  qs('#radar-updated-at').textContent = formatArabicDate(state.radar.generatedAt);
  qs('#radar-summary').textContent = `${filtered.length} مستجدًا ظاهرًا من أصل ${state.radar.updates.length}`;
  qs('#radar-list').innerHTML = filtered.length ? filtered.map(radarCard).join('') : emptyState('لا توجد مستجدات مطابقة', 'أزل المرشحات أو اعرض جميع العناصر.');
  qs('#radar-unread-only').textContent = state.radarUnreadOnly ? 'عرض جميع المستجدات' : 'عرض غير المقروء';
  updateRadarMetrics();
}

function renderHome() {
  const { categories, tools, workflows } = state.data;
  qs('#metric-categories').textContent = Object.keys(categories).length;
  qs('#metric-tools').textContent = tools.length;
  qs('#metric-workflows').textContent = workflows.length;
  qs('#featured-workflows').innerHTML = workflows.slice(0, 3).map(workflowCard).join('');
  updateVideoProgress();
}

function renderWorkflows() {
  const query = normalizeArabic(qs('#workflow-search').value);
  const risk = qs('#workflow-risk').value;
  const filtered = state.data.workflows.filter((item) => {
    const text = normalizeArabic(`${item.title} ${item.input} ${item.steps} ${item.gate} ${item.human}`);
    return (!query || text.includes(query)) && (risk === 'all' || item.risk === risk);
  });
  qs('#workflow-count').textContent = `${filtered.length} مسارًا من أصل ${state.data.workflows.length}`;
  qs('#workflow-list').innerHTML = filtered.length ? filtered.map(workflowCard).join('') : emptyState('لا توجد مسارات مطابقة', 'جرّب كلمة أقصر أو أزل مرشح المخاطر.');
}

function renderTools(resetLimit = false) {
  if (resetLimit) state.toolLimit = 36;
  const query = normalizeArabic(qs('#tool-search').value);
  const category = qs('#tool-category').value;
  const evidence = qs('#tool-evidence').value;
  const filtered = state.data.tools.filter((item) => {
    const text = normalizeArabic(`${item.name} ${item.categoryLabel} ${item.kind} ${item.access} ${item.note} ${item.status}`);
    return (!query || text.includes(query)) && (category === 'all' || item.category === category) && (evidence === 'all' || item.evidence === evidence);
  });
  const visible = filtered.slice(0, state.toolLimit);
  qs('#tool-count').textContent = `${filtered.length} نتيجة من أصل ${state.data.tools.length}`;
  qs('#tool-list').innerHTML = visible.length ? visible.map(toolCard).join('') : emptyState('لا توجد أدوات مطابقة', 'جرّب اسمًا آخر أو أعد ضبط المرشحات.');
  const loadMore = qs('#load-more-tools');
  loadMore.hidden = visible.length >= filtered.length;
  loadMore.textContent = `عرض المزيد (${filtered.length - visible.length})`;
}

function searchAll() {
  const input = qs('#global-search-input');
  const query = normalizeArabic(input.value);
  const target = qs('#global-results');
  if (!query) {
    qs('#global-search-summary').textContent = 'اكتب كلمة للبحث في الاستوديو.';
    target.innerHTML = '';
    return;
  }
  const tools = state.data.tools.filter((item) => normalizeArabic(`${item.name} ${item.categoryLabel} ${item.kind} ${item.access} ${item.note}`).includes(query));
  const workflows = state.data.workflows.filter((item) => normalizeArabic(`${item.title} ${item.input} ${item.steps} ${item.gate} ${item.human}`).includes(query));
  qs('#global-search-summary').textContent = `${tools.length + workflows.length} نتيجة: ${workflows.length} مسار و${tools.length} أداة.`;
  if (!tools.length && !workflows.length) {
    target.innerHTML = emptyState('لم أجد نتيجة مطابقة', 'استخدم كلمة أقصر مثل: فيديو، صوت، بحث، ترجمة أو عرض.');
    return;
  }
  target.innerHTML = `${workflows.length ? `<section class="result-group"><h3>مسارات العمل (${workflows.length})</h3><div class="cards-grid">${workflows.slice(0, 12).map(workflowCard).join('')}</div></section>` : ''}${tools.length ? `<section class="result-group"><h3>الأدوات والنماذج (${tools.length})</h3><div class="cards-grid tools">${tools.slice(0, 24).map(toolCard).join('')}</div></section>` : ''}`;
}

function renderVideo() {
  qs('#video-steps').innerHTML = videoSteps.map((step, index) => {
    const done = state.videoDone.includes(index + 1);
    return `<label class="lab-step ${done ? 'done' : ''}"><input type="checkbox" data-video-step="${index + 1}" ${done ? 'checked' : ''}><span class="step-number">${index + 1}</span><div><h3>${esc(step[0])}</h3><p>${esc(step[1])}</p></div><span class="step-tag">${esc(step[2])}</span></label>`;
  }).join('');
  updateVideoProgress();
}

function updateVideoProgress() {
  const percent = Math.round((state.videoDone.length / videoSteps.length) * 100);
  ['#video-progress', '#home-video-progress'].forEach((selector) => { const node = qs(selector); if (node) node.style.width = `${percent}%`; });
  ['#video-progress-label', '#home-video-progress-label'].forEach((selector) => { const node = qs(selector); if (node) node.textContent = `${percent}%`; });
}

function renderFavorites() {
  const tools = state.data.tools.filter((item) => state.favorites.tools.includes(item.id));
  const workflows = state.data.workflows.filter((item) => state.favorites.workflows.includes(item.id));
  const target = qs('#favorites-content');
  if (!tools.length && !workflows.length) {
    target.innerHTML = emptyState('لا توجد محفوظات بعد', 'اضغط علامة القلب بجانب أي أداة أو مسار للرجوع إليه بسرعة.');
    return;
  }
  target.innerHTML = `${workflows.length ? `<section class="result-group"><h3>المسارات (${workflows.length})</h3><div class="cards-grid">${workflows.map(workflowCard).join('')}</div></section>` : ''}${tools.length ? `<section class="result-group"><h3>الأدوات (${tools.length})</h3><div class="cards-grid tools">${tools.map(toolCard).join('')}</div></section>` : ''}`;
}

function renderCurrentView() {
  if (!state.data) return;
  if (state.view === 'radar') renderRadar();
  if (state.view === 'home') renderHome();
  if (state.view === 'workflows') renderWorkflows();
  if (state.view === 'tools') renderTools();
  if (state.view === 'video') renderVideo();
  if (state.view === 'favorites') renderFavorites();
}

function emptyState(title, copy) {
  return `<div class="empty-state"><strong>${esc(title)}</strong><span>${esc(copy)}</span></div>`;
}

function openWorkflow(id) {
  const item = state.data.workflows.find((entry) => entry.id === Number(id));
  if (!item) return;
  const prompt = `أنت مدير إنتاج وباحث متخصص. أريد تنفيذ مسار: «${item.title}».\n\nالمدخلات المتاحة: ${item.input}.\nابنِ لي خطة تنفيذ عملية وفق التسلسل: ${item.steps}.\nاجعل بوابة الجودة الإلزامية: ${item.gate}.\nوضح ما يجب أن يبقى قرارًا بشريًا: ${item.human}.\n\nأخرج النتيجة في جدول: المرحلة | المدخلات | الأداة المقترحة | المخرج | فحص الجودة | الخطر | قرار الإنسان.`;
  qs('#dialog-kicker').textContent = 'مسار عمل';
  qs('#dialog-title').textContent = item.title;
  qs('#dialog-body').innerHTML = `<div class="dialog-row"><span>المدخلات</span><b>${esc(item.input)}</b></div><div class="dialog-row"><span>خطوات التنفيذ</span><b>${esc(item.steps)}</b></div><div class="dialog-row"><span>بوابة الجودة</span><b>${esc(item.gate)}</b></div><div class="dialog-row"><span>القرار البشري</span><b>${esc(item.human)}</b></div><div class="dialog-row"><span>برومبت البدء</span><pre class="prompt-box" id="active-prompt">${esc(prompt)}</pre></div>`;
  qs('#dialog-actions').innerHTML = `<button type="button" data-copy-prompt>نسخ البرومبت</button><button class="favorite-button ${isFavorite('workflows', item.id) ? 'saved' : ''}" data-favorite-type="workflows" data-favorite-id="${item.id}" type="button">${isFavorite('workflows', item.id) ? '♥ محفوظ' : '♡ حفظ'}</button>`;
  qs('#detail-dialog').showModal();
}

function openTool(id) {
  const item = state.data.tools.find((entry) => entry.id === Number(id));
  if (!item) return;
  qs('#dialog-kicker').textContent = item.categoryLabel;
  qs('#dialog-title').textContent = item.name;
  qs('#dialog-body').innerHTML = `<div class="dialog-row"><span>تعريف الأداة ومجالها</span><b>${esc(item.name)}: ${esc(item.kind)} · ${esc(item.categoryLabel)}</b></div><div class="dialog-row"><span>ماذا تفعل وما فائدتها؟</span><b>${esc(item.note)}</b></div><div class="dialog-row"><span>طريقة الوصول</span><b>${esc(item.access)}</b></div><div class="dialog-row"><span>التقييم وحالة التحقق</span><b>${esc(item.evidence)} — ${esc(item.status)}</b></div><div class="dialog-row"><span>قبل الاستخدام</span><b>هذا وصف في الدليل وليس تشغيلًا مدمجًا. افتح صفحة الأداة، ثم اختبر فائدتها على عينة حقيقية ووثّق الجودة والتكلفة والقيود.</b></div>`;
  qs('#dialog-actions').innerHTML = `${item.url ? `<a href="${esc(item.url)}" target="_blank" rel="noopener">زيارة صفحة الأداة ↗</a>` : ''}<button class="favorite-button ${isFavorite('tools', item.id) ? 'saved' : ''}" data-favorite-type="tools" data-favorite-id="${item.id}" type="button">${isFavorite('tools', item.id) ? '♥ محفوظ' : '♡ حفظ'}</button>`;
  qs('#detail-dialog').showModal();
}

async function copyPrompt() {
  const prompt = qs('#active-prompt')?.innerText;
  if (!prompt) return;
  try { await navigator.clipboard.writeText(prompt); toast('تم نسخ البرومبت'); }
  catch { toast('حدد النص وانسخه يدويًا'); }
}

function bindEvents() {
  document.addEventListener('click', (event) => {
    const journey = event.target.closest('[data-journey-index]');
    if (journey) { history.go(Number(journey.dataset.journeyIndex) - (history.state?.mirshadTrail?.length || 1) + 1); return; }
    const viewButton = event.target.closest('[data-view], [data-open-view]');
    if (viewButton) setView(viewButton.dataset.view || viewButton.dataset.openView);
    const favorite = event.target.closest('[data-favorite-type]');
    if (favorite) toggleFavorite(favorite.dataset.favoriteType, favorite.dataset.favoriteId);
    const workflow = event.target.closest('[data-workflow-id]');
    if (workflow) openWorkflow(workflow.dataset.workflowId);
    const tool = event.target.closest('[data-tool-id]');
    if (tool) openTool(tool.dataset.toolId);
    const radarRead = event.target.closest('[data-radar-read]');
    if (radarRead) {
      const id = radarRead.dataset.radarRead;
      if (state.radarRead.includes(id)) state.radarRead = state.radarRead.filter((item) => item !== id);
      else state.radarRead.push(id);
      localStorage.setItem('mirshad:radar-read', JSON.stringify(state.radarRead));
      renderRadar();
    }
    const quick = event.target.closest('[data-quick-search]');
    if (quick) {
      qs('#global-search-input').value = quick.dataset.quickSearch;
      setView('search');
      searchAll();
    }
    if (event.target.closest('[data-copy-prompt]')) copyPrompt();
  });

  qs('#menu-button').addEventListener('click', () => {
    const sidebar = qs('#sidebar');
    const open = sidebar.classList.toggle('open');
    qs('#menu-button').setAttribute('aria-expanded', String(open));
  });
  qs('#hero-search-form').addEventListener('submit', (event) => {
    event.preventDefault();
    qs('#global-search-input').value = qs('#hero-search-input').value;
    setView('search');
    searchAll();
  });
  qs('#global-search-input').addEventListener('input', searchAll);
  qs('#global-search-form').addEventListener('submit', (event) => { event.preventDefault(); searchAll(); });
  qs('#global-search-clear').addEventListener('click', () => { qs('#global-search-input').value = ''; searchAll(); qs('#global-search-input').focus(); });
  qs('#workflow-search').addEventListener('input', renderWorkflows);
  qs('#workflow-risk').addEventListener('change', renderWorkflows);
  ['#tool-search', '#tool-category', '#tool-evidence'].forEach((selector) => qs(selector).addEventListener(selector === '#tool-search' ? 'input' : 'change', () => renderTools(true)));
  qs('#tool-search-submit').addEventListener('click', () => renderTools(true));
  qs('#journey-back').addEventListener('click', () => { if ((history.state?.mirshadTrail?.length || 1) > 1) history.back(); });
  qs('#journey-home').addEventListener('click', () => setView('radar'));
  qs('#reset-tools').addEventListener('click', () => { qs('#tool-search').value = ''; qs('#tool-category').value = 'all'; qs('#tool-evidence').value = 'all'; renderTools(true); });
  qs('#load-more-tools').addEventListener('click', () => { state.toolLimit += 36; renderTools(); });
  qs('#video-steps').addEventListener('change', (event) => {
    const input = event.target.closest('[data-video-step]');
    if (!input) return;
    const id = Number(input.dataset.videoStep);
    if (input.checked && !state.videoDone.includes(id)) state.videoDone.push(id);
    if (!input.checked) state.videoDone = state.videoDone.filter((item) => item !== id);
    state.videoDone.sort((a, b) => a - b);
    localStorage.setItem('mirshad:video-progress', JSON.stringify(state.videoDone));
    renderVideo();
  });
  qs('#reset-video').addEventListener('click', () => { state.videoDone = []; localStorage.setItem('mirshad:video-progress', '[]'); renderVideo(); toast('بدأت التجربة من جديد'); });
  qs('#radar-category').addEventListener('change', renderRadar);
  qs('#radar-priority').addEventListener('change', renderRadar);
  qs('#radar-unread-only').addEventListener('click', () => { state.radarUnreadOnly = !state.radarUnreadOnly; renderRadar(); });
  qs('#radar-mark-all').addEventListener('click', () => {
    state.radarRead = state.radar.updates.map((item) => item.id);
    localStorage.setItem('mirshad:radar-read', JSON.stringify(state.radarRead));
    renderRadar();
    toast('تم تعليم مستجدات الرادار كمقروءة');
  });
  qs('#dialog-close').addEventListener('click', () => qs('#detail-dialog').close());
  qs('#detail-dialog').addEventListener('click', (event) => { if (event.target === qs('#detail-dialog')) qs('#detail-dialog').close(); });
  window.addEventListener('popstate', () => setView(location.hash.slice(1) || 'radar', false));
  window.addEventListener('hashchange', () => setView(location.hash.slice(1) || 'radar', false));
  window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); state.deferredInstall = event; qs('#install-button').hidden = false; });
  qs('#install-button').addEventListener('click', async () => {
    if (!state.deferredInstall) return;
    state.deferredInstall.prompt();
    await state.deferredInstall.userChoice;
    state.deferredInstall = null;
    qs('#install-button').hidden = true;
  });
  qs('#ios-install-button').addEventListener('click', () => {
    toast('في Safari: اضغط مشاركة، ثم «إضافة إلى الشاشة الرئيسية»');
  });
}

async function init() {
  try {
    const [dataResponse, radarResponse] = await Promise.all([fetch('./data.json'), fetch('./radar.json')]);
    if (!dataResponse.ok || !radarResponse.ok) throw new Error('تعذر تحميل البيانات');
    state.data = await dataResponse.json();
    state.radar = await radarResponse.json();
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    qs('#ios-install-button').hidden = !(isIos && !isStandalone);
    const categorySelect = qs('#tool-category');
    Object.entries(state.data.categories).forEach(([value, label]) => categorySelect.insertAdjacentHTML('beforeend', `<option value="${esc(value)}">${esc(label)}</option>`));
    const radarCategory = qs('#radar-category');
    [...new Set(state.radar.updates.map((item) => item.category))].sort().forEach((label) => radarCategory.insertAdjacentHTML('beforeend', `<option value="${esc(label)}">${esc(label)}</option>`));
    bindEvents();
    history.replaceState({ mirshadTrail: [qs(`#view-${location.hash.slice(1)}`) ? location.hash.slice(1) : 'radar'] }, '', location.href);
    setView(location.hash.slice(1) || 'radar', false);
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  } catch (error) {
    document.body.innerHTML = `<main class="empty-state" style="margin:3rem"><strong>تعذر فتح استوديو مِرْشاد</strong><span>${esc(error.message)}</span></main>`;
  }
}

init();
