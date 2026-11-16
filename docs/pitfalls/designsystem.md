# Designsystem: Tailwind v4 + shadcn-svelte

Lesen, bevor du an UI-Komponenten, `app.css` oder Layout arbeitest.

Alle UI-Bausteine kommen aus **shadcn-svelte** (Style `vega`, Basisfarbe `neutral`,
Farben aus dem junkerlabs-Modul, siehe unten), das Layout aus Tailwind-Utilities. Icons: `@lucide/svelte`, einzeln
importiert (`@lucide/svelte/icons/<name>`), damit nur genutzte Icons im Bundle landen.

## Werkzeug

* **`shadcn` und `shadcn-svelte` sind zwei Projekte.** `shadcn/ui` ist React-only; für
  Svelte gilt `shadcn-svelte` (eigene CLI, eigene Registry, Unterbau `bits-ui`).
* **Komponenten nicht von Hand pflegen.** `web/src/lib/components/ui/**` ist CLI-Output.
  Nachziehen mit `npx shadcn-svelte@1.7.1 add <name> -y` aus `web/` (`-o` überschreibt).
  Eigene Anpassungen gehören in die aufrufende Datei, nicht in die generierte.
* **`shadcn-svelte init` läuft nicht ohne TTY durch** (`--preset` erwartet keinen Namen,
  sondern einen Code von `shadcn-svelte.com/create`). `components.json` ist deshalb von
  Hand geschrieben — `add` braucht nur diese Datei.
* **`add` bricht mit `Error: File '$app/tsconfig' not found.` ab.** SvelteKit 3 erzeugt
  die Basis-`tsconfig` als `node_modules/$app/tsconfig.json`; jedes `npm install`/
  `uninstall` räumt sie weg. Vorher `npx svelte-kit sync` laufen lassen.
* **Aliase in `components.json` sind `#lib/…`, nicht `$lib/…`.** SvelteKit 3 hat `$lib`
  zugunsten von Subpath-Imports entfernt. Die CLI übernimmt die Aliase wörtlich in die
  generierten Imports (`from "#lib/utils.js"`), das funktioniert.
* Die generierten Dateien nutzen doppelte Anführungszeichen — so lassen, nicht umformatieren.

## junkerlabs UI-Modul

* **Verbindlich ist der Brand-Guide** (Repo `junker-labs/brand`, `README.md`); wo er schweigt,
  gelten die Werte aus Workbench `packages/ui/src/styles/tokens.css` — aber nicht dessen dort
  gelistete Abweichungen (blaue Links, Amber im Header-Logo/als Chart-Farbe).
* **Farben, Schrift, Radius, Wortmarke, Unterstrich und Glas stehen in
  `web/src/lib/brand/junkerlabs.css`**, nicht in `app.css`. Die Datei bringt ihr eigenes
  `@theme inline` (`text-link`, `bg-header`, `text-header-muted`, `*-jl-amber`, `font-display`,
  System-Schrift als `font-sans`) mit; `app.css` importiert sie und mappt nur die shadcn-Namen.
  Text- und Ring-Farben als Hex — `tokens.test.ts` prüft daraus die Kontraste (Text 4,5:1,
  Fokus-Ring 3:1, auch Kopfzeile und Text auf Glas) hell und dunkel.
* **Amber ist nie Textfarbe auf hellem Grund und keine Deko.** Er markiert nur: Links und
  Aktionen (`link`: Ink-Text, 3px Amber-Linie, 4px Abstand), den aktiven Navigationspunkt
  (`nav-active`) und das betonte Wort einer Überschrift (`emphasis`, 6px/6px). Status-Badges
  behalten Statusfarben. Links daher `class="link"`, nicht `text-link hover:underline`.
* **Fokus-Ring hell Ink, dunkel Amber:** Amber hat auf Weiß unter 3:1. In der Kopfzeile
  (immer Ink) setzt `.jl-on-dark` `--ring` auf Amber und die Wortmarke auf Off-White;
  Portale (Dropdown-Inhalte) hängen am `<body>` und erben das nicht.
* **`link` hat `padding-bottom`/negativen `margin-bottom` (7px)**, damit der Strich in
  `truncate`-Elementen (`overflow: hidden`) nicht abgeschnitten wird. Das wirkt nur, wenn
  `link` und `truncate` am *selben* Element sitzen: Steckt der Text in einem
  `<span class="truncate">` im Link, schneidet der Span den Strich komplett ab (Symptom:
  Link sieht aus wie normaler Text) — dann `link` an den Span. Für Nav-Boxen `nav-active`,
  nicht `link`.
* **Glas (`jl-glass`) nur mit Formen dahinter (`jl-shapes`)** und nie für Tabellen, Formulare,
  Listen (Login: Markenbereich auf Glas, Formular auf opaker Karte). Bei
  `prefers-reduced-transparency` opak.
* **Manrope nur selbst gehostet** (`@fontsource/manrope`, 500 + 700, nie Google Fonts/CDN),
  für Überschriften (`h1`, `h2`, Card-/Dialog-Titel) und Wortmarke; Fließtext ist System-Schrift.
* **Logo:** `Lockup.svelte` (Icon `d.` + Wortmarke `junker.labs` + Deskriptor `deals`). Der
  Punkt steht nur im Logo, im Fließtext „junker.labs deals" oder „Deals". Das SVG neben
  `junkerlabs.css` ist eine Kopie aus `brand/logo/` (die Kachel wird per CSS gerundet).
