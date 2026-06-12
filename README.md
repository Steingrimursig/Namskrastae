# Hæfniviðmið miðstigs — sameiginlegt vinnusvæði

Vefsíða þar sem kennarar merkja hæfniviðmið aðalnámskrár (samfélagsfræði og stærðfræði,
við lok 7. bekkjar) og skrá hvernig hver árgangur — 5., 6. og 7. bekkur — fór í hvert viðmið.
Allt vistast í sameiginlegum gagnagrunni (Supabase) og samstillist í rauntíma hjá öllum
sem hafa síðuna opna. Síðan sjálf er hýst ókeypis á GitHub Pages.

Þú þarft tvennt, hvort tveggja ókeypis: **GitHub**-aðgang og **Supabase**-aðgang.

---

## Skref 1 — Settu skrárnar á GitHub

1. Búðu til nýtt repo á https://github.com/new (t.d. `haefnividmid`). Hafðu það *Public*.
2. Veldu **"uploading an existing file"** og dragðu inn ALLAR skrárnar úr þessari möppu:
   `index.html`, `samfelagsfraedi.html`, `staerdfraedi.html`, `style.css`, `app.js`,
   `config.js`, `schema.sql`, `README.md`. Smelltu á **Commit changes**.

## Skref 2 — Búðu til gagnagrunn í Supabase

1. Skráðu þig inn á https://supabase.com og smelltu á **New project**
   (veldu nafn og lykilorð fyrir gagnagrunninn — geymdu það).
2. Þegar verkefnið er tilbúið, opnaðu **SQL Editor** (vinstra megin) → **New query**.
3. Opnaðu `schema.sql`, afritaðu allt innihaldið, límdu í gluggann og smelltu **Run**.
   Þetta býr til töfluna og kveikir á rauntíma-samstillingu.
4. Farðu í **Project Settings → API**. Afritaðu tvennt:
   - **Project URL** (t.d. `https://abcd1234.supabase.co`)
   - **anon public** lykilinn (langur strengur undir "Project API keys").

## Skref 3 — Tengdu síðuna við gagnagrunninn

1. Á GitHub, opnaðu `config.js` og smelltu á blýantinn (Edit).
2. Skiptu út `YOUR-PROJECT-URL` og `YOUR-ANON-KEY` fyrir gildin tvö úr skrefi 2.4.
3. **Commit changes**.

## Skref 4 — Kveiktu á vefsíðunni (GitHub Pages)

1. Í repo-inu: **Settings → Pages**.
2. Undir *Build and deployment → Source* veldu **Deploy from a branch**,
   greinin **main** og mappa **/ (root)**. Smelltu **Save**.
3. Eftir um mínútu birtist hlekkur efst, t.d.
   `https://notandanafn.github.io/haefnividmid/`. Deildu honum með samstarfsfólki.

Til að prófa: opnaðu hlekkinn, merktu eitt viðmið og skrifaðu eitthvað í dálk.
Opnaðu sömu slóð í öðrum vafra eða tæki — það ætti að birtast strax.
Grái punkturinn efst verður grænn ("Tengt") þegar samstilling er virk.

---

## Gott að vita

- **Aðgangur og persónuvernd:** "anon"-lykillinn er sýnilegur í `config.js` á opinberri
  síðu, svo hver sem hefur hlekkinn getur lesið og breytt. Það hentar litlum, traustum
  kennarahópi. Ekki setja viðkvæmar persónuupplýsingar nemenda inn. Ef þið viljið loka
  fyrir aðgang má bæta við innskráningu (Supabase Auth) síðar — segðu til ef þú vilt það.
- **Vistun:** hver breyting vistast sjálfkrafa. Tveir sem skrifa í *ólíka* dálka sama
  viðmiðs (t.d. einn í 6. bekk, annar í 7.) trufla ekki hvor annan. Skrifi tveir í
  *sama* reitinn samtímis gildir síðasta skráningin.
- **Bæta við námsgrein:** afritaðu aðra hvora `.html` skrána, breyttu `window.SUBJECT`
  í einkvæmt heiti og settu inn ný hæfniviðmið í `window.FLOKKAR`. Bættu hlekk á
  `index.html`.
