/**
 * KP_placidus.js
 *
 * Placidus house cusps (the house system Krishnamurti Paddhati requires) from
 * RAMC, obliquity and latitude. Replaces the equal-house approximation that
 * KP_prediction.js used for cuspal sub lords (CSLs).
 *
 * Method: MC and Ascendant are closed-form; cusps 11, 12 (above the horizon)
 * and 2, 3 (below) are found by the classical semi-arc iteration — the cusp's
 * right ascension is RAMC + k * (diurnal semi-arc) for houses 11/12 and
 * RAMC + 180 - k * (nocturnal semi-arc) for houses 3/2, where the semi-arc
 * depends on the cusp's own declination (so it is iterated to convergence).
 * Cusps 4-9 are the opposites of 10-3.
 *
 * Uses the SAME sidereal-time and mean-obliquity formulas as main.js's
 * calcAscendant(), so the Ascendant here equals the app's Ascendant.
 *
 * Placidus is undefined inside the polar circles (|lat| >= ~66.5 deg): compute()
 * returns null there and callers fall back to the equal-house approximation.
 *
 * Validated against Swiss Ephemeris (swe_houses, 'P') — see header of the
 * delivering message; differences are < 0.01 deg (nutation in true obliquity).
 */
window.KP_PLACIDUS = {
    _n: function (x) { return ((x % 360) + 360) % 360; },

    _eps: function (jd) {
        const T = (jd - 2451545.0) / 36525.0;
        return 23.439292 - 0.013004 * T - 0.000164 * T * T + 0.000504 * T * T * T;
    },

    ramc: function (jd, lonDeg) {
        const T = (jd - 2451545.0) / 36525.0;
        const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000;
        return this._n(gmst + lonDeg);
    },

    /** Ecliptic longitude of the ecliptic point whose right ascension is ra. */
    _lamFromRA: function (ra, eps) {
        const R = Math.PI / 180;
        return this._n(Math.atan2(Math.sin(ra * R), Math.cos(ra * R) * Math.cos(eps * R)) * 180 / Math.PI);
    },

    /** Tropical Placidus cusps for given RAMC / obliquity / latitude. Index 1..12. null if undefined (polar). */
    cuspsFromRamc: function (ramc, eps, lat) {
        if (Math.abs(lat) >= 66.0) return null;
        const R = Math.PI / 180, D = 180 / Math.PI;
        const th = this._n(ramc);
        const tanLat = Math.tan(lat * R);
        const c = new Array(13);
        c[10] = this._n(Math.atan2(Math.sin(th * R), Math.cos(th * R) * Math.cos(eps * R)) * D);
        c[1] = this._n(Math.atan2(Math.cos(th * R), -(Math.sin(th * R) * Math.cos(eps * R) + tanLat * Math.sin(eps * R))) * D);
        const self = this;
        function iter(offsetFn) {
            let lam = c[10];
            for (let i = 0; i < 60; i++) {
                const decl = Math.asin(Math.sin(eps * R) * Math.sin(lam * R)) * D;
                const ad = Math.asin(Math.max(-1, Math.min(1, tanLat * Math.tan(decl * R)))) * D;
                const ra = self._n(offsetFn(ad));
                const nl = self._lamFromRA(ra, eps);
                if (Math.abs(((nl - lam + 540) % 360) - 180) < 1e-9) { lam = nl; break; }
                lam = nl;
            }
            return lam;
        }
        c[11] = iter(ad => th + (90 + ad) / 3);
        c[12] = iter(ad => th + 2 * (90 + ad) / 3);
        c[3] = iter(ad => th + 180 - (90 - ad) / 3);
        c[2] = iter(ad => th + 180 - 2 * (90 - ad) / 3);
        c[4] = this._n(c[10] + 180); c[5] = this._n(c[11] + 180); c[6] = this._n(c[12] + 180);
        c[7] = this._n(c[1] + 180); c[8] = this._n(c[2] + 180); c[9] = this._n(c[3] + 180);
        return c;
    },

    /**
     * Sidereal Placidus cusps for a birth moment.
     * @param jd UT Julian day (same jd main.js passes to calcAscendant)
     * @param ayanamsaDeg ayanamsa in degrees for that jd/model
     * @returns {ramc, eps, trop:[..], sid:[..], lat, lon} (arrays indexed 1..12) or null
     */
    compute: function (jd, latDeg, lonDeg, ayanamsaDeg) {
        const eps = this._eps(jd), ramc = this.ramc(jd, lonDeg);
        const trop = this.cuspsFromRamc(ramc, eps, latDeg);
        if (!trop) return null;
        const sid = trop.map(v => (v === undefined ? undefined : this._n(v - ayanamsaDeg)));
        return { ramc: ramc, eps: eps, lat: latDeg, lon: lonDeg, ayanamsa: ayanamsaDeg, trop: trop, sid: sid };
    },

    /**
     * Inverse of the Ascendant formula: RAMC that yields a given tropical
     * Ascendant at latitude lat. Used so cusps are always consistent with the
     * Ascendant the app is DISPLAYING (e.g. a chart loaded from fixed data).
     */
    ramcFromAsc: function (ascTrop, lat, eps) {
        const R = Math.PI / 180, D = 180 / Math.PI;
        const tl = Math.tan(ascTrop * R);
        const B = tl * Math.cos(eps * R);
        const C = -tl * Math.tan(lat * R) * Math.sin(eps * R);
        const Rr = Math.sqrt(1 + B * B), alpha = Math.atan2(B, 1);
        const x = Math.max(-1, Math.min(1, C / Rr));
        const cands = [alpha + Math.acos(x), alpha - Math.acos(x)].map(v => this._n(v * D));
        let best = cands[0], bestErr = 1e9;
        cands.forEach(th => {
            const a = this._n(Math.atan2(Math.cos(th * R), -(Math.sin(th * R) * Math.cos(eps * R) + Math.tan(lat * R) * Math.sin(eps * R))) * D);
            const e = Math.abs(((a - this._n(ascTrop) + 540) % 360) - 180);
            if (e < bestErr) { bestErr = e; best = th; }
        });
        return best;
    },

    /** Sidereal Placidus cusps built from a displayed SIDEREAL Ascendant + latitude (no birth time needed). */
    computeFromAsc: function (ascSid, latDeg, ayanamsaDeg, jd) {
        const eps = this._eps(jd === undefined ? 2451545.0 : jd);
        const ascTrop = this._n(ascSid + ayanamsaDeg);
        const ramc = this.ramcFromAsc(ascTrop, latDeg, eps);
        const trop = this.cuspsFromRamc(ramc, eps, latDeg);
        if (!trop) return null;
        const sid = trop.map(v => (v === undefined ? undefined : this._n(v - ayanamsaDeg)));
        return { ramc: ramc, eps: eps, lat: latDeg, ayanamsa: ayanamsaDeg, trop: trop, sid: sid, derivedFromAsc: true };
    },

    /** Placidus (KP) house of a sidereal longitude given the sidereal cusp array. */
    houseOf: function (sidLon, sidCusps) {
        const x = this._n(sidLon);
        for (let h = 1; h <= 12; h++) {
            const a = sidCusps[h], b = sidCusps[h === 12 ? 1 : h + 1];
            const span = this._n(b - a), off = this._n(x - a);
            if (off < span) return h;
        }
        return null;
    }
};
if (typeof module !== 'undefined' && module.exports) module.exports = window.KP_PLACIDUS;
