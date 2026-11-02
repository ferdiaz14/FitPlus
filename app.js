const state = { items: [], category:'Todas', search:'', limit:9, saved:new Set() };
const $ = id => document.getElementById(id);
try { state.saved = new Set(JSON.parse(localStorage.getItem('fitplus-saved') || '[]')); } catch (_) {}
const escapeHTML = s => String(s ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const safeLink = s => /^https?:\/\//i.test(s) ? s : '#';
const displayDate = s => { const d = new Date(s); return isNaN(d) ? 'Fecha no disponible' : new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short',year:'numeric'}).format(d); };
const titles = { Entrenamiento:'ENTRENA', Nutrición:'NUTRE', Salud:'CUIDA', Suplementos:'EXPLORA', Ciencia:'DESCUBRE' };
function render(){
  const q = state.search.toLocaleLowerCase('es');
  const filtered = state.items.filter(item => (state.category==='Todas' || (state.category==='Guardadas' ? state.saved.has(item.id) : item.category===state.category)) && `${item.title} ${item.source} ${item.summary} ${item.category}`.toLocaleLowerCase('es').includes(q));
  $('resultsCount').textContent = `${filtered.length} NOTICIA${filtered.length===1?'':'S'} ENCONTRADA${filtered.length===1?'':'S'}`;
  $('emptyState').classList.toggle('hidden',filtered.length!==0);
  $('showMore').classList.toggle('hidden',filtered.length <= state.limit);
  $('newsGrid').innerHTML = filtered.slice(0,state.limit).map(item => `<article class="news-card"><div class="card-top"><span class="topic">${escapeHTML(item.category.toUpperCase())}</span><span class="abstract">${escapeHTML(titles[item.category] || 'FIT')}</span></div><div class="card-content"><div class="card-date">${escapeHTML(displayDate(item.published))} · ${escapeHTML(item.source)}</div><span class="card-evidence">${escapeHTML(item.evidence||"Fuente identificada")}</span><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.summary || 'Consulta la información completa en el medio original.')}</p><div class="card-bottom"><span>${escapeHTML(item.source)}</span><div style="display:flex;align-items:center;gap:11px"><button class="save" type="button" data-save="${escapeHTML(item.id)}" title="Guardar noticia" aria-label="Guardar noticia" aria-pressed="${state.saved.has(item.id)}">${state.saved.has(item.id)?'★':'☆'}</button><a href="${escapeHTML(safeLink(item.url))}" target="_blank" rel="noopener noreferrer">LEER ↗</a></div></div></div></article>`).join('');
}
$('filters').addEventListener('click',e=>{const btn=e.target.closest('[data-category]');if(!btn)return;state.category=btn.dataset.category;state.limit=9;document.querySelectorAll('[data-category]').forEach(el=>el.classList.toggle('active',el===btn));render();});
$('search').addEventListener('input',e=>{state.search=e.target.value.trim();state.limit=9;render();});
$('showMore').addEventListener('click',()=>{state.limit+=9;render();});
$('newsGrid').addEventListener('click',e=>{const btn=e.target.closest('[data-save]');if(!btn)return;const id=btn.dataset.save;state.saved.has(id)?state.saved.delete(id):state.saved.add(id);localStorage.setItem('fitplus-saved',JSON.stringify([...state.saved]));render();});
$('year').textContent = new Date().getFullYear();
fetch('data/news.json?v='+Math.floor(Date.now()/3600000)).then(r=>{if(!r.ok)throw Error('news');return r.json();}).then(data=>{
  state.items = Array.isArray(data.items) ? data.items.filter(x=>x.title&&x.url&&x.id) : [];
  $('totalStories').textContent=state.items.length;
  const ageHours = data.updated_at ? (Date.now()-new Date(data.updated_at).getTime())/3600000 : Infinity;
  $('editionStatus').textContent = !state.items.length ? 'Aún no se ha publicado la primera edición. No mostramos noticias de prueba como si fueran reales.' : (ageHours>48 ? 'Atención: esta edición tiene más de 48 horas. Mostramos su fecha real mientras se revisa la actualización automática.' : `Edición disponible: ${state.items.length} noticias seleccionadas. Cada artículo incluye fecha, fuente y enlace.`);
  $('editionStatus').classList.toggle('is-stale',ageHours>48);
  $('updatedAt').textContent=data.updated_at ? displayDate(data.updated_at)+' · '+new Date(data.updated_at).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Madrid'})+' (Madrid)' : 'Pendiente de la primera actualización';
  render();
}).catch(()=>{$('totalStories').textContent='0';$('updatedAt').textContent='No se han podido cargar las noticias';$('editionStatus').textContent='Error al cargar la edición. Inténtalo más tarde.';render();});
