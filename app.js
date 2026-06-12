(function () {
  "use strict";
  var FLOKKAR = window.FLOKKAR, SUBJECT = window.SUBJECT;
  var rom = ["I", "II", "III", "IV", "V", "VI"];
  var efni = document.getElementById("efni");
  var barfill = document.getElementById("barfill");
  var prosenta = document.getElementById("prosenta");
  var taln = document.getElementById("taln");
  var stadaEl = document.getElementById("stada");
  var vidvorun = document.getElementById("vidvorun");
  var state = {};        // id -> {merkt, b5, b6, b7}
  var heild = 0;

  var cfgOk = window.SUPABASE_URL && window.SUPABASE_ANON_KEY &&
    !/YOUR-PROJECT|YOUR-ANON-KEY/.test(window.SUPABASE_URL + window.SUPABASE_ANON_KEY);
  var client = cfgOk ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY) : null;

  function esc(s) { return s ? String(s).replace(/</g, "&lt;") : ""; }
  function idFor(fi, vi) { return SUBJECT + "-f" + fi + "-v" + vi; }
  function setStada(cls, txt) { stadaEl.className = "stada " + cls; stadaEl.textContent = txt; }

  // ---- Render ----
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
        '<div class="dalkar">' +
        '<div class="dalkur b5"><label>5. bekkur</label><textarea data-bekkur="5" placeholder="Skráning fyrir 5. bekk…"></textarea></div>' +
        '<div class="dalkur b6"><label>6. bekkur</label><textarea data-bekkur="6" placeholder="Skráning fyrir 6. bekk…"></textarea></div>' +
        '<div class="dalkur b7"><label>7. bekkur</label><textarea data-bekkur="7" placeholder="Skráning fyrir 7. bekk…"></textarea></div>' +
        '</div></div></div></div>';
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

  // Apply a state row to its card. fromRemote=true => don't overwrite a field being edited.
  function applyToCard(id, fromRemote) {
    var card = cardById(id); if (!card) return;
    var st = state[id] || {};
    card.classList.toggle("merkt", !!st.merkt);
    card.querySelector(".toggle").setAttribute("aria-pressed", st.merkt ? "true" : "false");
    ["5", "6", "7"].forEach(function (b) {
      var ta = card.querySelector('textarea[data-bekkur="' + b + '"]');
      var val = st["b" + b] || "";
      if (fromRemote && document.activeElement === ta) return; // don't clobber typing
      if (ta.value !== val) ta.value = val;
    });
  }

  // ---- Sync ----
  function upsert(patch) {
    if (!client) return;
    patch.id = patch.id; patch.subject = SUBJECT;
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
    var st = state[id] || (state[id] = { merkt: false, b5: "", b6: "", b7: "" });
    st.merkt = !st.merkt;
    applyToCard(id); uppfaeraTeljara();
    upsert({ id: id, merkt: st.merkt });
    if (st.merkt) { var ta = card.querySelector("textarea"); setTimeout(function () { ta.focus(); }, 320); }
  });

  efni.addEventListener("input", function (e) {
    if (e.target.tagName !== "TEXTAREA") return;
    var card = e.target.closest(".vidmid"); var id = card.dataset.id;
    var b = e.target.dataset.bekkur;
    var st = state[id] || (state[id] = { merkt: false, b5: "", b6: "", b7: "" });
    st["b" + b] = e.target.value;
    debounceUpsert(id, "b" + b, e.target.value);
  });

  uppfaeraTeljara();

  // ---- Load + realtime ----
  if (!client) {
    setStada("otengt", "Ekki tengt");
    vidvorun.style.display = "block";
    return;
  }
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
