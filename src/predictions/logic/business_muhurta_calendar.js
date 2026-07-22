/**
 * business_muhurta_calendar.js
 * ─────────────────────────────────────────────────────────────
 * Business & Career Muhurta analysis, built on top of window.PANCHANG_ENGINE:
 *
 *   1. A Date & Time picker — lets the user check the Panchang / Business
 *      Muhurta scores for ANY chosen date+time (defaults to "now"), instead
 *      of always being locked to the current moment.
 *   2. Panchang summary panel (Ritu/Maas/Nakshatra/Tithi/Vara/Karana/Yoga/
 *      Chogadiya/Rahu-Kaal/Abhijit) for the selected date+time.
 *   3. A catalog of business scenarios (new client meeting, starting a fixed
 *      vs. recurring project, presentations, authority approvals, meeting
 *      good/bad people, buying a house/car, hiring staff, raising an
 *      invoice, finalizing/breaking a deal, buying/selling shares), each
 *      scored against the selected date+time using the Panchang. Every
 *      scenario has a checkbox — tick any number of them and export just
 *      those as timed .ics calendar events at the chosen date+time.
 *   4. A Calendar Generator: pick a start/end date + a time-of-day + one or
 *      more work types, scan every day in the range, and download a .ics
 *      file of the auspicious days/events (timed at the chosen hour).
 *
 * INTEGRATION (one line, inside your existing Business & Career panel's
 * render function, e.g. wherever renderTaraChakra(...) is currently called):
 *
 *     window.BUSINESS_MUHURTA.mount('bizPanelContentContainerId');
 *
 * `mount` injects the date/time picker + all sections and wires up every
 * button handler. Location defaults to window.BIRTH.lat/lon/utcOff when
 * present, otherwise pass an explicit {lat, lon, utcOffsetHours} in opts.
 */

