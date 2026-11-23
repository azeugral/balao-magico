(function () {
  var d = document;
  var WA = '5543991120347';
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- hero: dois painéis em arco; cada festa entra de perto e se afasta até o painel inteiro ---------- */
  var hero = d.querySelector('.hero');
  requestAnimationFrame(function () { hero.classList.add('pronto'); });
  (function () {
    var caixaE = d.querySelector('.arco-e .arco-in'), caixaD = d.querySelector('.arco-d .arco-in');
    var doE = [].slice.call(caixaE.children), doD = [].slice.call(caixaD.children);
    var arcoD = d.querySelector('.arco-d'), grupos = [], vez = 0, vis = true;
    /* no celular só existe um arco: ele mostra todas as festas */
    function montar() {
      var um = getComputedStyle(arcoD).display === 'none';
      doD.forEach(function (el) { (um ? caixaE : caixaD).appendChild(el); });
      grupos = (um ? [doE.concat(doD)] : [doE, doD]).map(function (l) {
        l.forEach(function (el, k) { el.classList.remove('sai'); el.classList.toggle('on', k === 0); });
        return { l: l, i: 0 };
      });
      vez = 0;
    }
    montar();
    addEventListener('resize', function () {
      if ((getComputedStyle(arcoD).display === 'none' ? 1 : 2) !== grupos.length) montar();
    });
    if (reduz) return;
    new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(hero);
    var tempo = 0;
    setInterval(function () {
      if (!vis || d.hidden) return;
      tempo += 1;
      if (grupos.length === 1 && tempo % 2) return;
      var g = grupos[vez % grupos.length]; vez += 1;
      var a = g.l[g.i]; g.i = (g.i + 1) % g.l.length; var b = g.l[g.i];
      b.classList.remove('sai'); b.style.animation = 'none'; void b.offsetWidth; b.style.animation = '';
      b.classList.add('on'); a.classList.add('sai'); a.classList.remove('on');
    }, 2500);
  })();

  /* ---------- topo e gaveta ---------- */
  var topo = d.getElementById('topo'), gav = d.getElementById('gaveta'), burger = d.getElementById('burger');
  function rolar() { topo.classList.toggle('solido', scrollY > 30 || !gav.hidden); }
  addEventListener('scroll', rolar, { passive: true }); rolar();
  function gaveta(a) { gav.hidden = !a; burger.setAttribute('aria-expanded', a); d.body.style.overflow = a ? 'hidden' : ''; rolar(); }
  burger.addEventListener('click', function () { gaveta(gav.hidden); });
  gav.addEventListener('click', function (e) { if (e.target.closest('a')) gaveta(false); });

  /* ---------- entrada ao rolar: do centro para fora ---------- */
  var io = new IntersectionObserver(function (es) {
    var meio = innerWidth / 2;
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var r = e.boundingClientRect, dist = Math.abs(r.left + r.width / 2 - meio) / meio;
      e.target.style.transitionDelay = Math.round(Math.min(1, dist) * 240) + 'ms';
      e.target.classList.add('vis'); io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -6% 0px' });
  function observar() { d.querySelectorAll('.rev:not(.vis),.item:not(.vis):not(.sai)').forEach(function (el) { io.observe(el); }); }

  /* ---------- festas ---------- */
  var grade = d.getElementById('grade'), mais = d.getElementById('mais'), filtro = 'todos', passoN = innerWidth < 760 ? 12 : 24, limite = passoN;
  PECAS.forEach(function (p, i) {
    var f = d.createElement('figure'); f.className = 'item'; f.tabIndex = 0; f.dataset.i = i;
    f.setAttribute('role', 'button'); f.setAttribute('aria-label', 'Ampliar: ' + p.l);
    f.innerHTML = '<div class="fr"><img src="img/p/' + p.c + '.webp" alt="' + p.l + ', decoração do Balão Mágico" width="720" height="900" draggable="false"></div>';
    grade.appendChild(f);
  });
  var itens = [].slice.call(grade.children);
  function visiveis() { return itens.filter(function (el) { return filtro === 'todos' || PECAS[el.dataset.i].t === filtro; }); }
  function aplicar() {
    var v = visiveis();
    itens.forEach(function (el) { el.classList.add('sai'); });
    v.forEach(function (el, k) { if (k < limite) el.classList.remove('sai'); });
    mais.hidden = v.length <= limite;
    observar();
  }
  aplicar();
  d.querySelectorAll('.filtros button').forEach(function (b) {
    b.addEventListener('click', function () {
      d.querySelectorAll('.filtros button').forEach(function (x) { x.classList.toggle('on', x === b); });
      filtro = b.dataset.f; limite = passoN; aplicar();
      itens.forEach(function (el) { if (!el.classList.contains('sai')) el.classList.add('vis'); });
      grade.animate && grade.animate([{ opacity: .2, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: 'cubic-bezier(.16,.84,.32,1)' });
    });
  });
  mais.addEventListener('click', function () { limite += passoN; aplicar(); });

  /* peças de locação */
  var loc = d.getElementById('loc');
  LOC.forEach(function (p) {
    var f = d.createElement('figure'); f.className = 'rev';
    f.innerHTML = '<div class="fr"><img src="img/l/' + p.c + '.webp" alt="' + p.l + '" width="720" height="900" draggable="false"></div><figcaption>' + p.l + '</figcaption>';
    loc.appendChild(f);
  });
  observar();

  /* lightbox */
  var lb = d.getElementById('lb'), lbImg = d.getElementById('lbImg'), lbTit = d.getElementById('lbTit'), atualLb = 0, lista = [];
  function abrirLb(i) { lista = visiveis().map(function (el) { return +el.dataset.i; }); atualLb = Math.max(0, lista.indexOf(i)); mostrar(); lb.hidden = false; d.body.style.overflow = 'hidden'; }
  function mostrar() { var p = PECAS[lista[atualLb]]; lbImg.src = 'img/g/' + p.c + '.webp'; lbImg.alt = p.l + ', decoração do Balão Mágico'; lbTit.textContent = p.l; }
  function passo(n) { atualLb = (atualLb + n + lista.length) % lista.length; mostrar(); }
  function fechar() { lb.hidden = true; d.body.style.overflow = ''; }
  grade.addEventListener('click', function (e) { var f = e.target.closest('.item'); if (f) abrirLb(+f.dataset.i); });
  grade.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { var f = e.target.closest('.item'); if (f) { e.preventDefault(); abrirLb(+f.dataset.i); } } });
  d.getElementById('lbX').onclick = fechar;
  d.getElementById('lbP').onclick = function () { passo(-1); };
  d.getElementById('lbS').onclick = function () { passo(1); };
  var MAPA = { inf: 'Festa infantil', teen: '15 anos', adulto: 'Aniversário adulto', cha: 'Chá de bebê ou chá revelação' };
  function marcaTipo(v) { var r = d.querySelector('input[name="tipo"][value="' + v + '"]'); if (r) r.checked = true; }
  d.getElementById('lbQuero').onclick = function () {
    var p = PECAS[lista[atualLb]];
    d.getElementById('tema').value = 'Quero uma decoração como esta do site: ' + p.l + '.';
    if (/casamento|Bride/i.test(p.l)) marcaTipo('Casamento');
    else if (/18 anos/.test(p.l)) marcaTipo('18 anos');
    else marcaTipo(MAPA[p.t]);
    fechar();
    d.getElementById('form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  d.querySelectorAll('[data-tipo]').forEach(function (a) { a.addEventListener('click', function () { marcaTipo(a.dataset.tipo); }); });
  lb.addEventListener('click', function (e) { if (e.target === lb) fechar(); });
  addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') fechar(); if (e.key === 'ArrowLeft') passo(-1); if (e.key === 'ArrowRight') passo(1);
  });
  var tx = null;
  lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) { if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 45) passo(dx < 0 ? 1 : -1); tx = null; });

  /* ---------- pedido de orçamento pelo WhatsApp ---------- */
  var form = d.getElementById('form'), erro = d.getElementById('erro');
  function dataBr(v) { if (!v) return 'a definir'; var p = v.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = new FormData(form), nomeC = (f.get('nome') || '').trim();
    if (!nomeC) { erro.hidden = false; form.nome.focus(); return; }
    erro.hidden = true;
    var l = ['Olá, Balão Mágico! Sou *' + nomeC + '* e quero um orçamento.', '',
      '*Festa:* ' + f.get('tipo'), '*Data:* ' + dataBr(f.get('data')),
      '*Local:* ' + ((f.get('local') || '').trim() || 'a definir'), '*Convidados:* ' + f.get('conv')];
    var tema = (f.get('tema') || '').trim();
    if (tema) l.push('', '*Tema e cores:* ' + tema);
    l.push('', '(pedido enviado pelo site)');
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(l.join('\n')), '_blank', 'noopener');
  });
})();