* **Favicons in `web/static/`** (`favicon.ico` 16/32/48, `apple-touch-icon.png` 180), aus
  `brand/logo/deals-icon.png` erzeugt; verlinkt in `app.html`, nicht im Layout (der Browser
  fragt vor dem ersten Skript). 16 px ist von Hand gepixelt: größere Glyphen, keine Rundungen
  (Brand-Guide, Icons). **Kein SVG-Favicon:** Chrome, Edge und Firefox nähmen sonst das SVG
  auch für 16 px und überspringen den gepixelten Frame. Nie per relativem Pfad auf `brand/`
  verweisen.
* **vitest liefert CSS-Importe leer, auch `?raw`.** Tests, die eine CSS-Datei lesen, nehmen
  `readFileSync('src/…')` (unter jsdom ist `import.meta.url` keine `file:`-URL).

## Tailwind v4

* **Kein `tailwind.config.js`.** Konfiguration steckt in `web/src/app.css`:
  `@import 'tailwindcss'`, Tokens als CSS-Variablen, `@theme inline` bildet sie auf
  Utility-Namen ab (`--color-card` → `bg-card`).
* **Dark Mode hängt an der Klasse `.dark` auf `<html>`, nicht an `prefers-color-scheme`.**
  Schalter im Benutzermenü, Zustand in `lib/theme.svelte.ts` (localStorage `crm-theme`,
  ohne Wahl folgt es dem Gerät); `app.html` setzt die Klasse schon vor dem ersten Bild.
  Symptom bei einem Rückfall auf `@media (prefers-color-scheme: dark)` — in Tokens
  (`junkerlabs.css`) oder in der `@custom-variant`: Gerät dunkel + Schalter hell ergibt eine
  Mischung, einzelne Flächen (`dark:bg-input/30`) oder alle Tokens bleiben dunkel.
  Dunkle Werte deshalb immer unter `.dark { … }` bzw. `dark:` schreiben.
* **`--chart-*` und `--sidebar-*` fehlen bewusst in `app.css`.** Wer per `add` eine
  Chart- oder Sidebar-Komponente holt, muss die Tokens aus
  `https://shadcn-svelte.com/registry/colors/neutral.json` nachtragen.
* **Klassen nur als ganze Strings.** Tailwind findet Klassen per Textsuche;
  `` `bg-${color}-500` `` wird nie generiert. Farbzuordnungen stehen deshalb als volle
  Klassennamen in `lib/types.ts` (`COLUMN_COLORS`).

## Komponenten-Fallen

**Ein `<form>` um `Card.Header`/`Content`/`Footer` frisst die Abstände.** `Card.Root` ist
`flex flex-col gap-(--card-spacing)`; die Abschnitte haben selbst nur waagerechtes
Padding. Der Wrapper muss die Rhythmik übernehmen:
`<form class="flex flex-col gap-(--card-spacing)">` (so in `login/+page.svelte`).

**Ein Single-Select von bits-ui lässt sich abwählen.** Tippt man den bereits gewählten
Eintrag noch einmal an, setzt `Select.Root` den gebundenen Wert auf `""`. Bei optionalen
Feldern ist `""` gewollt „keine Auswahl" (Unternehmen eines Kontakts). Bei Pflichtfeldern
(Unternehmen, Zuständig eines Leads) fängt es die Prüfung im Dialog ab (`validate()` in
`LeadDialog.svelte`) — wer ein Select baut, dessen Wert weiterverarbeitet wird, muss `""`
an *einer* Stelle behandeln.

**Ein Select, das eine Aktion auslöst** (z. B. Phasenwechsel auf der Detailseite), mit einer
Funktionsbindung: `bind:value={() => current, (v) => v && store.move(v)}`. Der Trigger zeigt
immer den echten Wert, und das Abwählen auf `""` wird ohne lokalen Zustand ignoriert.

**Eine Variante schlägt die nackte Utility-Klasse, und `tailwind-merge` merkt es nicht.**
Symptom: `<Select.Trigger class="h-11">` bleibt 36px hoch. Ursache: der Trigger bringt
`data-[size=default]:h-9` mit (Spezifität 0,2,0 gegen 0,1,0). Über dieselbe Variante
setzen: `class="h-11 data-[size=default]:h-11"`.

**Dialoge schließen nicht von selbst beim Speichern.** Alle Formulare hier sind
`Dialog` + `<form onsubmit>`; der Handler setzt `open = false` selbst. Zwei Muster, je
nachdem, ob ein Fehler den Dialog offen halten muss:
* *optimistisch* (Lead bearbeiten, Phase, Pipeline-Einstellungen): erst schließen, dann
  speichern; Fehler erscheinen als Banner über dem Board.
* *auf den Server warten* (Unternehmen, Kontakt, neuer Lead): speichern, bei Erfolg
  schließen, sonst Meldung im Dialog — dort würde ein geschlossener Dialog die Eingaben
  verwerfen.
Löschen fragt über `components/ConfirmDialog.svelte` nach (schließt vor `onconfirm`).

**Dialoge aus `#lib/components/dialog/index.js` importieren**, nicht aus `components/ui/dialog`.
Der Wrapper setzt den Screenreader-Text des Schließen-Buttons auf „Schließen" (der
shadcn-Output sagt „Close" und wird nicht händisch gepflegt).

**`goto` in SvelteKit 3 kennt kein `noScroll`/`keepFocus` mehr.** Für URL-Zustand (z. B.
`/leads?lead=<id>` für die Schnellansicht) `goto(url, { replace: true, reset: false })`.

**`content-visibility: auto` schneidet alles ab, was über das Element hinausragt.** Es
bringt Paint-Containment mit. Auf dem Kartenrahmen in `KanbanCard.svelte` gesetzt, nicht
auf dem Wrapper — dort lägen die Drop-Linien (`-top-[5px]`) außerhalb und wären unsichtbar.