window.BUSINESS_MUHURTA = {

    // ===================== BUSINESS SCENARIO CATALOG =====================

    SCENARIOS: [
        {
            id: 'new_client', label: '🤝 Meeting a New Client',
            nakshatras: ['Ashwini','Rohini','Mrigashira','Pushya','Uttara Phalguni','Hasta','Chitra','Anuradha','Shravana','Dhanishta','Revati'],
            nakshatraGroups: ['Mridu'], tithiGroups: ['Bhadra'], varaPreferred: ['Sunday','Wednesday','Thursday','Friday'],
            rationale: 'Best for an audience with a new client/authority: Ashwini, Rohini, Mrigashira, Pushya, Uttara Phalguni, Hasta, Chitra, Anuradha, Shravana, Dhanishta, Revati; Bhadra Tithi; Sun/Wed/Thu/Fri.'
        },
        {
            id: 'project_fixed', label: '🏗️ Starting a Fixed / Permanent Project',
            nakshatras: ['Rohini','Uttara Phalguni','Uttara Ashadha','Uttara Bhadrapada'],
            tithiGroups: ['Purna'], avoidNote: 'Avoid starting right at the end of a Ritu/Ayana/lunar month.',
            rationale: 'Dhruva (Fixed) Nakshatras — Rohini, Uttara Phalguni, Uttara Ashadha, Uttara Bhadrapada — with Purna Tithi (5th/10th/15th) for lasting, one-time-permanent projects (foundations, infrastructure, legacy ventures).'
        },
        {
            id: 'project_recurring', label: '🔁 Starting a Recurring / Changing-Type Project',
            nakshatras: ['Punarvasu','Swati','Shravana','Dhanishta','Shatabhisha'],
            tithiGroups: ['Nanda','Bhadra'],
            rationale: 'Chara (Movable) Nakshatras — Punarvasu, Swati, Shravana, Dhanishta, Shatabhisha — favour projects meant to renew, repeat, or change form (subscriptions, iterative work, recurring contracts). Punarvasu specifically governs renewal.'
        },
        {
            id: 'presentation', label: '🎤 Presentation to Client',
            nakshatraGroups: ['Mridu'], nakshatras: ['Mrigashira','Chitra','Anuradha','Revati'],
            tithiGroups: ['Bhadra','Nanda'],
            rationale: 'Soft (Mridu) Nakshatras — Mrigashira, Chitra, Anuradha, Revati — favour gentle persuasion, relationship-building, and being well received.'
        },
        {
            id: 'authority_approval', label: '🏛️ Appointment with Authorities (Approval)',
            nakshatras: ['Ashwini','Rohini','Mrigashira','Pushya','Uttara Phalguni','Hasta','Chitra','Anuradha','Shravana','Dhanishta','Revati'],
            tithiGroups: ['Bhadra'], varaPreferred: ['Sunday','Wednesday','Thursday','Friday'],
            rationale: 'Same window as meeting a new client: Bhadra Tithi (2nd/7th/12th) is specifically highlighted for gaining favour with important people; Sun/Wed/Thu/Fri favour dealing with authorities.'
        },
        {
            id: 'meet_good_people', label: '😊 Chances of Meeting Good / Helpful People',
            nakshatraGroups: ['Mridu'], nakshatras: ['Mrigashira','Chitra','Anuradha','Revati'],
            tithiGroups: ['Nanda','Bhadra','Purna'], avoidTithiGroups: ['Rikta'],
            rationale: 'Soft (Mridu) Nakshatras favour making friends and harmonious new connections; any Shukla Paksha tithi other than Rikta supports this.'
        },
        {
            id: 'meet_difficult_people', label: '⚠️ Confronting / Dealing with Difficult People',
            nakshatraGroups: ['Tikshna'], nakshatras: ['Ardra','Ashlesha','Jyeshtha','Mula'],
            tithiGroups: ['Jaya'],
            rationale: 'If you must confront, out-negotiate, or overcome an adversarial party, Sharp (Tikshna) Nakshatras + Jaya Tithi (3rd/8th/13th, "Triumph") favour prevailing. For seeking peace/compromise instead, use Pushya, Anuradha, or Purva Phalguni on the 8th/12th Tithi.'
        },
        {
            id: 'buy_house', label: '🏠 Buying a House / Property',
            nakshatras: ['Rohini','Uttara Phalguni','Uttara Ashadha','Uttara Bhadrapada'],
            tithiGroups: ['Purna'],
            rationale: 'Dhruva (Fixed) Nakshatras + Purna Tithi — this is a permanent/long-lasting acquisition, so use the same window as starting a fixed project.'
        },
        {
            id: 'buy_car', label: '🚗 Buying a Car / Vehicle',
            nakshatras: ['Ashwini','Punarvasu','Swati','Shravana','Dhanishta','Shatabhisha'],
            nakshatraGroups: ['Chara'],
            rationale: 'Movable (Chara) Nakshatras (plus Ashwini, ruled by the Ashwini Kumaras — horse/vehicle energy) suit purchasing vehicles.'
        },
        {
            id: 'hire_staff', label: '👥 Hiring New Staff',
            nakshatras: ['Ashwini','Mrigashira','Pushya','Hasta','Chitra','Anuradha','Revati'],
            varaPreferred: ['Sunday','Wednesday','Thursday','Friday'],
            rationale: 'Ashwini, Mrigashira, Pushya, Hasta, Chitra, Anuradha, and Revati are the classically favoured Nakshatras for hiring employees/staff, on Sun/Wed/Thu/Fri.'
        },
        {
            id: 'raise_invoice', label: '🧾 Raising an Invoice',
            tithiGroups: ['Bhadra','Purna'], varaPreferred: ['Wednesday','Thursday','Friday'],
            rationale: 'Treat like initiating a piece of business: Bhadra/Purna Tithi and a commerce-favouring weekday (Mercury/Jupiter/Venus) supports prompt, full payment.'
        },
        {
            id: 'finalize_deal', label: '✅ Finalizing a Business Deal',
            tithiGroups: ['Bhadra','Nanda'], varaPreferred: ['Friday','Sunday','Wednesday','Thursday'],
            rationale: 'Nanda Tithi on a Friday forms Siddha Yoga, and on a Sunday forms Amrita Yoga — both are said to secure lasting prosperity from a concluded deal.'
        },
        {
            id: 'break_deal', label: '❌ Breaking / Terminating a Business Deal',
            nakshatras: ['Bharani','Magha','Purva Phalguni','Purva Ashadha','Purva Bhadrapada'],
            nakshatraGroups: ['Ugra'], tithiGroups: ['Rikta'], varaPreferred: ['Tuesday','Saturday'],
            rationale: 'Fierce (Ugra) Nakshatras are explicitly favoured for "breaking contracts"; Rikta Tithi (4th/9th/14th) supports clean elimination/ending. Never use this window for a deal you want to keep or renew.'
        },
        {
            id: 'buy_shares', label: '📈 Buying Shares / Investing',
            tithiGroups: ['Purna','Bhadra'], varaPreferred: ['Thursday'], avoidTithiGroups: ['Rikta'],
            rationale: 'Purna Tithi (abundance) with Thursday (Jupiter, wealth) favours new acquisitions meant to grow.'
        },
        {
            id: 'sell_shares', label: '📉 Selling Shares (profitable exit)',
            tithiGroups: ['Purna','Bhadra'], varaPreferred: ['Thursday','Friday'], avoidTithiGroups: ['Rikta'],
            rationale: 'For a profitable, well-timed sale, use the same Purna/Bhadra window as buying. If instead your goal is to be permanently RID of a bad holding, use Rikta Tithi (elimination) the same way you would clear a final debt.'
        }
    ],

    // ===================== SCORING =====================

    /** Score one Panchang moment against one scenario. Returns {score, verdict, reasons[]}. */
    scoreScenario: function (panchang, scenario) {
        let score = 0;
        const reasons = [];

        if (scenario.nakshatras && scenario.nakshatras.includes(panchang.nakshatra.name)) {
            score += 3; reasons.push(`✓ Nakshatra ${panchang.nakshatra.name} is on the preferred list.`);
        } else if (scenario.nakshatraGroups && scenario.nakshatraGroups.includes(panchang.nakshatra.natureKey)) {
            score += 2; reasons.push(`✓ Nakshatra ${panchang.nakshatra.name} belongs to the favoured ${panchang.nakshatra.natureInfo.label} group.`);
        }

        if (scenario.tithiGroups && panchang.tithi.group && scenario.tithiGroups.includes(panchang.tithi.group)) {
            score += 2; reasons.push(`✓ Tithi ${panchang.tithi.ofPaksha} (${panchang.tithi.group}) matches.`);
        }
        if (scenario.avoidTithiGroups && panchang.tithi.group && scenario.avoidTithiGroups.includes(panchang.tithi.group)) {
            score -= 3; reasons.push(`✗ Tithi ${panchang.tithi.ofPaksha} (${panchang.tithi.group}) should be avoided for this.`);
        }

        if (scenario.varaPreferred && scenario.varaPreferred.includes(panchang.vara.name)) {
            score += 2; reasons.push(`✓ ${panchang.vara.name} is a favoured weekday for this.`);
        }
        if (scenario.varaAvoid && scenario.varaAvoid.includes(panchang.vara.name)) {
            score -= 2; reasons.push(`✗ ${panchang.vara.name} is unfavourable for this.`);
        }

        // Universal modifiers
        if (panchang.tithi.group === 'Rikta' && !(scenario.tithiGroups || []).includes('Rikta')) {
            score -= 3; reasons.push('✗ Rikta Tithi — avoid for auspicious beginnings unless this task is specifically about elimination/ending.');
        }
        if (panchang.yoga.nature === 'severe-bad') { score -= 5; reasons.push(`✗✗ ${panchang.yoga.name} Yoga — classically "consuming fire", strictly avoid.`); }
        else if (panchang.yoga.nature === 'bad') { score -= 2; reasons.push(`✗ ${panchang.yoga.name} Yoga is inauspicious.`); }
        if (!panchang.karana.favorable) { score -= 1; reasons.push(`✗ Karana ${panchang.karana.name} causes drudgery — not ideal.`); }
        if (panchang.specialYogas.guruPushyaYoga) { score += 3; reasons.push('⭐ Guru Pushya Yoga today.'); }
        else if (panchang.specialYogas.raviPushyaYoga) { score += 3; reasons.push('⭐ Ravi Pushya Yoga today.'); }

        const verdict = score >= 5 ? 'Excellent' : score >= 2 ? 'Good' : score > -2 ? 'Neutral' : 'Avoid';
        return { score, verdict, reasons };
    },

    /** Score every scenario for a single Panchang moment. */
    scoreAllScenarios: function (panchang) {
        return this.SCENARIOS.map(s => Object.assign({ scenario: s }, this.scoreScenario(panchang, s)))
            .sort((a, b) => b.score - a.score);
    },

    // ===================== CALENDAR GENERATOR (SCAN + ICS) =====================

    /**
     * Scan every day from startDate to endDate (inclusive) for one scenario,
     * evaluating the Panchang at a given time-of-day each day (defaults to
     * 12:00 noon, a representative always-fairly-neutral moment) — returns
     * every day scored, sorted best-first. Pass hour/minute to evaluate at
     * the actual time you plan to hold the meeting/activity instead.
     */
    scanRange: function (startDate, endDate, scenarioId, lat, lon, utcOffsetHours, hour, minute) {
        const scenario = this.SCENARIOS.find(s => s.id === scenarioId);
        if (!scenario) return [];
        const hh = (hour !== undefined && hour !== null && !isNaN(hour)) ? hour : 12;
        const mm = (minute !== undefined && minute !== null && !isNaN(minute)) ? minute : 0;
        const results = [];
        const cur = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        let guard = 0;
        while (cur <= end && guard < 3660) { // hard safety cap ~10 years
            const evalMoment = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate(), hh, mm, 0);
            const panchang = window.PANCHANG_ENGINE.compute(evalMoment, lat, lon, utcOffsetHours);
            const scored = this.scoreScenario(panchang, scenario);
            results.push({ date: new Date(cur), evalMoment: evalMoment, panchang, scenario, score: scored.score, verdict: scored.verdict, reasons: scored.reasons });
            cur.setDate(cur.getDate() + 1);
            guard++;
        }
        return results.sort((a, b) => b.score - a.score);
    },

    // ===================== ICS EXPORT =====================

    _icsEscape: function (s) { return String(s).replace(/[\\;,]/g, m => '\\' + m).replace(/\n/g, '\\n'); },
    _icsDateStamp: function (d) { return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`; },
    /** UTC-based DATETIME stamp, e.g. 20260722T043000Z */
    _icsDateTimeStampUTC: function (d) {
        return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}T` +
               `${String(d.getUTCHours()).padStart(2, '0')}${String(d.getUTCMinutes()).padStart(2, '0')}${String(d.getUTCSeconds()).padStart(2, '0')}Z`;
    },

    /**
     * Build an .ics VCALENDAR string from an array of events. Two event shapes
     * are supported (mix freely in the same array):
     *
     *   ALL-DAY:  { date: Date, summary, description }
     *   TIMED:    { dateTime: Date (local wall-clock at the business location,
     *               i.e. Y/M/D/H/M as picked by the user), utcOffsetHours,
     *               durationMinutes (default 60), summary, description }
     */
    buildICS: function (events) {
        const now = new Date();
        const stamp = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}T${String(now.getUTCHours()).padStart(2, '0')}${String(now.getUTCMinutes()).padStart(2, '0')}${String(now.getUTCSeconds()).padStart(2, '0')}Z`;
        let ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Vedic Astrology App//Muhurta Calendar//EN\r\nCALSCALE:GREGORIAN\r\n';
        events.forEach((ev, i) => {
            ics += 'BEGIN:VEVENT\r\n';
            if (ev.dateTime) {
                const off = (ev.utcOffsetHours !== undefined && ev.utcOffsetHours !== null) ? ev.utcOffsetHours : 0;
                const localMs = Date.UTC(ev.dateTime.getFullYear(), ev.dateTime.getMonth(), ev.dateTime.getDate(), ev.dateTime.getHours(), ev.dateTime.getMinutes(), 0);
                const utcStartMs = localMs - off * 3600000;
                const utcStart = new Date(utcStartMs);
                const durMin = ev.durationMinutes || 60;
                const utcEnd = new Date(utcStartMs + durMin * 60000);
                const uidStamp = this._icsDateTimeStampUTC(utcStart);
                ics += `UID:muhurta-${uidStamp}-${i}@vedic-app\r\n`;
                ics += `DTSTAMP:${stamp}\r\n`;
                ics += `DTSTART:${uidStamp}\r\n`;
                ics += `DTEND:${this._icsDateTimeStampUTC(utcEnd)}\r\n`;
            } else {
                const dstart = this._icsDateStamp(ev.date);
                const nextDay = new Date(ev.date.getTime() + 86400000);
                const dend = this._icsDateStamp(nextDay);
                ics += `UID:muhurta-${dstart}-${i}@vedic-app\r\n`;
                ics += `DTSTAMP:${stamp}\r\n`;
                ics += `DTSTART;VALUE=DATE:${dstart}\r\n`;
                ics += `DTEND;VALUE=DATE:${dend}\r\n`;
            }
            ics += `SUMMARY:${this._icsEscape(ev.summary)}\r\n`;
            ics += `DESCRIPTION:${this._icsEscape(ev.description)}\r\n`;
            ics += 'END:VEVENT\r\n';
        });
        ics += 'END:VCALENDAR\r\n';
        return ics;
    },

    downloadICS: function (icsString, filename) {
        const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename || 'muhurta-calendar.ics';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
    },

    // ===================== HTML RENDERING =====================

    _verdictColor: function (v) {
        return v === 'Excellent' ? '#00DD77' : v === 'Good' ? '#66DD99' : v === 'Neutral' ? '#FFD700' : '#FF4477';
    },

    renderPanchangPanel: function (panchang) {
        const off = panchang.utcOffsetHours;
        const E = window.PANCHANG_ENGINE;
        const chogRows = (panchang.chogadiya || []).map(c =>
            `<div style="display:flex;justify-content:space-between;padding:2px 0;font-size:9px;border-bottom:1px solid rgba(255,255,255,.05);">
               <span style="color:var(--muted);width:36px;">${c.period === 'day' ? '☀' : '🌙'}</span>
               <span style="flex:1;color:${c.quality === 'good' ? '#00DD77' : '#FF4477'};font-weight:bold;">${c.name}</span>
               <span style="color:var(--muted);">${E.fmtTime(c.start, off)}–${E.fmtTime(c.end, off)}</span>
             </div>`).join('');

        return `<div class="pred-item" style="border-left:3px solid #FFD700;">
          <div class="pred-title" style="color:#FFD700;">🕉 Panchang — ${E.fmtDate(panchang.date, off)}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:9.5px;margin:6px 0;">
            <div><span style="color:var(--muted);">Ritu:</span> <b>${panchang.ritu.name}</b></div>
            <div><span style="color:var(--muted);">Maas:</span> <b>${panchang.maas}</b></div>
            <div><span style="color:var(--muted);">Nakshatra:</span> <b>${panchang.nakshatra.name}</b> (pada ${panchang.nakshatra.pada}) — ${panchang.nakshatra.natureInfo.label}</div>
            <div><span style="color:var(--muted);">Tithi:</span> <b>${panchang.tithi.ofPaksha} ${panchang.tithi.paksha}</b> (${panchang.tithi.group})</div>
            <div><span style="color:var(--muted);">Vara:</span> <b>${panchang.vara.name}</b> (${panchang.vara.ruler})</div>
            <div><span style="color:var(--muted);">Karana:</span> <b style="color:${panchang.karana.favorable ? '#00DD77' : '#FF4477'};">${panchang.karana.name}</b></div>
            <div><span style="color:var(--muted);">Yoga:</span> <b style="color:${panchang.yoga.nature === 'good' ? '#00DD77' : '#FF4477'};">${panchang.yoga.name}</b></div>
            <div><span style="color:var(--muted);">Sunrise–Sunset:</span> <b>${E.fmtTime(panchang.sunrise, off)}–${E.fmtTime(panchang.sunset, off)}</b></div>
          </div>
          <div style="margin-top:6px;padding:6px 8px;background:rgba(255,68,119,.06);border:1px solid rgba(255,68,119,.25);border-radius:4px;font-size:9px;">
            <b style="color:#FF8899;">Avoid:</b> Rahu Kaal ${E.fmtTime(panchang.inauspicious.rahuKaal.start, off)}–${E.fmtTime(panchang.inauspicious.rahuKaal.end, off)} ·
            Yamaganda ${E.fmtTime(panchang.inauspicious.yamaganda.start, off)}–${E.fmtTime(panchang.inauspicious.yamaganda.end, off)} ·
            Gulika ${E.fmtTime(panchang.inauspicious.gulikaKaal.start, off)}–${E.fmtTime(panchang.inauspicious.gulikaKaal.end, off)}
          </div>
          <div style="margin-top:6px;padding:6px 8px;background:rgba(0,221,119,.06);border:1px solid rgba(0,221,119,.25);border-radius:4px;font-size:9px;">
            <b style="color:#00DD77;">Abhijit Muhurat:</b> ${E.fmtTime(panchang.abhijit.start, off)}–${E.fmtTime(panchang.abhijit.end, off)} (universally auspicious)
            ${panchang.brahma ? `<br><b style="color:#66CCFF;">Brahma Muhurat:</b> ${E.fmtTime(panchang.brahma.start, off)}–${E.fmtTime(panchang.brahma.end, off)} (best for meditation/rituals)` : ''}
          </div>
          <details style="margin-top:6px;">
            <summary style="cursor:pointer;font-size:9px;color:var(--cyan);">Chogadiya (day + night, 8 segments each)</summary>
            ${chogRows}
          </details>
          <div style="margin-top:8px;font-size:9px;line-height:1.5;color:var(--text);opacity:.9;">
            ${E.recommendation(panchang).map(l => '• ' + l).join('<br>')}
          </div>
        </div>`;
    },

    renderBusinessMuhurtaPanel: function (panchang) {
        const scored = this.scoreAllScenarios(panchang);
        // Stash so the export handler (wired separately, after this HTML lands
        // in the DOM) can look up rationale/reasons without recomputing.
        this._lastScored = scored;
        this._lastPanchang = panchang;

        const rows = scored.map(s => {
            const c = this._verdictColor(s.verdict);
            const staffNote = s.scenario.id === 'hire_staff' ? `<div style="margin-top:3px;font-size:8.5px;color:var(--cyan);">Preferred Nakshatras: ${s.scenario.nakshatras.join(', ')}</div>` : '';
            return `<label style="display:flex;gap:6px;align-items:flex-start;cursor:pointer;margin-top:6px;padding:6px 8px;border:1px solid ${c}44;border-left:3px solid ${c};border-radius:4px;background:${c}0A;">
                <input type="checkbox" class="bmScenarioChk" value="${s.scenario.id}" style="margin-top:3px;flex-shrink:0;">
                <span style="flex:1;">
                  <div style="display:flex;justify-content:space-between;align-items:baseline;">
                    <span style="font-size:10.5px;font-weight:bold;color:var(--text);">${s.scenario.label}</span>
                    <span style="font-size:9.5px;font-weight:bold;color:${c};">${s.verdict} (${s.score > 0 ? '+' : ''}${s.score})</span>
                  </div>
                  <div style="font-size:8.5px;color:var(--muted);margin-top:3px;">${s.scenario.rationale}</div>
                  ${staffNote}
                  <div style="font-size:8.5px;margin-top:3px;color:var(--text);opacity:.85;">${s.reasons.join(' ')}</div>
                </span>
              </label>`;
        }).join('');

        const E = window.PANCHANG_ENGINE;
        const whenStr = E ? `${E.fmtDate(panchang.date, panchang.utcOffsetHours)} ${E.fmtTime(panchang.date, panchang.utcOffsetHours)}` : '';

        return `<div class="pred-item" style="border-left:3px solid rgba(200,168,75,.6);">
          <div class="pred-title" style="color:rgba(200,168,75,1);">💼 Business Muhurta — Scenario Scores for ${whenStr}</div>
          <div style="font-size:8.5px;color:var(--muted);margin-bottom:4px;">Every business scenario scored against the Panchang at the date/time picked above. Tick any event(s) below and export them as calendar (.ics) entries at that exact date/time — or use the Calendar Generator further down to scan a whole date range instead.</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:4px;">
            <button id="bmScenarioSelectAll" class="btn" style="font-size:8.5px;padding:3px 8px;">☑ Select All</button>
            <button id="bmScenarioSelectNone" class="btn" style="font-size:8.5px;padding:3px 8px;">☐ Clear</button>
            <button id="bmExportSelected" class="btn gold" style="font-size:8.5px;padding:3px 8px;">⬇ EXPORT SELECTED TO .ICS</button>
          </div>
          ${rows}
          <div id="bmExportMsg" style="font-size:8.5px;margin-top:6px;"></div>
        </div>`;
    },

    // ===================== DATE & TIME PICKER (for Panchang + Business Muhurta) =====================

    _pad2: function (n) { return String(n).padStart(2, '0'); },
    _dateInputVal: function (d) { return `${d.getFullYear()}-${this._pad2(d.getMonth() + 1)}-${this._pad2(d.getDate())}`; },
    _timeInputVal: function (d) { return `${this._pad2(d.getHours())}:${this._pad2(d.getMinutes())}`; },

    /**
     * Date/Time picker + containers that the Panchang panel and Business
     * Muhurta panel get (re)rendered into whenever the user recalculates.
     */
    renderDateTimePickerUI: function (date) {
        const d = date || new Date();
        return `<div class="pred-item" style="border-left:3px solid var(--gold);">
          <div class="pred-title" style="color:var(--gold);">🕐 Select Date & Time for Business Panchang</div>
          <div style="font-size:8.5px;color:var(--muted);margin-bottom:6px;">Defaults to right now. Pick any date/time — past or future — to check how auspicious it is before scheduling a meeting, signing, launch, or purchase.</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
            <label style="font-size:9px;color:var(--muted);">Date <input type="date" id="bmPanchangDate" value="${this._dateInputVal(d)}" style="background:var(--bg3,#111);color:var(--text);border:1px solid var(--border,#333);border-radius:2px;padding:3px 5px;font-size:9px;"></label>
            <label style="font-size:9px;color:var(--muted);">Time <input type="time" id="bmPanchangTime" value="${this._timeInputVal(d)}" style="background:var(--bg3,#111);color:var(--text);border:1px solid var(--border,#333);border-radius:2px;padding:3px 5px;font-size:9px;"></label>
            <button id="bmPanchangRecalc" class="btn gold" style="font-size:9px;padding:4px 8px;">🔄 RECALCULATE</button>
            <button id="bmPanchangNow" class="btn" style="font-size:9px;padding:4px 8px;">⟲ Now</button>
          </div>
        </div>
        <div id="bmPanchangPanelContainer"></div>
        <div id="bmBusinessPanelContainer"></div>`;
    },

    /**
     * Wires the Date/Time picker's Recalculate/Now buttons. Renders an
     * initial Panchang + Business Muhurta panel immediately, and re-renders
     * both (plus re-wires the scenario-export checkboxes/button) every time
     * the user picks a new date/time.
     */
    /** Public alias — attach the Date/Time picker's Recalculate/Now handlers
     * (and trigger the initial Panchang/Business Muhurta render) after
     * renderDateTimePickerUI()'s HTML is already in the DOM. Use this when
     * you appended the panels yourself instead of calling mount(). */
    wireDateTimePicker: function (opts) { return this._wireDateTimePicker(opts); },

    _wireDateTimePicker: function (opts) {
        const dateEl = document.getElementById('bmPanchangDate');
        const timeEl = document.getElementById('bmPanchangTime');
        const recalcBtn = document.getElementById('bmPanchangRecalc');
        const nowBtn = document.getElementById('bmPanchangNow');
        const panchangContainer = document.getElementById('bmPanchangPanelContainer');
        const bizContainer = document.getElementById('bmBusinessPanelContainer');
        if (!recalcBtn || !panchangContainer || !bizContainer) return;

        const recompute = (dt) => {
            let chosen = dt;
            if (!chosen) {
                const dv = dateEl.value, tv = timeEl.value || '12:00';
                if (!dv) return;
                const [y, m, day] = dv.split('-').map(Number);
                const [hh, mm] = tv.split(':').map(Number);
                chosen = new Date(y, m - 1, day, hh, mm, 0);
            }
            const panchang = window.PANCHANG_ENGINE.compute(chosen, opts.lat, opts.lon, opts.utcOffsetHours);
            panchangContainer.innerHTML = window.BUSINESS_MUHURTA.renderPanchangPanel(panchang);
            bizContainer.innerHTML = window.BUSINESS_MUHURTA.renderBusinessMuhurtaPanel(panchang);
            window.BUSINESS_MUHURTA._wireScenarioExport({ lat: opts.lat, lon: opts.lon, utcOffsetHours: opts.utcOffsetHours, dateTime: chosen });
        };

        recalcBtn.addEventListener('click', () => recompute());
        if (nowBtn) nowBtn.addEventListener('click', () => {
            const now = new Date();
            dateEl.value = window.BUSINESS_MUHURTA._dateInputVal(now);
            timeEl.value = window.BUSINESS_MUHURTA._timeInputVal(now);
            recompute(now);
        });

        // Initial render at whatever date/time is currently in the inputs
        // (set by renderDateTimePickerUI, defaulting to "now").
        recompute();
    },

    /**
     * Wires the Select All / Clear / Export buttons that sit above the
     * per-scenario checkboxes inside renderBusinessMuhurtaPanel's HTML.
     * Must be called AFTER that HTML is in the DOM (mount()/_wireDateTimePicker
     * already do this for you).
     */
    _wireScenarioExport: function (opts) {
        const selAllBtn = document.getElementById('bmScenarioSelectAll');
        const clearBtn = document.getElementById('bmScenarioSelectNone');
        const exportBtn = document.getElementById('bmExportSelected');
        const msgEl = document.getElementById('bmExportMsg');
        if (!exportBtn) return;

        if (selAllBtn) selAllBtn.addEventListener('click', () => {
            document.querySelectorAll('.bmScenarioChk').forEach(c => { c.checked = true; });
        });
        if (clearBtn) clearBtn.addEventListener('click', () => {
            document.querySelectorAll('.bmScenarioChk').forEach(c => { c.checked = false; });
        });

        exportBtn.addEventListener('click', () => {
            const ids = Array.from(document.querySelectorAll('.bmScenarioChk:checked')).map(c => c.value);
            if (!ids.length) {
                if (msgEl) { msgEl.textContent = '⚠ Tick at least one business event above to export.'; msgEl.style.color = 'var(--rose)'; }
                return;
            }
            const panchang = window.BUSINESS_MUHURTA._lastPanchang;
            const scored = window.BUSINESS_MUHURTA._lastScored || [];
            const dt = opts.dateTime || (panchang ? panchang.date : new Date());
            const events = ids.map(id => {
                const s = scored.find(x => x.scenario.id === id);
                if (!s || !panchang) return null;
                return {
                    dateTime: dt,
                    utcOffsetHours: opts.utcOffsetHours,
                    durationMinutes: 60,
                    summary: `${s.scenario.label.replace(/^[^\w]+/, '')} — ${s.verdict}`,
                    description: `${s.scenario.rationale} | Verdict: ${s.verdict} (score ${s.score > 0 ? '+' : ''}${s.score}) | Nakshatra: ${panchang.nakshatra.name} (pada ${panchang.nakshatra.pada}), Tithi: ${panchang.tithi.ofPaksha} ${panchang.tithi.paksha} (${panchang.tithi.group}), Vara: ${panchang.vara.name}, Yoga: ${panchang.yoga.name}, Karana: ${panchang.karana.name} | Reasons: ${s.reasons.join(' ')}`
                };
            }).filter(Boolean);

            if (!events.length) return;
            const ics = window.BUSINESS_MUHURTA.buildICS(events);
            window.BUSINESS_MUHURTA.downloadICS(ics, `business-panchang-${events.length}-event${events.length > 1 ? 's' : ''}.ics`);
            if (msgEl) { msgEl.textContent = `✓ Exported ${events.length} event(s) to .ics.`; msgEl.style.color = 'var(--green)'; }
        });
    },

    renderCalendarGeneratorUI: function () {
        const checks = this.SCENARIOS.map(s => `<label style="display:flex;align-items:center;gap:4px;font-size:8.5px;padding:2px 4px;cursor:pointer;">
            <input type="checkbox" class="bmCalScenarioChk" value="${s.id}" checked> ${s.label}
          </label>`).join('');
        return `<div class="pred-item" style="border-left:3px solid var(--cyan);">
          <div class="pred-title" style="color:var(--cyan);">📅 Auspicious Calendar Generator</div>
          <div style="font-size:8.5px;color:var(--muted);margin-bottom:6px;">Pick a date range, a time-of-day, and one or more work types — every day in the range is scored (at that time-of-day) for every ticked event, and you can download the auspicious ones as a single .ics file to import into any calendar app.</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:6px;">
            <label style="font-size:9px;color:var(--muted);">From <input type="date" id="bmCalStart" style="background:var(--bg3,#111);color:var(--text);border:1px solid var(--border,#333);border-radius:2px;padding:3px 5px;font-size:9px;"></label>
            <label style="font-size:9px;color:var(--muted);">To <input type="date" id="bmCalEnd" style="background:var(--bg3,#111);color:var(--text);border:1px solid var(--border,#333);border-radius:2px;padding:3px 5px;font-size:9px;"></label>
            <label style="font-size:9px;color:var(--muted);">At time <input type="time" id="bmCalTime" value="10:00" style="background:var(--bg3,#111);color:var(--text);border:1px solid var(--border,#333);border-radius:2px;padding:3px 5px;font-size:9px;"></label>
          </div>
          <div style="display:flex;gap:6px;margin-bottom:4px;">
            <button id="bmCalSelectAll" class="btn" style="font-size:8.5px;padding:3px 8px;">☑ Select All</button>
            <button id="bmCalSelectNone" class="btn" style="font-size:8.5px;padding:3px 8px;">☐ Clear</button>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px;max-height:140px;overflow-y:auto;border:1px solid var(--border,#333);border-radius:2px;padding:4px;margin-bottom:6px;background:var(--bg3,#111);">
            ${checks}
          </div>
          <button id="bmCalGenerate" class="btn" style="font-size:9px;padding:4px 8px;">GENERATE</button>
          <button id="bmCalDownload" class="btn gold" style="font-size:9px;padding:4px 8px;display:none;">⬇ DOWNLOAD .ICS</button>
          <div id="bmCalResults" style="margin-top:8px;max-height:260px;overflow-y:auto;"></div>
        </div>`;
    },

    /** Public alias — attach the Calendar Generator's button handlers after
     * its HTML (from renderCalendarGeneratorUI()) is already in the DOM.
     * Use this when you appended the panels yourself (el.innerHTML += ...)
     * instead of calling mount(), which would overwrite the container. */
    wireCalendarGenerator: function (opts) { return this._wireCalendarGenerator(opts); },

    _wireCalendarGenerator: function (opts) {
        const genBtn = document.getElementById('bmCalGenerate');
        const dlBtn = document.getElementById('bmCalDownload');
        const resultsEl = document.getElementById('bmCalResults');
        const selAllBtn = document.getElementById('bmCalSelectAll');
        const selNoneBtn = document.getElementById('bmCalSelectNone');
        if (!genBtn) return;
        let lastResults = [];
        let lastHH = 10, lastMM = 0;

        if (selAllBtn) selAllBtn.addEventListener('click', () => {
            document.querySelectorAll('.bmCalScenarioChk').forEach(c => { c.checked = true; });
        });
        if (selNoneBtn) selNoneBtn.addEventListener('click', () => {
            document.querySelectorAll('.bmCalScenarioChk').forEach(c => { c.checked = false; });
        });

        genBtn.addEventListener('click', () => {
            const startVal = document.getElementById('bmCalStart').value;
            const endVal = document.getElementById('bmCalEnd').value;
            const timeVal = document.getElementById('bmCalTime').value || '10:00';
            const scenarioIds = Array.from(document.querySelectorAll('.bmCalScenarioChk:checked')).map(c => c.value);
            if (!startVal || !endVal) { resultsEl.innerHTML = '<div style="color:var(--rose);font-size:9px;">Pick both a start and end date.</div>'; return; }
            if (!scenarioIds.length) { resultsEl.innerHTML = '<div style="color:var(--rose);font-size:9px;">Tick at least one business event type.</div>'; dlBtn.style.display = 'none'; return; }
            const start = new Date(startVal + 'T00:00:00');
            const end = new Date(endVal + 'T00:00:00');
            if (end < start) { resultsEl.innerHTML = '<div style="color:var(--rose);font-size:9px;">End date must be on/after start date.</div>'; return; }
            const spanDays = Math.round((end - start) / 86400000) + 1;
            if (spanDays > 730) { resultsEl.innerHTML = '<div style="color:var(--rose);font-size:9px;">Please keep ranges to 2 years or less.</div>'; return; }

            const [hh, mm] = timeVal.split(':').map(Number);
            lastHH = hh; lastMM = mm;
            const allScenarios = scenarioIds.length === window.BUSINESS_MUHURTA.SCENARIOS.length;

            const E = window.PANCHANG_ENGINE;
            lastResults = [];
            scenarioIds.forEach(id => {
                lastResults = lastResults.concat(window.BUSINESS_MUHURTA.scanRange(start, end, id, opts.lat, opts.lon, opts.utcOffsetHours, hh, mm));
            });
            const good = lastResults.filter(r => r.score >= 2).sort((a, b) => a.date - b.date || a.scenario.label.localeCompare(b.scenario.label));

            if (!good.length) {
                const fallback = lastResults.slice().sort((a, b) => b.score - a.score)[0];
                resultsEl.innerHTML = `<div style="font-size:9px;color:var(--amber);">No day scored "Good" or better in this range for the selected event type(s). Best available: ${fallback ? E.fmtDate(fallback.date) + ' (' + fallback.scenario.label + ', ' + fallback.verdict + ', ' + fallback.score + ')' : 'n/a'}.</div>`;
                dlBtn.style.display = 'none';
                return;
            }
            resultsEl.innerHTML = `<div style="font-size:9px;color:var(--green);margin-bottom:4px;">${good.length} auspicious day/event combination(s) found${allScenarios ? ' across all event types' : ''} at ${timeVal}:</div>` +
                good.map(r => `<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:9px;">
                    <span>${E.fmtDate(r.date)} — ${r.scenario.label}</span>
                    <span style="color:var(--muted);">${r.panchang.nakshatra.name} · ${r.panchang.tithi.group} · ${r.panchang.vara.name}</span>
                    <span style="color:${window.BUSINESS_MUHURTA._verdictColor(r.verdict)};font-weight:bold;">${r.verdict} (+${r.score})</span>
                  </div>`).join('');
            dlBtn.style.display = 'inline-block';
        });

        dlBtn.addEventListener('click', () => {
            const good = lastResults.filter(r => r.score >= 2).sort((a, b) => a.date - b.date);
            if (!good.length) return;
            const events = good.map(r => ({
                dateTime: r.evalMoment || new Date(r.date.getFullYear(), r.date.getMonth(), r.date.getDate(), lastHH, lastMM, 0),
                utcOffsetHours: opts.utcOffsetHours,
                durationMinutes: 60,
                summary: `Auspicious: ${r.scenario.label.replace(/^[^\w]+/, '')}`,
                description: `${r.scenario.rationale} | ${r.verdict} (score ${r.score}) | Nakshatra: ${r.panchang.nakshatra.name}, Tithi: ${r.panchang.tithi.ofPaksha} ${r.panchang.tithi.paksha} (${r.panchang.tithi.group}), Vara: ${r.panchang.vara.name}, Yoga: ${r.panchang.yoga.name}, Karana: ${r.panchang.karana.name} | Reasons: ${r.reasons.join(' ')}`
            }));
            const ics = window.BUSINESS_MUHURTA.buildICS(events);
            const scenarioIds = Array.from(document.querySelectorAll('.bmCalScenarioChk:checked')).map(c => c.value);
            const allScenarios = scenarioIds.length === window.BUSINESS_MUHURTA.SCENARIOS.length;
            window.BUSINESS_MUHURTA.downloadICS(ics, allScenarios ? 'muhurta-all-business-events.ics' : `muhurta-${scenarioIds.join('-')}.ics`);
        });
    },

    // ===================== MOUNT (ONE-LINE INTEGRATION) =====================

    /**
     * Injects the Date/Time picker + Panchang + Business Muhurta (with
     * per-scenario export) + Calendar Generator into the given container
     * element/id, and wires up every button.
     * @param {string|HTMLElement} container - element or element id (e.g. your bizPanel's content div)
     * @param {object} [opts] - { date, lat, lon, utcOffsetHours } — all optional, default to "now" and window.BIRTH's location
     */
    mount: function (container, opts) {
        opts = opts || {};
        const el = typeof container === 'string' ? document.getElementById(container) : container;
        if (!el) { console.warn('BUSINESS_MUHURTA.mount: container not found:', container); return; }

        const date = opts.date || new Date();
        const lat = opts.lat !== undefined ? opts.lat : (window.BIRTH ? window.BIRTH.lat : 0);
        const lon = opts.lon !== undefined ? opts.lon : (window.BIRTH ? window.BIRTH.lon : 0);
        const utcOffsetHours = opts.utcOffsetHours !== undefined ? opts.utcOffsetHours : (window.BIRTH ? window.BIRTH.utcOff : -date.getTimezoneOffset() / 60);

        if (!window.PANCHANG_ENGINE) { el.innerHTML = '<div class="pred-item" style="color:var(--rose)">PANCHANG_ENGINE not loaded — include panchang_engine.js before this file.</div>'; return; }

        el.innerHTML = this.renderDateTimePickerUI(date) + this.renderCalendarGeneratorUI();
        this._wireDateTimePicker({ lat, lon, utcOffsetHours });   // renders Panchang + Business Muhurta panels for `date`, and wires scenario-export
        this._wireCalendarGenerator({ lat, lon, utcOffsetHours });
    }
};

if (typeof module !== 'undefined' && module.exports) module.exports = window.BUSINESS_MUHURTA;