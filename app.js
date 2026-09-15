(function () {
  "use strict";

  // ---- Lykilorðshindrun (sameiginlegt lykilorð) ----
  (function gate() {
    var HASH = window.SITE_PASSWORD_SHA256;
    if (!HASH || /PASTE|YOUR/.test(HASH)) return;            // ekki stillt -> engin hindrun
    if (sessionStorage.getItem("haefni_unlocked") === HASH) return; // þegar opnað í þessari lotu
    var ov = document.createElement("div");
    ov.id = "haefni-gate";
    ov.style.cssText = "position:fixed;inset:0;z-index:99999;background:#EBEEEC;display:flex;align-items:center;justify-content:center;font-family:Inter,system-ui,sans-serif";
    ov.innerHTML =
      '<div style="background:#fff;border:1px solid #D6DDD9;border-radius:14px;padding:28px 26px;max-width:340px;width:calc(100% - 40px);box-shadow:0 6px 22px rgba(30,42,44,.12)">' +
      '<h1 style="font-family:Newsreader,serif;font-weight:500;font-size:22px;margin:0 0 6px;color:#1E2A2C">Aðgangur</h1>' +
      '<p style="color:#5E6E6E;font-size:14px;margin:0 0 16px">Sláðu inn lykilorð til að opna skólanámskrána.</p>' +
      '<input id="hg-pw" type="password" autocomplete="current-password" placeholder="Lykilorð" style="width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid #9FCBB0;border-radius:8px;font:inherit;font-size:15px;margin-bottom:10px">' +
      '<button id="hg-go" style="width:100%;padding:10px;border:0;border-radius:8px;background:#2F7A52;color:#fff;font:inherit;font-weight:600;font-size:15px;cursor:pointer">Opna</button>' +
      '<p id="hg-err" style="color:#b4524a;font-size:13px;margin:10px 0 0;min-height:16px"></p></div>';
    document.body.appendChild(ov);
    var inp = ov.querySelector("#hg-pw"), btn = ov.querySelector("#hg-go"), err = ov.querySelector("#hg-err");
    inp.focus();
    function sha256(s) {
      return crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)).then(function (b) {
        return Array.from(new Uint8Array(b)).map(function (x) { return x.toString(16).padStart(2, "0"); }).join("");
      });
    }
    function tryUnlock() {
      sha256(inp.value).then(function (h) {
        if (h === HASH) { try { sessionStorage.setItem("haefni_unlocked", HASH); } catch (e) {} ov.remove(); }
        else { err.textContent = "Rangt lykilorð."; inp.select(); }
      });
    }
    btn.addEventListener("click", tryUnlock);
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") tryUnlock(); });
  })();

  var FLOKKAR = window.FLOKKAR;
  var BASE_SUBJECT = window.SUBJECT;
  var p_ar = new URLSearchParams(location.search).get("ar") || "";
  var ARGANGUR = /^\d{4}$/.test(p_ar) ? p_ar : "";           // aðeins gilt fæðingarár
  var SUBJECT = ARGANGUR ? (ARGANGUR + "-" + BASE_SUBJECT) : BASE_SUBJECT;
  if (ARGANGUR) {
    var eb = document.querySelector(".eyebrow");
    if (eb) eb.insertAdjacentHTML("beforeend", ' &nbsp;·&nbsp; <strong style="color:var(--sea)">Árgangur ' + ARGANGUR + '</strong>');
    var bakhlekkur = document.querySelector('.eyebrow a[href="index.html"]');
    if (bakhlekkur) bakhlekkur.setAttribute("href", "index.html");
  }
  var BEKKIR = window.BEKKIR || [5, 6, 7];   // árgangar dálkanna
  var rom = ["I", "II", "III", "IV", "V", "VI"];
  var efni = document.getElementById("efni");
  var barfill = document.getElementById("barfill");
  var prosenta = document.getElementById("prosenta");
  var taln = document.getElementById("taln");
  var stadaEl = document.getElementById("stada");
  var vidvorun = document.getElementById("vidvorun");
  var state = {};
  var heild = 0;

  var cfgOk = window.SUPABASE_URL && window.SUPABASE_ANON_KEY &&
    !/YOUR-PROJECT|YOUR-ANON-KEY/.test(window.SUPABASE_URL + window.SUPABASE_ANON_KEY);
  var client = cfgOk ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY) : null;

  function esc(s) { return s ? String(s).replace(/</g, "&lt;") : ""; }
  function idFor(fi, vi) { return SUBJECT + "-f" + fi + "-v" + vi; }
  function setStada(cls, txt) { stadaEl.className = "stada " + cls; stadaEl.textContent = txt; }

  FLOKKAR.forEach(function (fl, fi) {
    heild += fl.vidmid.length;
    var sec = document.createElement("section");
    sec.className = "flokkur";
    sec.innerHTML =
      '<div class="flokkur-haus"><span class="flokkur-nr">' + rom[fi] + '</span>' +
      '<h2>' + fl.heiti + '</h2>' +
      '<span class="telja" data-flokkur="' + fi + '">0/' + fl.vidmid.length + '</span></div>';
    fl.vidmid.forEach(function (v, vi) {
      var id = idFor(fi, vi);
      var dalkar = BEKKIR.map(function (b) {
        return '<div class="dalkur b' + b + '"><label>' + b + '. bekkur</label>' +
          '<textarea data-bekkur="' + b + '" placeholder="Skráning fyrir ' + b + '. bekk…"></textarea></div>';
      }).join("");
      var card = document.createElement("div");
      card.className = "vidmid";
      card.dataset.id = id;
      card.dataset.flokkur = fi;
      card.innerHTML =
        '<button class="toggle" aria-pressed="false">' +
        '<span class="merki"><svg viewBox="0 0 24 24"><polyline points="4,12 10,18 20,6"></polyline></svg></span>' +
        '<span class="vtexti"><span class="vheiti">' + v[0] + '</span>' +
        '<span class="vlysing">' + v[1] + '</span></span></button>' +
        '<div class="ihugun"><div><div class="ihugun-inn">' +
        '<p class="ihugun-sp">Hvernig fórst þú í þetta hæfniviðmið?</p>' +
        '<div class="dalkar">' + dalkar + '</div></div></div></div>';
      sec.appendChild(card);
    });
    efni.appendChild(sec);
  });

  function cardById(id) { return efni.querySelector('.vidmid[data-id="' + CSS.escape(id) + '"]'); }

  function uppfaeraTeljara() {
    var merkt = 0;
    FLOKKAR.forEach(function (fl, fi) {
      var n = 0;
      fl.vidmid.forEach(function (_, vi) { if ((state[idFor(fi, vi)] || {}).merkt) n++; });
      merkt += n;
      var t = efni.querySelector('.telja[data-flokkur="' + fi + '"]');
      t.textContent = n + "/" + fl.vidmid.length;
      t.classList.toggle("full", n === fl.vidmid.length);
    });
    var p = Math.round(merkt / heild * 100);
    barfill.style.width = p + "%";
    prosenta.textContent = p + "%";
    taln.textContent = merkt + " af " + heild + " skráð";
  }

  function applyToCard(id, fromRemote) {
    var card = cardById(id); if (!card) return;
    var st = state[id] || {};
    card.classList.toggle("merkt", !!st.merkt);
    card.querySelector(".toggle").setAttribute("aria-pressed", st.merkt ? "true" : "false");
    BEKKIR.forEach(function (b) {
      var ta = card.querySelector('textarea[data-bekkur="' + b + '"]');
      if (!ta) return;
      var val = st["b" + b] || "";
      if (fromRemote && document.activeElement === ta) return;
      if (ta.value !== val) ta.value = val;
    });
  }

  function upsert(patch) {
    if (!client) return;
    patch.subject = SUBJECT;
    client.from("haefnividmid").upsert(patch).then(function (r) {
      if (r.error) { setStada("villa", "Vistun mistókst"); console.error(r.error); }
    });
  }

  var timers = {};
  function debounceUpsert(id, key, val) {
    var k = id + ":" + key;
    clearTimeout(timers[k]);
    timers[k] = setTimeout(function () {
      var patch = { id: id }; patch[key] = val;
      upsert(patch);
    }, 600);
  }

  efni.addEventListener("click", function (e) {
    var btn = e.target.closest(".toggle"); if (!btn) return;
    var card = btn.closest(".vidmid"); var id = card.dataset.id;
    var st = state[id] || (state[id] = { merkt: false });
    st.merkt = !st.merkt;
    applyToCard(id); uppfaeraTeljara();
    upsert({ id: id, merkt: st.merkt });
    if (st.merkt) { var ta = card.querySelector("textarea"); setTimeout(function () { ta.focus(); }, 320); }
  });

  efni.addEventListener("input", function (e) {
    if (e.target.tagName !== "TEXTAREA") return;
    var card = e.target.closest(".vidmid"); var id = card.dataset.id;
    var b = e.target.dataset.bekkur;
    var st = state[id] || (state[id] = { merkt: false });
    st["b" + b] = e.target.value;
    debounceUpsert(id, "b" + b, e.target.value);
  });

  uppfaeraTeljara();

  if (!client) { setStada("otengt", "Ekki tengt"); vidvorun.style.display = "block"; return; }
  setStada("otengt", "Tengist…");

  client.from("haefnividmid").select("*").eq("subject", SUBJECT).then(function (r) {
    if (r.error) { setStada("villa", "Tenging mistókst"); console.error(r.error); return; }
    (r.data || []).forEach(function (row) { state[row.id] = row; applyToCard(row.id, true); });
    uppfaeraTeljara();
    setStada("tengt", "Tengt");
  });

  client.channel("rt-" + SUBJECT)
    .on("postgres_changes",
      { event: "*", schema: "public", table: "haefnividmid", filter: "subject=eq." + SUBJECT },
      function (payload) {
        var row = payload.new; if (!row || !row.id) return;
        state[row.id] = Object.assign(state[row.id] || {}, row);
        applyToCard(row.id, true);
        uppfaeraTeljara();
      })
    .subscribe(function (status) {
      if (status === "SUBSCRIBED") setStada("tengt", "Tengt");
      else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setStada("villa", "Samstilling rofin");
    });
})();
