/* Family Memories Design — page behaviour (no dependencies).
   The 3D studio module is fetched only when its section approaches the screen. */
(function () {
	'use strict';

	var CFG = window.FMD || {};
	var doc = document;
	var $ = function (s, r) { return (r || doc).querySelector(s); };
	var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };

	/* ---------- Mobile menu ---------- */
	var menuBtn = $('.menu-btn');
	var sheet = $('#sheet');
	function setMenu(open) {
		if (!menuBtn || !sheet) return;
		menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
		sheet.hidden = !open;
		doc.documentElement.style.overflow = open ? 'hidden' : '';
	}
	if (menuBtn && sheet) {
		menuBtn.addEventListener('click', function () {
			setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
		});
		sheet.addEventListener('click', function (e) {
			if (e.target.closest('a')) setMenu(false);
		});
		doc.addEventListener('keydown', function (e) {
			if (e.key === 'Escape') setMenu(false);
		});
		window.matchMedia('(min-width: 960px)').addEventListener('change', function () { setMenu(false); });
	}

	/* ---------- Headline: MEMORIES fills the sheet width; WEAR matches its size ---------- */
	var title = $('.hero__title');
	var ref = $('[data-fit-ref]');
	var lastW = 0;
	function fitTitle() {
		if (!title || !ref) return;
		var w = title.clientWidth;
		if (!w || w === lastW) return;
		lastW = w;
		title.style.fontSize = '100px';
		var natural = ref.getBoundingClientRect().width;
		if (natural > 0) {
			title.style.fontSize = Math.floor((w / natural) * 100 * 0.995 * 10) / 10 + 'px';
		}
	}
	fitTitle();
	if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { lastW = 0; fitTitle(); });
	var rt;
	window.addEventListener('resize', function () {
		clearTimeout(rt);
		rt = setTimeout(fitTitle, 80);
	});

	/* ---------- 3D studio: lazy module ---------- */
	var studioEl = $('[data-studio]');
	var studioPromise = null;
	var pending = [];
	function loadStudio() {
		if (studioPromise || !studioEl || !CFG.studio) return studioPromise;
		studioPromise = import(new URL(CFG.studio, document.baseURI).href)
			.then(function (m) { return m.mount(studioEl, CFG); })
			.then(function (api) {
				pending.forEach(function (fn) { fn(api); });
				pending = [];
				return api;
			})
			.catch(function (err) {
				console.error('[fmd] studio failed to load', err);
				var stage = $('[data-stage]');
				var txt = $('[data-poster-text]');
				if (stage) stage.classList.add('is-failed');
				if (txt) txt.textContent = 'The 3D preview could not load on this device. Your choices still go with your booking.';
			});
		return studioPromise;
	}
	function withStudio(fn) {
		loadStudio();
		if (!studioPromise) return;
		studioPromise.then(function (api) { if (api) fn(api); });
	}
	if (studioEl) {
		if ('IntersectionObserver' in window) {
			var io = new IntersectionObserver(function (entries) {
				if (entries.some(function (e) { return e.isIntersecting; })) {
					io.disconnect();
					loadStudio();
				}
			}, { rootMargin: '900px 0px' });
			io.observe(studioEl);
		} else {
			loadStudio();
		}
	}

	/* ---------- Design tiles → studio ---------- */
	$$('[data-design]').forEach(function (tile) {
		tile.addEventListener('click', function () {
			var id = tile.getAttribute('data-design');
			withStudio(function (api) { api.setDesign(id); });
			var target = $('#studio');
			if (target) target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
		});
	});
	doc.addEventListener('fmd:front', function (e) {
		var id = e.detail && e.detail.design;
		$$('[data-design]').forEach(function (t) {
			var on = t.getAttribute('data-design') === id;
			t.classList.toggle('is-active', on);
			var lbl = $('.tile__try', t);
			if (lbl) lbl.textContent = on ? 'On it now' : 'Try on';
		});
	});

	/* ---------- Booking form ---------- */
	var form = $('[data-booking]');
	if (form) {
		var ts = $('[data-ts]', form);
		if (ts) ts.value = String(Date.now());
		var status = $('[data-status]', form);
		var submit = $('[data-submit]', form);
		var designBox = $('[data-design-box]', form);
		var designText = $('[data-design-text]', form);
		var designField = $('[data-design-field]', form);

		$$('[data-role-link]').forEach(function (a) {
			a.addEventListener('click', function () {
				var r = form.querySelector('input[name="fmd_role"][value="' + a.getAttribute('data-role-link') + '"]');
				if (r) r.checked = true;
			});
		});

		var sendBtn = $('[data-send-design]');
		if (sendBtn) {
			sendBtn.addEventListener('click', function () {
				withStudio(function (api) {
					var s = api.summary();
					designField.value = s.text;
					designText.textContent = s.text;
					designBox.hidden = false;
					var fileInput = $('#fmd_logo', form);
					if (s.logoFile && /^image\/(png|jpeg|webp|gif)$/.test(s.logoFile.type) && fileInput && !fileInput.files.length && window.DataTransfer) {
						try {
							var dt = new DataTransfer();
							dt.items.add(s.logoFile);
							fileInput.files = dt.files;
						} catch (err) { /* older Safari: the customer can attach it manually */ }
					}
					var book = $('#book');
					if (book) book.scrollIntoView({ behavior: 'smooth' });
				});
			});
		}
		var rm = $('[data-design-remove]', form);
		if (rm) rm.addEventListener('click', function () {
			designField.value = '';
			designBox.hidden = true;
		});

		function setStatus(msg, isError) {
			status.textContent = msg;
			status.classList.toggle('is-error', !!isError);
		}
		function markInvalid(id) {
			$$('.field.is-invalid', form).forEach(function (f) { f.classList.remove('is-invalid'); });
			if (!id) return;
			var input = form.querySelector('#' + id);
			if (input) {
				var f = input.closest('.field');
				if (f) f.classList.add('is-invalid');
				input.focus();
			}
		}
		function showSent(msg) {
			var email = (CFG.email || '');
			form.classList.add('is-sent');
			form.innerHTML = '';
			var wrap = doc.createElement('div');
			wrap.className = 'sent';
			wrap.setAttribute('role', 'status');
			wrap.innerHTML = '<p class="mono" style="color:var(--violet)">Booking request</p><p class="sent__title">Request sent</p><p class="lede"></p>';
			wrap.querySelector('.lede').textContent = msg;
			form.appendChild(wrap);
			wrap.setAttribute('tabindex', '-1');
			wrap.focus();
		}

		form.addEventListener('submit', function (e) {
			e.preventDefault();
			var name = form.fmd_name.value.trim();
			var email = form.fmd_email.value.trim();
			if (!name) { setStatus('Add your name so we know who to reply to.', true); markInvalid('fmd_name'); return; }
			if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setStatus('Enter an email address like name@example.com.', true); markInvalid('fmd_email'); return; }
			var file = form.fmd_logo && form.fmd_logo.files[0];
			if (file && file.size > 8 * 1024 * 1024) { setStatus('The logo file is over 8 MB. Send a smaller PNG, JPG or PDF.', true); markInvalid('fmd_logo'); return; }
			markInvalid(null);

			if (CFG.preview) {
				setStatus('');
				showSent('Preview only: on the live site this request is emailed to ' + (CFG.email || 'info@familymemoriesdesign.com') + ' and saved in wp-admin.');
				return;
			}

			submit.disabled = true;
			var label = submit.textContent;
			submit.textContent = 'Sending…';
			setStatus('');
			var data = new FormData(form);
			data.append('ajax', '1');
			fetch(form.action, { method: 'POST', body: data, credentials: 'same-origin' })
				.then(function (r) { return r.json().catch(function () { return { success: false, data: {} }; }); })
				.then(function (res) {
					if (res && res.success) {
						showSent(res.data && res.data.message ? res.data.message : 'We will get back to you shortly.');
					} else {
						var d = (res && res.data) || {};
						setStatus(d.message || 'The request did not go through. Try again or email us directly.', true);
						markInvalid(d.field || null);
					}
				})
				.catch(function () {
					setStatus('No connection. Check your signal and send again.', true);
				})
				.then(function () {
					if (submit.isConnected) { submit.disabled = false; submit.textContent = label; }
				});
		});
	}
})();
