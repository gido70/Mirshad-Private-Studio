const state = {
  data: null,
  radar: null,
  guide: null,
  index: null,
  view: 'radar',
  favorites: JSON.parse(localStorage.getItem('mirshad:favorites') || '{"tools":[],"workflows":[]}'),
  intake: JSON.parse(localStorage.getItem('mirshad:intake') || 'null'),
  videoDone: JSON.parse(localStorage.getItem('mirshad:video-progress') || '[]'),
  videoBrief: JSON.parse(localStorage.getItem('mirshad:video-brief') || 'null'),
  videoChoices: JSON.parse(localStorage.getItem('mirshad:video-choices') || '{}'),
  videoTrial: JSON.parse(localStorage.getItem('mirshad:video-trial') || '{}'),
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

const videoGuidance = [
  ['اكتب لمن الإعلان وما الذي سيفهمه المشاهد في النهاية. لإعلان مسار AI: الجمهور متعلم يريد اختيار أداة والبدء بمهمة؛ الصيغة أفقية ونحو 65 ثانية.', 'احفظ الموجز أعلاه، ثم علّم هذه المرحلة منجزة.'],
  ['راجع عناوين الوحدات الخمس ووصف الحقيبة، وتأكد أن الإعلان لا يعد بتنفيذ المهام داخل أدوات خارجية.', 'دوّن أي ادعاء يحتاج مصدرًا قبل متابعة النص.'],
  ['اقرأ النص بصوت مسموع واضبط طوله ولغته. النص الجاهز لهذه التجربة هو سيناريو إعلان مسار AI الذي راجعته.', 'راجع النص ثم علّم المرحلة منجزة.'],
  ['رتّب المشاهد: الأفاتار في البداية والختام، وبينهما أغلفة الوحدات الخمس بالترتيب.', 'اضبط زمن كل لقطة في جدول المشاهد.'],
  ['ابدأ بصورة الأفاتار وحدها للتجربة؛ الشعار وأغلفة الوحدات تأتي في المونتاج. الصورة الثابتة ليست أفاتارًا متحدثًا بعد.', 'افحص المقاس والحقوق ووضوح الصورة.'],
  ['أنشئ عينة صوتية للافتتاحية فقط: «عندك فكرة، لكنك لا تعرف من أين تبدأ؟». ابدأ بالخيار المتاح في حسابك، وافحص الشروط قبل أي تكلفة.', 'قارن أدوات الصوت في الدليل'],
  ['استمع إلى العينة وافحص «مسار AI» والمصطلحات والوقفات؛ عدّل النص أو قاموس النطق إذا لزم.', 'لا تكمل قبل قبول الصوت العربي.'],
  ['جرّب صورة الأفاتار مع أول 10–15 ثانية من تسجيلك الصوتي. في InfiniteTalk يلزم ملف الصوت؛ النص توجيه اختياري للمشهد. راقب ثبات الوجه واليدين وتزامن الشفاه والعربية، ثم احفظ العينة. لا تعلّم الخطوة منجزة قبل مشاهدتها.', 'قارن أدوات الأفاتار في الدليل'],
  ['اجمع مقطع الأفاتار مع أغلفة الوحدات والشعار في محرر فيديو، واترك الموسيقى تحت الكلام.', 'قارن أدوات المونتاج في الدليل'],
  ['استخرج النص المنطوق من النسخة الممنتجة وقارنه بالنص المعتمد.', 'صحح أي كلمات أسقطها التفريغ.'],
  ['أضف ترجمة عربية قصيرة واضحة، وراجعها يدويًا على شاشة الهاتف.', 'لا تغطِّ الوجه أو عنوان الوحدة.'],
  ['صدّر MP4 ثم راجع النطق والحقوق والمدة والجودة والتكلفة الفعلية قبل استبدال الإعلان القديم.', 'سجل ما نجح وما يحتاج تعديلًا.']
];
const videoToolQueries = {6:'صوت عربي',8:'أفاتار',9:'مونتاج فيديو'};
const videoToolOptions = {5:['WaveSpeedAI'],6:['ElevenLabs','Gemini TTS','WaveSpeedAI'],8:['WaveSpeedAI','HeyGen','LivePortrait'],9:['CapCut','DaVinci Resolve']};
const trialSteps = [6, 8, 9];
const toolCategories = (item) => item.categories || [item.category];
const toolCategoryLabels = (item) => toolCategories(item).map(key => state.data.categories[key]).filter(Boolean).join('، ');

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
    <div class="card-actions"><button class="open-detail" data-workflow-id="${item.id}" type="button">عرض تفاصيل المسار ←</button><button class="favorite-button ${saved ? 'saved' : ''}" data-favorite-type="workflows" data-favorite-id="${item.id}" type="button" aria-label="${saved ? 'إزالة من المحفوظات' : 'حفظ'}">${saved ? '♥' : '♡'}</button></div>
  </article>`;
}

function toolCard(item) {
  const saved = isFavorite('tools', item.id);
  const price = state.guide?.pricing[item.name];
  return `<article class="tool-card">
    <div class="card-head"><h3 dir="auto">${esc(item.name)}</h3><span class="evidence evidence-${item.evidence}">${esc(item.evidence)}</span></div>
    <p class="card-copy">${esc(item.note)}</p>
    <div class="card-meta"><span>${esc(toolCategoryLabels(item))}</span><span>${esc(item.kind)}</span><span>${esc(price?.tier || 'السعر غير موثق')}</span></div>
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

function renderMap() {
  qs('#map-prompts').innerHTML = state.guide.intents.map((item) => `<article class="workflow-card"><div class="card-head"><h3>${esc(item.title)}</h3></div><p class="card-copy">${esc(item.lead)}</p><div class="card-actions"><button class="open-detail" type="button" data-intent-prompt="${esc(item.id)}">افتح البرومبت والنصيحة ←</button><button class="text-button" type="button" data-intent-search="${esc(item.title)}">اعرض الأدوات</button></div></article>`).join('');
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
    const text = normalizeArabic(`${item.name} ${toolCategoryLabels(item)} ${item.kind} ${item.access} ${item.note} ${item.status}`);
    return (!query || text.includes(query)) && (category === 'all' || toolCategories(item).includes(category)) && (evidence === 'all' || item.evidence === evidence);
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
  const selectedCategory = qs('#search-category').value;
  const priceFilter = qs('#search-pricing').value;
  const evidenceFilter = qs('#search-evidence').value;
  const sort = qs('#search-sort').value;
  if (!query) {
    qs('#global-search-summary').textContent = 'اختر مهمة أو اكتب ما تريد إنجازه.';
    target.innerHTML = '';
    return;
  }
  const intent = state.guide.intents.find((entry) => entry.terms.some((term) => query.includes(normalizeArabic(term))));
  const terms = query.split(/\s+/).filter((word) => word.length > 2 && !['اريد','افضل','موقع','مواقع','انشاء','عمل','لدي','كيف','يمكن'].includes(word));
  const matches = (value) => terms.length && terms.every((term) => normalizeArabic(value).includes(term));
  const scored = state.data.tools.map((item) => {
    const ownText = `${item.name} ${toolCategoryLabels(item)} ${item.kind} ${item.note}`;
    const categoryRanks = toolCategories(item).map(key => intent?.categories.indexOf(key) ?? -1).filter(rank => rank >= 0);
    const categoryMatch = categoryRanks.length > 0;
    const exact = matches(ownText);
    const price = state.guide.pricing[item.name];
    const score = (exact ? 100 : 0) + (categoryMatch ? 40 - Math.min(...categoryRanks) * 4 : 0) + (price ? 3 : 0) + (item.evidence === 'A' ? 2 : item.evidence === 'B' ? 1 : 0);
    return {item, score};
  }).filter(({item,score}) => score > 2 && (intent || matches(`${item.name} ${toolCategoryLabels(item)} ${item.kind} ${item.note}`)))
    .filter(({item}) => (selectedCategory === 'all' || toolCategories(item).includes(selectedCategory)) && (priceFilter === 'all' || (priceFilter === 'free' ? !!state.guide.pricing[item.name]?.tier.includes('مجاني') : !state.guide.pricing[item.name])) && (evidenceFilter === 'all' || item.evidence === evidenceFilter));
  scored.sort((a,b) => sort === 'name' ? a.item.name.localeCompare(b.item.name,'ar') : b.score - a.score || a.item.name.localeCompare(b.item.name,'ar'));
  const tools = scored.map(({item}) => item);
  const workflows = state.data.workflows.filter((item) => intent ? intent.workflowIds.includes(item.id) : matches(`${item.title} ${item.input} ${item.steps} ${item.gate} ${item.human}`));
  const sections = state.index.sections.map((section) => {
    const title = normalizeArabic(section.title);
    const body = normalizeArabic(section.text);
    const preferred = {video:'video-studio',research:'research-workflow',voice:'needs-hub',image:'needs-hub',presentation:'needs-hub',automation:'agency-kernel'};
    const score = (intent && section.id === preferred[intent.id] ? 120 : 0) + (title.includes(query) ? 100 : terms.reduce((total, term) => total + (title.includes(term) ? 12 : body.includes(term) ? 1 : 0), 0));
    return { section, score };
  }).filter(({score}) => score > 0).sort((a,b) => b.score - a.score);
  const updates = state.radar.updates.filter(item => matches(`${item.product} ${item.category} ${item.title} ${item.summary} ${item.impact}`));
  qs('#global-search-summary').textContent = `${tools.length + workflows.length + sections.length + updates.length} نتيجة: ${sections.length} قسمًا من الإندكس، ${workflows.length} مسارًا، ${tools.length} أداة و${updates.length} مستجدًا. ${tools.length > 30 ? 'نعرض أول 30 أداة؛ ضيّق المجال لرؤية البقية.' : ''}`;
  if (!tools.length && !workflows.length && !sections.length && !updates.length) {
    target.innerHTML = emptyState('لم أجد نتيجة مطابقة', 'استخدم كلمة أقصر مثل: فيديو، صوت، بحث، ترجمة أو عرض.');
    return;
  }
  target.innerHTML = `${intent ? `<div class="intent-answer"><strong>إجابة مِرْشاد: ${esc(intent.title)}</strong><p>${esc(intent.lead)}</p><small>المصدر: دليل المهام guide.json · ${esc(state.guide.rankingPolicy)}</small><div><button class="secondary-action" type="button" data-intent-prompt="${esc(intent.id)}">برومبت المهمة الجاهز ←</button></div>${intent.id === 'video' ? '<div><button class="primary-action" type="button" data-open-view="video">افتح مختبر الفيديو وابدأ التجربة ←</button></div>' : ''}</div>` : ''}${sections.length ? `<section class="result-group"><h3>من الإندكس الأصلي (${sections.length})</h3><p class="search-caveat">المادة المرجعية V1.4 مؤرشفة؛ بيانات الأدوات الحالية في السجل الحي أدناه.</p><div class="index-results">${sections.slice(0, 6).map(({section}) => `<article class="index-result"><small>المصدر: ${esc(state.index.source)}</small><h4>${esc(section.title)}</h4><p>${esc(section.text.slice(0, 270))}${section.text.length > 270 ? '…' : ''}</p><a href="${esc(state.index.path)}#${encodeURIComponent(section.id)}" target="_blank" rel="noopener">اقرأ القسم في الإندكس ←</a></article>`).join('')}</div>${sections.length > 6 ? '<p class="search-caveat">تظهر أول ستة أقسام؛ استخدم عبارة أكثر تحديدًا لتضييق النتائج.</p>' : ''}</section>` : ''}${workflows.length ? `<section class="result-group"><h3>ابدأ بمسار العمل (${workflows.length})</h3><small>المصدر: سجل المسارات الحي data.json</small><div class="cards-grid">${workflows.slice(0, 12).map(workflowCard).join('')}</div></section>` : ''}${tools.length ? `<section class="result-group"><h3>أدوات مناسبة (${tools.length})</h3><small>المصدر: سجل الأدوات الحي data.json؛ الأسعار الموثقة من guide.json</small><div class="cards-grid tools">${tools.slice(0, 30).map(toolCard).join('')}</div></section>` : ''}${updates.length ? `<section class="result-group"><h3>مستجدات الرادار (${updates.length})</h3><small>المصدر: radar.json · رابط المصدر الرسمي في كل مستجد</small><div class="radar-list">${updates.map(radarCard).join('')}</div></section>` : ''}`;
}

function renderVideo() {
  const trial = state.guide.wavespeedTrial;
  qs('#wavespeed-plan').innerHTML = `<p>${esc(trial.status)}</p><ol>${trial.stages.map(stage => `<li><strong>الخطوة ${stage.step}: ${esc(stage.title)}</strong> · ${esc(stage.model)} · <a href="${esc(stage.url)}" target="_blank" rel="noopener">فتح النموذج الرسمي ↗</a></li>`).join('')}</ol><p>لوحة الـ65 ثانية: ${trial.storyboard.map(scene => `${esc(scene.time)} ${esc(scene.visual)}`).join('؛ ')}.</p>`;
  qs('#video-project-type').value = state.videoBrief?.type || 'avatar-ad';
  qs('#video-project-goal').value = state.videoBrief?.goal || '';
  qs('#video-steps').innerHTML = videoSteps.map((step, index) => {
    const done = state.videoDone.includes(index + 1);
    return `<label class="lab-step ${done ? 'done' : ''}"><input type="checkbox" data-video-step="${index + 1}" ${done ? 'checked' : ''}><span class="step-number">${index + 1}</span><div><h3>${esc(step[0])}</h3><p>${esc(step[1])}</p></div><span class="step-tag">${esc(step[2])}</span></label>`;
  }).join('');
  const next = videoSteps.findIndex((_, index) => !state.videoDone.includes(index + 1));
  const current = qs('#video-current');
  if (next < 0) {
    current.innerHTML = '<span class="section-kicker">اكتملت قائمة العمل</span><h3>راجع النسخة النهائية قبل اعتمادها</h3><p>تأكد من الصوت والأفاتار والحقوق والقراءة على الهاتف. يمكنك إلغاء أي علامة للعودة إلى مرحلتها.</p>';
  } else {
    const number = next + 1;
    const [exampleInstruction, action] = videoGuidance[next];
    const instruction = state.videoBrief?.type === 'general' ? `${videoSteps[next][1]} ابدأ بعينة قصيرة، وافحص النتيجة قبل الانتقال.` : exampleInstruction;
    const search = videoToolQueries[number];
    const options = (videoToolOptions[number] || []).map(name => {
      const tool = state.data.tools.find(item => item.name === name);
      if (!tool) return '';
      const price = state.guide.pricing[name];
      const selected = state.videoChoices[number] === name;
      const officialUrl = tool.routes?.[number]?.url || tool.url;
      return `<article class="video-tool-option"><h4>${esc(name)} ${selected ? '✓ اخترتها للتجربة' : ''}</h4><p>${esc(tool.note)}</p><small>${price ? `${esc(price.tier)} · السعر موثق في السجل، راجعه قبل الاستخدام` : 'السعر والخطة المجانية غير موثقين هنا؛ تحقق رسميًا أولًا'}</small><div><button type="button" data-video-choose="${esc(name)}" data-video-choice-step="${number}">${selected ? 'الأداة المختارة' : 'اختر للتجربة'}</button><button type="button" data-tool-id="${tool.id}">تفاصيل الأداة</button><a href="${esc(officialUrl)}" target="_blank" rel="noopener">المصدر الرسمي ←</a></div></article>`;
    }).join('');
    const stage = state.videoBrief?.type !== 'general' && trial.stages.find(item => item.step === number);
    const saved = state.videoTrial[number] || {};
    const snippet = number === 6 ? trial.shortScript : number === 8 ? trial.motionPrompt : '';
    const stagePanel = stage ? `<section class="trial-stage"><h4>خطة التجربة: ${esc(stage.model)}</h4><p>${esc(stage.action)}</p>${snippet ? `<label>${number === 6 ? 'نص العينة' : 'توجيه الحركة الاختياري'}<textarea id="trial-copy" readonly rows="${number === 6 ? 3 : 5}">${esc(snippet)}</textarea></label><button type="button" data-trial-copy="trial-copy">نسخ النص</button>${number === 6 ? `<details><summary>النص الكامل بعد قبول عينة الصوت</summary><textarea id="trial-full-copy" readonly rows="11">${esc(trial.fullScript)}</textarea><button type="button" data-trial-copy="trial-full-copy">نسخ النص الكامل</button></details>` : ''}` : ''}<p><a href="${esc(stage.url)}" target="_blank" rel="noopener">افتح صفحة النموذج أو المحرر الرسمي ↗</a></p><small>التكلفة والحدود: ${esc(stage.price)}</small><p><strong>الفحص:</strong> ${esc(stage.check)}</p><label>التكلفة الفعلية بالدولار (اختياري)<input id="trial-cost" type="number" min="0" step="0.01" value="${esc(saved.cost || '')}" inputmode="decimal"></label><label>ملاحظات المشاهدة والنتيجة<textarea id="trial-notes" rows="3" placeholder="ماذا سمعت أو شاهدت؟ وما الذي يحتاج تعديلًا؟">${esc(saved.notes || '')}</textarea></label><label class="trial-confirm"><input id="trial-reviewed" type="checkbox" ${saved.reviewed ? 'checked' : ''}> ${number === 6 ? 'استمعت إلى العينة الصوتية' : number === 8 ? 'شاهدت عينة الأفاتار وفحصت الشفاه والعربية' : 'شاهدت النسخة الممنتجة على الهاتف'}</label><button type="button" data-trial-save="${number}">احفظ نتيجة الفحص على هذا الجهاز</button><small>المصدر: <a href="${esc(stage.source)}" target="_blank" rel="noopener">صفحة الأداة الرسمية ↗</a>. لا يُرفع الصوت أو الصورة أو الفيديو إلى مِرْشاد.</small></section>` : '';
    current.innerHTML = `<span class="section-kicker">الخطوة الحالية ${number} من ${videoSteps.length}</span><h3>${esc(videoSteps[next][0])}</h3><p>${esc(instruction)}</p>${options ? `<div class="video-tool-options"><p>اختر أداة للتجربة؛ الاختيار لا يشغّل الخدمة ولا يرتب الجودة.</p>${options}</div>` : ''}${stagePanel}<div class="video-current-actions">${search ? `<button class="primary-action" type="button" data-video-tool-search="${esc(search)}">${esc(action)} ←</button>` : `<strong>${esc(action)}</strong>`}<button class="secondary-action" type="button" data-video-complete="${number}" ${number === 1 && !state.videoBrief ? 'disabled title="احفظ المهمة أولًا"' : ''}>أنجزت هذه الخطوة، انتقل للتالية</button></div><small>لا تضع علامة الإنجاز قبل تنفيذ وفحص هذه المرحلة. المقارنة تعرض معلومات السجل، ولا تعني أن أداة معينة هي الأفضل دون تجربة.</small>`;
  }
  updateVideoProgress();
}

function updateVideoProgress() {
  const percent = Math.round((state.videoDone.length / videoSteps.length) * 100);
  ['#video-progress', '#home-video-progress'].forEach((selector) => { const node = qs(selector); if (node) node.style.width = `${percent}%`; });
  ['#video-progress-label', '#home-video-progress-label'].forEach((selector) => { const node = qs(selector); if (node) node.textContent = `${percent}%`; });
}

function canCompleteVideoStep(id) {
  if (state.videoBrief?.type === 'general' || !trialSteps.includes(id)) return true;
  if (state.videoTrial[id]?.reviewed) return true;
  toast(id === 6 ? 'احفظ نتيجة الاستماع إلى الصوت أولًا' : 'شاهد العينة واحفظ نتيجة الفحص أولًا');
  return false;
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


// The gateway uses transparent local matching. It never sends drafts or files to a server.
const taskProfiles = [
  {id:'video', title:'فيديو', terms:['فيديو','فيلم','مقطع','اعلان','مونتاج','افاتار','كرتون','انيميشن','تحريك'], categories:['video','avatar','editing'], assets:['نص أو فكرة','صورة الأفاتار أو المشاهد','صوت أو تعليق','شعار أو هوية'], steps:['حدد نوع الفيديو والجمهور والمدة','جهّز النص والصور والصوت المتاح','اختبر لقطة قصيرة والنطق والحقوق','أنتج المشاهد ثم راجع المونتاج والتصدير']},
  {id:'research', title:'بحث أو دراسة', terms:['بحث','دراسه','دراسة','مصادر','تقرير','تحليل','مراجع'], categories:['research','data'], assets:['سؤال البحث','مصادر أو ملفات','حدود المكان والزمان'], steps:['حدد سؤالًا ونطاقًا','اجمع المصادر الأصلية','قارن الأدلة وسجل الاستشهادات','اكتب خلاصة وراجع الادعاءات']},
  {id:'presentation', title:'عرض تقديمي أو مستند', terms:['عرض','شرائح','برزنتيشن','مستند','وثيقه','وثيقة','pdf'], categories:['docs','writing'], assets:['محتوى أو مخطط','شعار وهوية','صور وبيانات'], steps:['حدد الجمهور والقرار المطلوب','ابنِ مخطط الشرائح أو الفصول','أنشئ نموذجًا قصيرًا','راجع الأرقام والعربية والتصدير']},
  {id:'image', title:'صورة أو تصميم', terms:['صوره','صورة','صور','تصميم','بوستر','تحسين','شعار'], categories:['image'], assets:['صورة أصلية إن وجدت','هوية وألوان','مقاس الاستخدام'], steps:['حدد إنشاء صورة أو تعديلها','اجمع الأصول والمقاس','جرّب نموذجًا واحدًا','راجع النصوص والحقوق والدقة']},
  {id:'voice', title:'صوت أو بودكاست', terms:['صوت','تعليق','دبلجه','دبلجة','بودكاست','تسجيل','نطق'], categories:['voice','arabic'], assets:['نص التسجيل','عينة صوت بإذن صاحبها إن وجدت','اللهجة والمدة'], steps:['حدد نوع الصوت واللهجة','راجع النص وقاموس النطق','اختبر عينة قصيرة','استمع وراجع الحقوق والتصدير']},
  {id:'song', title:'أغنية أو موسيقى', terms:['اغنيه','أغنية','موسيقى','لحن','نشيد'], categories:['music','voice'], assets:['كلمات أو فكرة','نمط موسيقي','مرجع صوتي مرخّص'], steps:['حدد الغرض والأسلوب','جهّز الكلمات والأصول','اختبر مقطعًا قصيرًا','راجع النطق والحقوق والمزيج']},
  {id:'book', title:'كتاب أو قصة', terms:['كتاب','روايه','رواية','قصه','قصة','تأليف','فصول'], categories:['writing','research'], assets:['فكرة وجمهور','مخطط فصول أو شخصيات','مراجع عند الحاجة'], steps:['حدد النوع والجمهور','ابنِ مخطط الفصول أو الحبكة','اكتب عينة قصيرة','حرر وتحقق من المصادر والحقوق']},
  {id:'automation', title:'أتمتة أو تطبيق', terms:['اتمته','أتمتة','تطبيق','موقع','برمجه','برمجة','كود','سير عمل'], categories:['work','coding'], assets:['وصف العملية الحالية','المدخلات والمخرجات','صلاحيات الأنظمة'], steps:['ارسم العملية والحالات الاستثنائية','حدد الأنظمة والصلاحيات','نفذ اختبارًا صغيرًا','راجع الأمان والتكلفة ثم وسع']}
];
function saveIntake() { localStorage.setItem('mirshad:intake', JSON.stringify(state.intake)); }
function inferTask(description) {
  const words = normalizeArabic(description);
  const ranked = taskProfiles.map(p => ({p, n:p.terms.filter(t => words.includes(normalizeArabic(t))).length})).sort((a,b) => b.n-a.n);
  return ranked[0].n ? ranked[0].p : null;
}
function renderIntake() {
  const record = state.intake;
  if (!record) return;
  const select = qs('#intake-type');
  if (select.options.length === 1) taskProfiles.forEach(p => select.insertAdjacentHTML('beforeend', `<option value="${p.id}">${p.title}</option>`));
  const profile = taskProfiles.find(p => p.id === record.type) || inferTask(record.description);
  if (!profile) { qs('#intake-result').innerHTML = '<article class="intake-card"><h3>نحتاج توضيح نوع المهمة</h3><p>اختر النوع من القائمة، أو أضف فعلًا واضحًا مثل «أريد إنشاء فيديو» أو «أريد كتابة قصة».</p></article>'; return; }
  const available = profile.assets.filter(a => (record.assets || []).includes(a));
  const missing = profile.assets.filter(a => !available.includes(a));
  const tools = state.data.tools.filter(t => toolCategories(t).some(key => profile.categories.includes(key)) && t.evidence !== 'H' && t.url).sort((a,b) => ({A:0,B:1,C:2}[a.evidence] ?? 3)-({A:0,B:1,C:2}[b.evidence] ?? 3)).slice(0,6);
  const workflow = state.data.workflows.filter(w => { const x = normalizeArabic(w.title); return profile.terms.some(t => x.includes(normalizeArabic(t))); }).slice(0,3);
  qs('#intake-result').innerHTML = `<div class="intake-card"><span class="section-kicker">تحليل أولي قابل للتصحيح</span><h3>${esc(profile.title)}</h3><p>الوصف: ${esc(record.description)}. ${record.audience ? `الجمهور: ${esc(record.audience)}. ` : ''}${record.format ? `الشكل: ${esc(record.format)}.` : ''}</p><p>هل فهمنا المهمة؟ غيّر «نوع المهمة» أعلاه إن لزم. ${record.type === 'auto' ? 'الاختيار الحالي مستنتج من الكلمات.' : 'النوع محدد بواسطتك.'}</p></div>
  <div class="intake-card"><h3>ما الذي لديك الآن؟</h3><p>علّم المتوفر. ما لم تحدده يظهر ضمن التحضير؛ يمكنك إكماله لاحقًا.</p><div class="intake-checks">${profile.assets.map(a => `<label><input type="checkbox" data-intake-asset="${esc(a)}" ${available.includes(a) ? 'checked' : ''}> ${esc(a)}</label>`).join('')}</div><p><strong>المطلوب تحضيره:</strong> ${missing.length ? missing.map(esc).join('، ') : 'المدخلات الأساسية مسجلة؛ راجع جودتها.'}</p><label>ملفات محلية لهذا العمل <input type="file" multiple aria-label="ملفات العمل المحلية"></label><small>اختيار الملفات للتذكير فقط؛ لا تُرفع ولا تُحفظ محتوياتها. اخترها مجددًا بعد تحديث الصفحة. لا تُحفظ الحسابات أو كلمات المرور هنا.</small></div>
  <div class="intake-card"><h3>الطريق المقترح</h3><ol>${profile.steps.map(step => `<li>${esc(step)}</li>`).join('')}</ol>${profile.id === 'video' ? '<button type="button" class="primary-action" data-intake-video>تابع في مختبر الفيديو</button>' : ''}${workflow.length ? `<p>مسارات مرتبطة: ${workflow.map(w => `<button type="button" class="text-button" data-workflow-id="${w.id}">${esc(w.title)}</button>`).join(' ')}</p>` : ''}</div>
  <div class="intake-card"><h3>أدوات مرتبطة من الإندكس</h3><p>هذه أمثلة أولية بحسب المجال ودرجة توثيق السجل، وليست ترتيبًا مثبتًا للجودة أو السعر. افتح بطاقة الأداة للمزايا والقيود، وتحقق من السعر الحالي قبل الاشتراك.</p><div class="intake-tool-list">${tools.map(t => `<button type="button" data-tool-id="${t.id}"><strong>${esc(t.name)}</strong><span>${esc(toolCategoryLabels(t))} · توثيق ${esc(t.evidence)}</span></button>`).join('')}</div><button type="button" class="secondary-action" data-intake-search="${esc(profile.title)}">بحث أوسع في الإندكس</button></div>`;
}

function renderCurrentView() {
  if (!state.data) return;
  if (state.view === 'radar') renderRadar();
  if (state.view === 'home') renderHome();
  if (state.view === 'map') renderMap();
  if (state.view === 'workflows') renderWorkflows();
  if (state.view === 'tools') renderTools();
  if (state.view === 'video') renderVideo();
  if (state.view === 'intake') renderIntake();
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
  qs('#dialog-body').innerHTML = `<div class="dialog-row"><span>المدخلات</span><b>${esc(item.input)}</b></div><div class="dialog-row"><span>خطوات التنفيذ</span><b>${esc(item.steps)}</b></div><div class="dialog-row"><span>بوابة الجودة</span><b>${esc(item.gate)}</b></div><div class="dialog-row"><span>القرار البشري</span><b>${esc(item.human)}</b></div><details class="dialog-row"><summary>برومبت اختياري إذا أردت بدء محادثة جديدة</summary><pre class="prompt-box" id="active-prompt">${esc(prompt)}</pre><button class="secondary-action" type="button" data-copy-prompt>نسخ البرومبت</button></details><div class="dialog-row"><span>🚫 تجنب هذا الخطأ</span><b>لا تختلق مدخلات أو مصادر، ولا تتجاوز بوابة الجودة: ${esc(item.gate)}.</b></div>`;
  qs('#dialog-actions').innerHTML = `${[6,9].includes(item.id) ? '<button type="button" data-video-from-workflow>ابدأ التنفيذ في مختبر الفيديو</button>' : ''}<button class="favorite-button ${isFavorite('workflows', item.id) ? 'saved' : ''}" data-favorite-type="workflows" data-favorite-id="${item.id}" type="button">${isFavorite('workflows', item.id) ? '♥ محفوظ' : '♡ حفظ'}</button>`;
  qs('#detail-dialog').showModal();
}

function openIntentPrompt(id) {
  const item = state.guide.intents.find((entry) => entry.id === id);
  if (!item) return;
  qs('#dialog-kicker').textContent = 'برومبت وظيفة';
  qs('#dialog-title').textContent = item.title;
  qs('#dialog-body').innerHTML = `<div class="dialog-row"><span>🎯 الاستخدام</span><b>${esc(item.lead)}</b></div><div class="dialog-row"><span>✅ البرومبت الجاهز: غيّر ما بين الأقواس</span><pre class="prompt-box" id="active-prompt">${esc(item.prompt)}</pre></div><div class="dialog-row"><span>🚫 تعليمات تمنع الأخطاء</span><b>${esc(item.avoid)}</b></div><div class="dialog-row"><span>💡 نصيحة قبل التنفيذ</span><b>${esc(item.tip)}</b></div>`;
  qs('#dialog-actions').innerHTML = '<button type="button" data-copy-prompt>نسخ البرومبت</button><button type="button" data-intent-search="'+esc(item.title)+'">اعرض المسارات والأدوات</button>';
  qs('#detail-dialog').showModal();
}

function openTool(id) {
  const item = state.data.tools.find((entry) => entry.id === Number(id));
  if (!item) return;
  const price = state.guide?.pricing[item.name];
  qs('#dialog-kicker').textContent = toolCategoryLabels(item);
  qs('#dialog-title').textContent = item.name;
  qs('#dialog-body').innerHTML = `<div class="dialog-row"><span>تعريف الأداة ومجالها</span><b>${esc(item.name)}: ${esc(item.kind)} · ${esc(toolCategoryLabels(item))}</b></div><div class="dialog-row"><span>ماذا تفعل وما فائدتها؟</span><b>${esc(item.note)}</b></div><div class="dialog-row"><span>طريقة الوصول</span><b>${esc(item.access)}</b></div><div class="dialog-row"><span>السعر والخطة المجانية</span><b>${esc(price ? `${price.tier}: ${price.detail}` : 'لم يتحقق مِرْشاد من السعر الحالي؛ راجع الموقع الرسمي قبل أي قرار.')}</b>${price ? `<a href="${esc(price.source)}" target="_blank" rel="noopener">مصدر السعر الرسمي ↗</a>` : ''}</div><div class="dialog-row"><span>التقييم وحالة التحقق</span><b>${esc(item.evidence)} — ${esc(item.status)}. هذه درجة تحقق المعلومات وليست تقييم جودة.</b></div><div class="dialog-row"><span>الجودة العملية</span><b>${esc(price?.quality || 'لم يُنفذ اختبار جودة مقارن موثق بعد.')}</b></div><div class="dialog-row"><span>قبل الاستخدام</span><b>هذا وصف في الدليل وليس تشغيلًا مدمجًا. اختبر الأداة على عينة حقيقية ووثّق الجودة والتكلفة والقيود.</b></div>`;
  qs('#dialog-actions').innerHTML = `${item.url ? `<a href="${esc(item.url)}" target="_blank" rel="noopener">زيارة صفحة الأداة ↗</a>` : ''}${Object.values(item.routes || {}).map(route => `<a href="${esc(route.url)}" target="_blank" rel="noopener">${esc(route.label)} ↗</a>`).join('')}<button class="favorite-button ${isFavorite('tools', item.id) ? 'saved' : ''}" data-favorite-type="tools" data-favorite-id="${item.id}" type="button">${isFavorite('tools', item.id) ? '♥ محفوظ' : '♡ حفظ'}</button>`;
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
    if (event.target.closest('[data-video-from-workflow]')) { qs('#detail-dialog').close(); setView('video'); }
    const complete = event.target.closest('[data-video-complete]');
    if (complete) { const id = Number(complete.dataset.videoComplete); if (!canCompleteVideoStep(id)) return; if (!state.videoDone.includes(id)) state.videoDone.push(id); state.videoDone.sort((a,b) => a-b); localStorage.setItem('mirshad:video-progress', JSON.stringify(state.videoDone)); renderVideo(); }
    const trialCopy = event.target.closest('[data-trial-copy]');
    if (trialCopy) { const snippet = qs(`#${trialCopy.dataset.trialCopy}`); navigator.clipboard.writeText(snippet.value).then(() => toast('نُسخ النص')).catch(() => { snippet.select(); toast('حدد النص وانسخه يدويًا'); }); }
    const trialSave = event.target.closest('[data-trial-save]');
    if (trialSave) { const id = Number(trialSave.dataset.trialSave); const cost = qs('#trial-cost').value; const notes = qs('#trial-notes').value.trim(); const reviewed = qs('#trial-reviewed').checked; if (reviewed && !notes) { toast('دوّن نتيجة فحص العينة قبل اعتمادها'); qs('#trial-notes').focus(); return; } state.videoTrial[id] = {cost, notes, reviewed}; localStorage.setItem('mirshad:video-trial', JSON.stringify(state.videoTrial)); toast('حُفظت نتيجة الفحص على هذا الجهاز'); }
    const videoSearch = event.target.closest('[data-video-tool-search]');
    if (videoSearch) { qs('#global-search-input').value = videoSearch.dataset.videoToolSearch; setView('search'); searchAll(); }
    const videoChoice = event.target.closest('[data-video-choose]');
    if (videoChoice) { state.videoChoices[videoChoice.dataset.videoChoiceStep] = videoChoice.dataset.videoChoose; localStorage.setItem('mirshad:video-choices', JSON.stringify(state.videoChoices)); renderVideo(); }
    const promptButton = event.target.closest('[data-intent-prompt]');
    if (promptButton) openIntentPrompt(promptButton.dataset.intentPrompt);
    const searchIntent = event.target.closest('[data-intent-search]');
    if (searchIntent) { qs('#detail-dialog').close(); qs('#global-search-input').value = searchIntent.dataset.intentSearch; setView('search'); searchAll(); }
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
    const intentButton = event.target.closest('[data-intent]');
    if (intentButton) { qs('#global-search-input').value = intentButton.dataset.intent; searchAll(); }
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
  qs('#start-search-form').addEventListener('submit', (event) => {
    event.preventDefault();
    qs('#intake-description').value = qs('#start-search-input').value;
    setView('intake');
    qs('#intake-description').focus();
  });
  qs('#intake-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const description = qs('#intake-description').value.trim();
    if (!description) return;
    state.intake = { description, type: qs('#intake-type').value, audience: qs('#intake-audience').value.trim(), format: qs('#intake-format').value.trim(), assets: state.intake?.description === description ? state.intake.assets || [] : [] };
    saveIntake(); renderIntake();
  });
  qs('#intake-type').addEventListener('change', () => { if (state.intake) { state.intake.type = qs('#intake-type').value; state.intake.assets = []; saveIntake(); renderIntake(); } });
  qs('#intake-result').addEventListener('change', (event) => {
    if (event.target.matches('[data-intake-asset]') && state.intake) {
      const key = event.target.dataset.intakeAsset;
      state.intake.assets = event.target.checked ? [...new Set([...(state.intake.assets || []),key])] : (state.intake.assets || []).filter(x => x !== key);
      saveIntake(); renderIntake();
    }
  });
  qs('#intake-result').addEventListener('click', (event) => {
    if (event.target.closest('[data-intake-video]') && state.intake) {
      qs('#video-project-goal').value = state.intake.description;
      setView('video');
    }
    const button = event.target.closest('[data-intake-search]');
    if (button) { qs('#global-search-input').value = button.dataset.intakeSearch; setView('search'); searchAll(); }
  });
  qs('#global-search-input').addEventListener('input', searchAll);
  qs('#global-search-form').addEventListener('submit', (event) => { event.preventDefault(); searchAll(); });
  ['#search-category','#search-pricing','#search-evidence','#search-sort'].forEach((selector) => qs(selector).addEventListener('change',searchAll));
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
    if (input.checked && !canCompleteVideoStep(id)) { input.checked = false; return; }
    if (input.checked && !state.videoDone.includes(id)) state.videoDone.push(id);
    if (!input.checked) state.videoDone = state.videoDone.filter((item) => item !== id);
    state.videoDone.sort((a, b) => a - b);
    localStorage.setItem('mirshad:video-progress', JSON.stringify(state.videoDone));
    renderVideo();
  });
  qs('#video-save-brief').addEventListener('click', () => {
    const goal = qs('#video-project-goal').value.trim();
    if (!goal) { qs('#video-project-goal').focus(); toast('اكتب النتيجة المطلوبة أولًا'); return; }
    state.videoBrief = {type:qs('#video-project-type').value, goal};
    localStorage.setItem('mirshad:video-brief', JSON.stringify(state.videoBrief));
    renderVideo(); toast('حُفظت المهمة على هذا الجهاز');
  });
  qs('#reset-video').addEventListener('click', () => { state.videoDone = []; state.videoChoices = {}; state.videoTrial = {}; localStorage.setItem('mirshad:video-progress', '[]'); localStorage.setItem('mirshad:video-choices', '{}'); localStorage.setItem('mirshad:video-trial', '{}'); renderVideo(); toast('بدأت التجربة من جديد'); });
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
    const [dataResponse, radarResponse, guideResponse, indexResponse] = await Promise.all([fetch('./data.json'), fetch('./radar.json'), fetch('./guide.json'), fetch('./index-sections.json')]);
    if (!dataResponse.ok || !radarResponse.ok || !guideResponse.ok || !indexResponse.ok) throw new Error('تعذر تحميل البيانات');
    state.data = await dataResponse.json();
    state.radar = await radarResponse.json();
    state.guide = await guideResponse.json();
    state.index = await indexResponse.json();
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    qs('#ios-install-button').hidden = !(isIos && !isStandalone);
    const categorySelect = qs('#tool-category');
    Object.entries(state.data.categories).forEach(([value, label]) => categorySelect.insertAdjacentHTML('beforeend', `<option value="${esc(value)}">${esc(label)}</option>`));
    const requestedCategory = new URLSearchParams(location.search).get('category');
    if (requestedCategory && requestedCategory in state.data.categories) categorySelect.value = requestedCategory;
    Object.entries(state.data.categories).forEach(([value, label]) => qs('#search-category').insertAdjacentHTML('beforeend', `<option value="${esc(value)}">${esc(label)}</option>`));
    qs('#intent-shortcuts').innerHTML = state.guide.intents.map((item) => `<button type="button" data-intent="${esc(item.title)}">${esc(item.title)}</button>`).join('');
    const radarCategory = qs('#radar-category');
    [...new Set(state.radar.updates.map((item) => item.category))].sort().forEach((label) => radarCategory.insertAdjacentHTML('beforeend', `<option value="${esc(label)}">${esc(label)}</option>`));
    taskProfiles.forEach(p => qs('#intake-type').insertAdjacentHTML('beforeend', `<option value="${p.id}">${p.title}</option>`));
    if (state.intake) { qs('#intake-description').value = state.intake.description || ''; qs('#intake-type').value = state.intake.type || 'auto'; qs('#intake-audience').value = state.intake.audience || ''; qs('#intake-format').value = state.intake.format || ''; }
    bindEvents();
    history.replaceState({ mirshadTrail: [qs(`#view-${location.hash.slice(1)}`) ? location.hash.slice(1) : 'radar'] }, '', location.href);
    setView(location.hash.slice(1) || 'radar', false);
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  } catch (error) {
    document.body.innerHTML = `<main class="empty-state" style="margin:3rem"><strong>تعذر فتح استوديو مِرْشاد</strong><span>${esc(error.message)}</span></main>`;
  }
}

init();
