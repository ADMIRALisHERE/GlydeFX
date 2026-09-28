/* GlydeFX - Copyright (C) 2026 Amirhossein Asadi - SPDX-License-Identifier: GPL-3.0-or-later (see LICENSE) */
(function AdmiralGlydeFx(thisObj) {

    /* ------------------------------------------------------------------ */
    /*  Constants                                                          */
    /* ------------------------------------------------------------------ */

    var APP_NAME = "GlydeFX";
    var VERSION  = "1.0";
    var SETTINGS_SECTION = "AdmiralGlydeFx.1";
    var UNDO_KEYS = ($.os.indexOf("Windows") >= 0) ? "Ctrl+Z" : "Cmd+Z";

    var CUSTOM_SLOTS = 8;
    var NAME_MAX = 24;

    var MIN_X = 0.001;

    var Y_LIMIT = [-1, 2];

    var C_OK   = [0.45, 0.85, 0.52];
    var C_WARN = [1.00, 0.76, 0.30];
    var C_ERR  = [1.00, 0.47, 0.47];

    /* ------------------------------------------------------------------ */
    /*  Presets                                                            */
    /* ------------------------------------------------------------------ */

    var ESSENTIALS = [
        ["Linear",      [0, 0, 1, 1],          "Constant speed, no easing."],
        ["Ease",        [0.25, 0.1, 0.25, 1],  "The web's default ease: a quick start and a soft landing."],
        ["Ease In",     [0.42, 0, 1, 1],       "Starts slowly and ends at full speed."],
        ["Ease Out",    [0, 0, 0.58, 1],       "Starts at full speed and lands softly."],
        ["Ease In Out", [0.42, 0, 0.58, 1],    "A slow start and a slow landing."],
        ["Smooth",      [0.76, 0, 0.24, 1],    "A strong, smooth ease in and out (Quart In Out)."],
        ["Snap",        [0.16, 1, 0.3, 1],     "A very fast start that settles gently (Expo Out)."],
        ["Back Out",    [0.34, 1.56, 0.64, 1], "Goes a little past the end and settles back."]
    ];

    var CLASSIC_VARIANTS = ["In", "Out", "In Out"];
    var CLASSIC = [
        ["Sine",  [0.12, 0, 0.39, 0],     [0.61, 1, 0.88, 1],    [0.37, 0, 0.63, 1]],
        ["Quad",  [0.11, 0, 0.5, 0],      [0.5, 1, 0.89, 1],     [0.45, 0, 0.55, 1]],
        ["Cubic", [0.32, 0, 0.67, 0],     [0.33, 1, 0.68, 1],    [0.65, 0, 0.35, 1]],
        ["Quart", [0.5, 0, 0.75, 0],      [0.25, 1, 0.5, 1],     [0.76, 0, 0.24, 1]],
        ["Quint", [0.64, 0, 0.78, 0],     [0.22, 1, 0.36, 1],    [0.83, 0, 0.17, 1]],
        ["Expo",  [0.7, 0, 0.84, 0],      [0.16, 1, 0.3, 1],     [0.87, 0, 0.13, 1]],
        ["Circ",  [0.55, 0, 1, 0.45],     [0, 0.55, 0.45, 1],    [0.85, 0, 0.15, 1]],
        ["Back",  [0.36, 0, 0.66, -0.56], [0.34, 1.56, 0.64, 1], [0.68, -0.6, 0.32, 1.6]]
    ];
    var CLASSIC_TIP = [
        "Gentle, like a sine wave.", "Mild.", "Medium.", "Strong.", "Stronger.",
        "Extreme: almost still at one end.", "Sharp, like a quarter circle.",
        "Pulls back or overshoots a little."
    ];

    var EDIT = [
        ["Punch",     [0.05, 0.7, 0.1, 1],    "Hits at once, then settles: zoom punches and impacts."],
        ["Pop",       [0.2, 1.4, 0.4, 1],     "A quick overshoot: text and stickers popping in."],
        ["Whip",      [0.9, 0, 0.1, 1],       "Nearly still at both ends and a blur in the middle: whip pans."],
        ["Slam",      [0.8, 0, 0.9, 0.25],    "Speeds up into a hard stop: slams on the beat."],
        ["Glide",     [0.3, 0.7, 0.2, 1],     "A long, gentle slow-down: smooth camera drifts."],
        ["Drop",      [0.6, 0, 0.8, 1.3],     "Falls in fast and lands with a small bump."],
        ["Float",     [0.45, 0.05, 0.55, 0.95], "Very soft in and out: floating, breathing."],
        ["Snap Back", [0.6, -0.5, 0.2, 1],    "Pulls back first, then snaps forward."]
    ];

    var ZOOM = [
        ["Zoom In",     [0.12, 0.55, 0.95, 0.45], "Rushes in, eases through the middle, rushes out."],
        ["Zoom Out",    [0.2, 0.62, 0.55, 0.92],  "Pulls out fast and settles."],
        ["Smooth Zoom", [0.25, 0.4, 0.75, 0.6],   "An even zoom with a slight lift at both ends."],
        ["Slow Zoom",   [0.35, 0, 0.3, 1],        "Starts and ends softly: a slow push in."],
        ["Fast Zoom",   [0.01, 0.47, 0.99, 0.25], "Jumps at both ends and nearly holds in the middle."],
        ["Hard Zoom",   [0.15, 0.95, 0.9, 0.12],  "Hits at once, holds, and hits again at the end."]
    ];

    var CATEGORIES = ["Essentials", "Classic In", "Classic Out", "Classic In Out", "Edit", "Zoom"];
    var CAT_HINT = [
        "Everyday curves. Click one, then Apply.",
        "Standard curves that start slowly.",
        "Standard curves that land softly.",
        "Standard curves, slow at both ends.",
        "Curves for edits: punches, whips, slams.",
        "Zoom curves for Scale keyframes."
    ];

    var CAT_TABLES = [ZOOM];
    if (typeof KEY_EXTRA !== "undefined") {
        (function () {
            var i, j, list;
            for (i = 0; i < KEY_EXTRA.length; i++) {
                list = KEY_EXTRA[i].presets;
                for (j = 0; j < list.length; j += 8) {
                    CAT_TABLES.push(list.slice(j, j + 8));
                    CATEGORIES.push(KEY_EXTRA[i].name + (list.length > 8 ? " " + (j / 8 + 1) : ""));
                    CAT_HINT.push(KEY_EXTRA[i].hint);
                }
            }
        })();
    }
    CATEGORIES.push("My Presets");
    CAT_HINT.push("Click an empty place to save the editor's curve.");
    var CAT_MINE = CATEGORIES.length - 1;

    function categoryPresets(cat, custom) {
        var out = [], i, src, v;
        if (cat >= 1 && cat <= 3) {
            v = cat - 1;
            for (i = 0; i < CLASSIC.length; i++) {
                out.push({ name: CLASSIC[i][0] + " " + CLASSIC_VARIANTS[v], tileName: CLASSIC[i][0],
                           curve: CLASSIC[i][1 + v], tip: CLASSIC_TIP[i] });
            }
            return out;
        }
        if (cat === CAT_MINE) {
            for (i = 0; i < CUSTOM_SLOTS; i++) {
                out.push(custom[i] ? { name: custom[i].name, tileName: custom[i].name, curve: custom[i].curve,
                                       tip: "Your preset." } : null);
            }
            return out;
        }
        src = (cat === 0) ? ESSENTIALS : (cat === 4 ? EDIT : (CAT_TABLES[cat - 5] || []));
        for (i = 0; i < src.length; i++) out.push({ name: src[i][0], tileName: src[i][0], curve: src[i][1], tip: src[i][2] });
        return out;
    }

    /* ------------------------------------------------------------------ */
    /*  Small helpers                                                      */
    /* ------------------------------------------------------------------ */

    function clamp(x, lo, hi) { return x < lo ? lo : (x > hi ? hi : x); }

    function plural(n, word) { return n + " " + word + (n === 1 ? "" : "s"); }

    function errorText(err) {
        var s = (err && err.message) ? err.message : String(err);
        return s.replace(/[\r\n]+/g, " ");
    }

    function readSetting(key, fallback) {
        try {
            if (app.settings.haveSetting(SETTINGS_SECTION, key)) return app.settings.getSetting(SETTINGS_SECTION, key);
        } catch (_) {}
        return fallback;
    }

    function saveSetting(key, value) {
        try { app.settings.saveSetting(SETTINGS_SECTION, key, String(value)); } catch (_) {}
    }

    function readIndex(key, fallback, count) {
        var n = parseInt(readSetting(key, ""), 10);
        return (isNaN(n) || n < 0 || n >= count) ? fallback : n;
    }

    /* ------------------------------------------------------------------ */
    /*  Curve math                                                         */
    /* ------------------------------------------------------------------ */

    function bez(a, b, s) {
        return 3 * a * s * (1 - s) * (1 - s) + 3 * b * s * s * (1 - s) + s * s * s;
    }

    function curveRange(p) {
        var lo = 0, hi = 1, i, y;
        for (i = 1; i < 64; i++) {
            y = bez(p[1], p[3], i / 64);
            if (y < lo) lo = y;
            if (y > hi) hi = y;
        }
        return { lo: lo, hi: hi };
    }

    function overshoots(p) {
        var r = curveRange(p);
        return r.lo < -1e-4 || r.hi > 1 + 1e-4;
    }

    function isLinear(p) {
        return Math.abs(p[0] - p[1]) < 1e-6 && Math.abs(p[2] - p[3]) < 1e-6;
    }

    function cleanCurve(p) {
        return [clamp(p[0], 0, 1), clamp(p[1], Y_LIMIT[0], Y_LIMIT[1]),
                clamp(p[2], 0, 1), clamp(p[3], Y_LIMIT[0], Y_LIMIT[1])];
    }

    function sameCurve(a, b) {
        if (!a || !b) return false;
        for (var i = 0; i < 4; i++) if (Math.abs(a[i] - b[i]) > 0.0005) return false;
        return true;
    }

    function num(n) {
        var s = String(Math.round(n * 1000) / 1000);
        return (s === "-0") ? "0" : s;
    }

    function curveText(p) {
        return num(p[0]) + ", " + num(p[1]) + ", " + num(p[2]) + ", " + num(p[3]);
    }

    function parseCurve(text) {
        var m = String(text).match(/-?\d*\.?\d+/g), p = [], i;
        if (!m || m.length < 4) return null;
        for (i = 0; i < 4; i++) {
            p.push(parseFloat(m[i]));
            if (isNaN(p[i])) return null;
        }
        return cleanCurve(p);
    }

    /* ------------------------------------------------------------------ */
    /*  Keyframes                                                          */
    /* ------------------------------------------------------------------ */

    function activeComp() {
        var item = null;
        try { item = app.project.activeItem; } catch (_) {}
        return (item && item instanceof CompItem) ? item : null;
    }

    function isSpatial(prop) {
        var t = prop.propertyValueType;
        return t === PropertyValueType.TwoD_SPATIAL || t === PropertyValueType.ThreeD_SPATIAL;
    }

    function easeable(prop) {
        var t = prop.propertyValueType;
        if (t === PropertyValueType.NO_VALUE || t === PropertyValueType.CUSTOM_VALUE ||
            t === PropertyValueType.MARKER || t === PropertyValueType.LAYER_INDEX ||
            t === PropertyValueType.MASK_INDEX || t === PropertyValueType.TEXT_DOCUMENT) return false;
        try { return prop.isInterpolationTypeValid(KeyframeInterpolationType.BEZIER); } catch (_) { return false; }
    }

    function selectedSegments(comp) {
        var res = { props: [], pairs: 0, lonely: 0, unsupported: 0 }, li, list, pi, prop, keys, segs, k;
        for (li = 1; li <= comp.numLayers; li++) {
            try { list = comp.layer(li).selectedProperties; } catch (_) { list = []; }
            for (pi = 0; pi < list.length; pi++) {
                prop = list[pi];
                if (!(prop instanceof Property)) continue;
                try { keys = prop.selectedKeys; } catch (_) { keys = []; }
                if (!keys || !keys.length) continue;
                if (!easeable(prop)) { res.unsupported++; continue; }
                segs = [];
                for (k = 0; k + 1 < keys.length; k++) if (keys[k + 1] === keys[k] + 1) segs.push(keys[k]);
                if (!segs.length) { res.lonely++; continue; }
                res.props.push({ prop: prop, segs: segs });
                res.pairs += segs.length;
            }
        }
        return res;
    }

    function applySegment(prop, k, p) {
        var L = KeyframeInterpolationType;
        var inK = prop.keyInInterpolationType(k), outNext = prop.keyOutInterpolationType(k + 1);
        var ease, avg = [], d, x1, x2, s1, s2, outE = [], inE = [];

        prop.setInterpolationTypeAtKey(k, inK, L.LINEAR);
        prop.setInterpolationTypeAtKey(k + 1, L.LINEAR, outNext);
        if (isLinear(p)) return;

        ease = prop.keyOutTemporalEase(k);
        for (d = 0; d < ease.length; d++) avg.push(ease[d].speed);

        x1 = clamp(p[0], MIN_X, 1);
        x2 = clamp(p[2], 0, 1 - MIN_X);
        s1 = p[1] / x1;
        s2 = (1 - p[3]) / (1 - x2);
        for (d = 0; d < avg.length; d++) {
            outE.push(new KeyframeEase(s1 * avg[d], x1 * 100));
            inE.push(new KeyframeEase(s2 * avg[d], (1 - x2) * 100));
        }

        prop.setInterpolationTypeAtKey(k, inK, L.BEZIER);
        prop.setInterpolationTypeAtKey(k + 1, L.BEZIER, outNext);

        try { prop.setTemporalAutoBezierAtKey(k, false); } catch (_) {}
        try { prop.setTemporalAutoBezierAtKey(k + 1, false); } catch (_) {}
        try { prop.setTemporalContinuousAtKey(k, false); } catch (_) {}
        try { prop.setTemporalContinuousAtKey(k + 1, false); } catch (_) {}
        prop.setTemporalEaseAtKey(k, prop.keyInTemporalEase(k), outE);
        prop.setTemporalEaseAtKey(k + 1, inE, prop.keyOutTemporalEase(k + 1));
    }

    function applyCurve(comp, p, name) {
        var sel = selectedSegments(comp), res = { sel: sel, pairs: 0, props: 0, failed: 0, clippedPos: 0, clippedPath: 0, clippedColor: 0, error: null };
        var i, j, prop, done, over = overshoots(p);
        if (!sel.pairs) return res;
        app.beginUndoGroup(APP_NAME + " - " + name);
        try {
            for (i = 0; i < sel.props.length; i++) {
                prop = sel.props[i].prop;
                done = 0;
                for (j = 0; j < sel.props[i].segs.length; j++) {
                    try {
                        applySegment(prop, sel.props[i].segs[j], p);
                        done++;
                    } catch (e) {
                        res.failed++;
                        res.error = e;
                    }
                }
                res.pairs += done;
                if (done) res.props++;
                if (done && over) {
                    if (isSpatial(prop)) res.clippedPos++;
                    else if (prop.propertyValueType === PropertyValueType.SHAPE) res.clippedPath++;
                    else if (prop.propertyValueType === PropertyValueType.COLOR) res.clippedColor++;
                }
            }
        } finally {
            app.endUndoGroup();
        }
        return res;
    }

    function arcLength(a, b, c, d) {
        var n = 256, len = 0, prev = a, i, s, q, dim, sum, pt;
        for (i = 1; i <= n; i++) {
            s = i / n;
            pt = [];
            for (dim = 0; dim < a.length; dim++) {
                q = (1 - s) * (1 - s) * (1 - s) * a[dim] + 3 * s * (1 - s) * (1 - s) * b[dim] +
                    3 * s * s * (1 - s) * c[dim] + s * s * s * d[dim];
                pt.push(q);
            }
            sum = 0;
            for (dim = 0; dim < a.length; dim++) sum += (pt[dim] - prev[dim]) * (pt[dim] - prev[dim]);
            len += Math.sqrt(sum);
            prev = pt;
        }
        return len;
    }

    function addVec(a, b) {
        var o = [], i;
        for (i = 0; i < a.length; i++) o.push(a[i] + b[i]);
        return o;
    }

    function segmentAverage(prop, k, dims) {
        var dt = prop.keyTime(k + 1) - prop.keyTime(k), v0 = prop.keyValue(k), v1 = prop.keyValue(k + 1), out = [], d;
        if (!(dt > 0)) return null;

        if (prop.propertyValueType === PropertyValueType.SHAPE) return [1];
        if (isSpatial(prop)) {
            return [arcLength(v0, addVec(v0, prop.keyOutSpatialTangent(k)),
                              addVec(v1, prop.keyInSpatialTangent(k + 1)), v1) / dt];
        }
        if (typeof v0 === "number") return [(v1 - v0) / dt];

        if (dims === 1) {
            var sum = 0;
            for (d = 0; d < v0.length; d++) sum += (v1[d] - v0[d]) * (v1[d] - v0[d]);
            return [(prop.propertyValueType === PropertyValueType.COLOR ? 255 : 1) * Math.sqrt(sum) / dt];
        }
        for (d = 0; d < dims; d++) out.push((v1[d] - v0[d]) / dt);
        return out;
    }

    function readCurve(comp) {
        var sel = selectedSegments(comp), prop, k, L = KeyframeInterpolationType;
        var outT, inT, eo, ei, avg, d, best, x1, y1, x2, y2;
        if (!sel.pairs) return { problem: "none", sel: sel };
        prop = sel.props[0].prop;
        k = sel.props[0].segs[0];
        outT = prop.keyOutInterpolationType(k);
        inT = prop.keyInInterpolationType(k + 1);
        if (outT === L.HOLD) return { problem: "hold" };
        if (outT === L.LINEAR && inT === L.LINEAR) return { curve: [0, 0, 1, 1], prop: prop };
        eo = prop.keyOutTemporalEase(k);
        ei = prop.keyInTemporalEase(k + 1);
        avg = segmentAverage(prop, k, eo.length);
        if (!avg) return { problem: "flat" };
        best = 0;
        for (d = 1; d < avg.length; d++) if (Math.abs(avg[d]) > Math.abs(avg[best])) best = d;
        if (Math.abs(avg[best]) < 1e-9) return { problem: "flat" };
        if (outT === L.LINEAR) { x1 = 1 / 3; y1 = 1 / 3; }
        else { x1 = eo[best].influence / 100; y1 = eo[best].speed / avg[best] * x1; }
        if (inT === L.LINEAR) { x2 = 2 / 3; y2 = 2 / 3; }
        else { x2 = 1 - ei[best].influence / 100; y2 = 1 - ei[best].speed / avg[best] * (1 - x2); }
        return { curve: cleanCurve([x1, y1, x2, y2]), prop: prop };
    }

    /* ------------------------------------------------------------------ */
    /*  My Presets storage                                                 */
    /* ------------------------------------------------------------------ */

    function loadCustom() {
        var out = [], i, s, bar, p;
        for (i = 0; i < CUSTOM_SLOTS; i++) {
            s = String(readSetting("custom" + i, ""));
            bar = s.lastIndexOf("|");
            p = bar > 0 ? parseCurve(s.substring(bar + 1)) : null;
            out.push(p ? { name: s.substring(0, bar), curve: p } : null);
        }
        return out;
    }

    function saveCustom(custom, i) {
        var c = custom[i];
        saveSetting("custom" + i, c ? c.name + "|" + c.curve.join(",") : "");
    }

    function cleanName(s) {
        s = String(s).replace(/[|\r\n\t]+/g, " ").replace(/^\s+|\s+$/g, "");
        return s.length > NAME_MAX ? s.substring(0, NAME_MAX) : s;
    }

    /* ------------------------------------------------------------------ */
    /*  Speed ramps                                                        */
    /* ------------------------------------------------------------------ */

    var SPEED_MIN = 0.05, SPEED_MAX = 10, SPEED_POINTS_MAX = 12;

    var SPEED_POPULAR = [
        ["Montage",  [[0, 2.5], [0.25, 0.5], [0.5, 2.5], [0.75, 0.5], [1, 2.5]],
                     "Fast and slow in turns: quick cuts that breathe."],
        ["Hero",     [[0, 2], [0.3, 0.25], [0.7, 0.25], [1, 2]],
                     "Fast in, a long slow-motion moment, fast out."],
        ["Bullet",   [[0, 3.5], [0.42, 3.5], [0.5, 0.1], [0.58, 3.5], [1, 3.5]],
                     "Fast, then a split second of bullet time, then fast again."],
        ["Jump Cut", [[0, 0.6], [0.42, 0.6], [0.5, 5], [0.58, 0.6], [1, 0.6]],
                     "Calm, then a sudden jump forward, then calm again."],
        ["Flash In", [[0, 5], [0.25, 1], [1, 1]],
                     "Starts in a rush and settles to normal speed."],
        ["Flash Out", [[0, 1], [0.75, 1], [1, 5]],
                      "Normal speed that rushes out at the end."],
        ["Velocity", [[0, 3], [0.5, 0.3], [1, 3]],
                     "The velocity edit: fast, slow on the hit, fast."],
        ["Smooth Slow-mo", [[0, 1], [0.3, 0.4], [0.7, 0.4], [1, 1]],
                           "Eases into slow motion and back out."]
    ];

    var SPEED_BASIC = [
        ["Speed Up",   [[0, 0.5], [1, 2]], "Gets faster and faster."],
        ["Slow Down",  [[0, 2], [1, 0.5]], "Gets slower and slower."],
        ["Ramp In",    [[0, 0.3], [0.3, 1], [1, 1]], "Starts slow and ramps up to normal speed."],
        ["Ramp Out",   [[0, 1], [0.7, 1], [1, 0.3]], "Normal speed that slows down at the end."],
        ["Freeze Hit", [[0, 1], [0.45, 1], [0.5, 0.05], [0.55, 1], [1, 1]],
                       "Almost stops for a moment in the middle - or on the beat."],
        ["2x",   [[0, 2], [1, 2]], "Twice as fast; the clip gets shorter.", true],
        ["0.5x", [[0, 0.5], [1, 0.5]], "Half speed; the clip gets longer.", true],
        ["Custom", [[0, 1], [0.25, 1], [0.5, 1], [0.75, 1], [1, 1]],
                   "Five points at normal speed, to shape by hand."]
    ];

    var SPEED_EDITS = [
        ["Micro",        { ease: [0.2, 0.63, 0.82, 0.41], avg: 1.4 }, "The micro-edit ramp for very short clips: fast in, slow in the middle, fast out."],
        ["Smooth Ramp",  [[0, 3.6], [0.12, 1.4], [0.25, 0.62], [0.5, 0.55], [0.75, 0.68], [0.9, 1.3], [1, 2.7]],
                         "Fast in, a long smooth slow-down, fast out."],
        ["Hard Ramp",    [[0, 7], [0.1, 1.8], [0.25, 0.85], [0.5, 0.62], [0.75, 0.7], [0.9, 1.2], [1, 3.2]],
                         "Very fast in, then slow motion, then out fast."],
        ["Soft Ramp",    [[0, 2.8], [0.12, 1.45], [0.3, 0.9], [0.5, 0.78], [0.7, 0.92], [0.88, 1.5], [1, 2.4]],
                         "A gentle ramp: never very fast, never very slow."],
        ["Slow Dip",     [[0, 2.3], [0.15, 0.85], [0.35, 0.5], [0.5, 0.46], [0.65, 0.52], [0.85, 0.9], [1, 1.9]],
                         "Dips into slow motion in the middle and back out."],
        ["Long Slow-mo", [[0, 4.2], [0.1, 1.2], [0.25, 0.66], [0.5, 0.68], [0.75, 0.66], [0.9, 1.05], [1, 2.4]],
                         "Quick in and out, with a long even slow motion between."]
    ];

    var SPEED_HINT_POPULAR = "Speed curves edit makers know. Click one, then Apply.";
    var SPEED_HINT_EDITS = "Ramps from edits: fast in, slow, fast out.";
    var SPEED_HINT_BASIC = "Simple ramps and fixed speeds.";
    var SPEED_HINT_MINE = "Click an empty place to save the editor's curve.";

    var SPEED_TABLES = [SPEED_POPULAR, SPEED_EDITS, SPEED_BASIC];
    var SPEED_CATEGORIES = ["Popular", "Edits", "Basic"];
    var SPEED_HINT = [SPEED_HINT_POPULAR, SPEED_HINT_EDITS, SPEED_HINT_BASIC];
    if (typeof SPEED_EXTRA !== "undefined") {
        (function () {
            var i, j, list, part;
            for (i = 0; i < SPEED_EXTRA.length; i++) {
                list = SPEED_EXTRA[i].presets;
                for (j = 0; j < list.length; j += 8) {
                    part = list.slice(j, j + 8);
                    SPEED_TABLES.push(part);
                    SPEED_CATEGORIES.push(SPEED_EXTRA[i].name + (list.length > 8 ? " " + (j / 8 + 1) : ""));
                    SPEED_HINT.push(SPEED_EXTRA[i].hint);
                }
            }
        })();
    }
    SPEED_CATEGORIES.push("My Presets");
    SPEED_HINT.push(SPEED_HINT_MINE);
    var SPEED_MINE = SPEED_CATEGORIES.length - 1;
    var LENGTH_ITEMS = ["Keep clip length", "Keep all frames"];

    function copyPoints(pts) {
        var out = [], i;
        for (i = 0; i < pts.length; i++) out.push([pts[i][0], pts[i][1]]);
        return out;
    }

    function easeSlope(p, u) {
        var lo = 0, hi = 1, s = u, i, dx, dy;
        if (u <= 0) return p[0] > 1e-6 ? p[1] / p[0] : 0;
        if (u >= 1) return p[2] < 1 - 1e-6 ? (1 - p[3]) / (1 - p[2]) : 0;
        for (i = 0; i < 50; i++) {
            s = (lo + hi) / 2;
            if (bez(p[0], p[2], s) < u) lo = s; else hi = s;
        }
        dx = 3 * (1 - s) * (1 - s) * p[0] + 6 * (1 - s) * s * (p[2] - p[0]) + 3 * s * s * (1 - p[2]);
        dy = 3 * (1 - s) * (1 - s) * p[1] + 6 * (1 - s) * s * (p[3] - p[1]) + 3 * s * s * (1 - p[3]);
        return dx > 1e-9 ? dy / dx : 0;
    }

    function easePoints(e) {
        var out = [], i, u;
        for (i = 0; i <= 8; i++) {
            u = i / 8;
            out.push([u, clamp(e.avg * easeSlope(e.ease, u), SPEED_MIN, SPEED_MAX)]);
        }
        return out;
    }

    function parseEase(text) {
        var m = String(text).match(/-?\d*\.?\d+/g), v = [], i;
        if (!m || m.length < 5) return null;
        for (i = 0; i < 5; i++) v.push(parseFloat(m[i]));
        if (!(v[4] > 0)) return null;
        return { ease: cleanCurve(v.slice(0, 4)), avg: v[4] };
    }

    function speedPresets(cat, custom) {
        var out = [], i, src, def;
        if (cat === SPEED_MINE) {
            for (i = 0; i < CUSTOM_SLOTS; i++) {
                out.push(custom[i] ? { name: custom[i].name, tileName: custom[i].name, points: custom[i].points,
                                       tip: "Your preset." } : null);
            }
            return out;
        }
        src = SPEED_TABLES[cat] || [];
        for (i = 0; i < src.length; i++) {
            def = src[i][1];
            if (def instanceof Array) {
                out.push({ name: src[i][0], tileName: src[i][0], points: def, tip: src[i][2], keepFrames: !!src[i][3] });
            } else {
                out.push({ name: src[i][0], tileName: src[i][0], points: easePoints(def), ease: def, tip: src[i][2],
                           keepFrames: !!src[i][3] });
            }
        }
        return out;
    }

    function samePoints(a, b) {
        var i;
        if (!a || !b || a.length !== b.length) return false;
        for (i = 0; i < a.length; i++) {
            if (Math.abs(a[i][0] - b[i][0]) > 0.0005 || Math.abs(a[i][1] - b[i][1]) > 0.0005) return false;
        }
        return true;
    }

    function pointsText(pts) {
        var out = [], i;
        for (i = 0; i < pts.length; i++) out.push(num(pts[i][0]) + ":" + num(pts[i][1]));
        return out.join(";");
    }

    function parsePoints(text) {
        var parts = String(text).split(";"), pts = [], i, uv, u, v;
        for (i = 0; i < parts.length; i++) {
            uv = parts[i].split(":");
            if (uv.length !== 2) return null;
            u = parseFloat(uv[0]);
            v = parseFloat(uv[1]);
            if (isNaN(u) || isNaN(v)) return null;
            pts.push([clamp(u, 0, 1), clamp(v, SPEED_MIN, SPEED_MAX)]);
        }
        if (pts.length < 2 || pts.length > SPEED_POINTS_MAX) return null;
        pts[0][0] = 0;
        pts[pts.length - 1][0] = 1;
        for (i = 1; i < pts.length; i++) if (pts[i][0] < pts[i - 1][0]) return null;
        return pts;
    }

    function speedAverage(pts) {
        var sum = 0, i;
        for (i = 1; i < pts.length; i++) sum += (pts[i][0] - pts[i - 1][0]) * (pts[i][1] + pts[i - 1][1]) / 2;
        return sum;
    }

    function slowestPoint(pts) {
        var lo = SPEED_MAX + 1, i;
        for (i = 0; i < pts.length; i++) if (pts[i][1] < lo - 1e-9) lo = pts[i][1];
        for (i = 0; i < pts.length; i++) if (Math.abs(pts[i][1] - lo) < 1e-9) return i;
        return 0;
    }

    function shiftSlowTo(pts, u) {
        var k = slowestPoint(pts), um = pts[k][0], out = copyPoints(pts), i;
        if (k === 0 || k === pts.length - 1) return out;
        for (i = 1; i < pts.length - 1; i++) {
            out[i][0] = (pts[i][0] <= um) ? pts[i][0] / um * u : u + (pts[i][0] - um) / (1 - um) * (1 - u);
        }
        return out;
    }

    function speedPlan(pts, span, range, keepFrames) {
        var avg = speedAverage(pts), T, k, knots = [], s = 0, i;
        if (!(avg > 0)) return null;
        if (keepFrames) {
            k = 1;
            T = range / avg;
        } else {
            T = span;
            k = range / (span * avg);
        }
        for (i = 0; i < pts.length; i++) {
            if (i > 0) s += (pts[i][0] - pts[i - 1][0]) * T * k * (pts[i][1] + pts[i - 1][1]) / 2;
            knots.push({ t: pts[i][0] * T, s: s, v: k * pts[i][1] });
        }
        return { span: T, factor: k, knots: knots };
    }

    function speedLayers(comp) {
        var sel = comp.selectedLayers, out = [], skipped = [], i, L;
        for (i = 0; i < sel.length; i++) {
            L = sel[i];
            try {
                if (!L.canSetTimeRemapEnabled) { skipped.push(L.name + " (no Time Remap)"); continue; }
                if (Math.abs(L.stretch - 100) > 1e-6) { skipped.push(L.name + " (stretch " + L.stretch + " %)"); continue; }
            } catch (_) {
                skipped.push(L.name);
                continue;
            }
            out.push(L);
        }
        return { layers: out, skipped: skipped };
    }

    function sourceTime(L, t) {
        if (L.timeRemapEnabled) return L.property("ADBE Time Remapping").valueAtTime(t, false);
        return t - L.startTime;
    }

    function markerTimes(comp, except) {
        var out = [], i, m, li, L;
        try {
            m = comp.markerProperty;
            for (i = 1; i <= m.numKeys; i++) out.push(m.keyTime(i));
        } catch (_) {}
        for (li = 1; li <= comp.numLayers; li++) {
            L = comp.layer(li);
            if (L === except) continue;
            try {
                m = L.property("ADBE Marker");
                for (i = 1; i <= m.numKeys; i++) out.push(m.keyTime(i));
            } catch (_) {}
        }
        return out;
    }

    function nearestBetween(times, lo, hi, want) {
        var best = null, i;
        for (i = 0; i < times.length; i++) {
            if (times[i] <= lo || times[i] >= hi) continue;
            if (best === null || Math.abs(times[i] - want) < Math.abs(best - want)) best = times[i];
        }
        return best;
    }

    function applySpeedToLayer(comp, L, pts, opts) {
        var start = L.inPoint, span = L.outPoint - L.inPoint, s0, s1, plan, tr, i, n, kt, keep = [], beat = null;
        var use = pts, times, guess, u, ours, e, slow = slowestPoint(pts), beatNote = "";
        if (!(span > 0)) throw new Error("it has no length");
        s0 = sourceTime(L, start);
        s1 = sourceTime(L, L.outPoint);
        if (!(s1 > s0)) throw new Error("it already plays backwards or stands still");
        plan = speedPlan(use, span, s1 - s0, opts.keepFrames);

        if (opts.onBeat && plan && (slow === 0 || slow === pts.length - 1)) beatNote = "noslow";
        else if (opts.onBeat && plan) {

            times = markerTimes(comp, L);
            for (i = 0; i < 4; i++) {
                guess = start + plan.knots[slowestPoint(use)].t;
                beat = nearestBetween(times, start, start + plan.span, guess);
                if (beat === null) break;
                u = (beat - start) / plan.span;
                if (u < 0.03 || u > 0.97) {
                    beat = null;
                    break;
                }
                use = shiftSlowTo(pts, u);
                plan = speedPlan(use, span, s1 - s0, opts.keepFrames);
            }
        }
        if (!plan) throw new Error("the curve has no speed");

        var kts = [], kvs = [], kin = [], kout = [], ez, x1, x2, T, avg;
        if (opts.ease && use === pts) {
            ez = opts.ease.ease;
            T = opts.keepFrames ? (s1 - s0) / opts.ease.avg : span;
            avg = (s1 - s0) / T;
            x1 = clamp(ez[0], MIN_X, 1);
            x2 = clamp(ez[2], 0, 1 - MIN_X);
            kts = [0, T];
            kvs = [s0, s1];
            kout = [[ez[1] / x1 * avg, x1 * 100], [0, 100 / 3]];
            kin = [[ez[1] / x1 * avg, 100 / 3], [(1 - ez[3]) / (1 - x2) * avg, (1 - x2) * 100]];
            plan = { span: T, factor: avg / opts.ease.avg, knots: plan.knots };
        } else {
            for (i = 0; i < plan.knots.length; i++) {
                kts.push(plan.knots[i].t);
                kvs.push(s0 + plan.knots[i].s);
                kin.push([plan.knots[i].v, 100 / 3]);
                kout.push([plan.knots[i].v, 100 / 3]);
            }
        }

        if (!L.timeRemapEnabled) L.timeRemapEnabled = true;
        tr = L.property("ADBE Time Remapping");
        for (i = 0; i < kts.length; i++) {
            tr.setValueAtTime(start + kts[i], kvs[i]);
            keep.push(start + kts[i]);
        }
        for (n = tr.numKeys; n >= 1; n--) {
            kt = tr.keyTime(n);
            ours = false;
            for (i = 0; i < keep.length; i++) if (Math.abs(kt - keep[i]) < 1e-4) ours = true;
            if (!ours) tr.removeKey(n);
        }
        for (i = 1; i <= tr.numKeys; i++) {
            tr.setInterpolationTypeAtKey(i, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
            try { tr.setTemporalAutoBezierAtKey(i, false); } catch (_) {}
            try { tr.setTemporalContinuousAtKey(i, false); } catch (_) {}
            tr.setTemporalEaseAtKey(i, [new KeyframeEase(kin[i - 1][0], kin[i - 1][1])],
                                       [new KeyframeEase(kout[i - 1][0], kout[i - 1][1])]);
        }

        L.outPoint = opts.keepFrames ? start + plan.span : start + span;
        if (Math.abs(L.inPoint - start) > 1e-6) L.inPoint = start;
        if (opts.smoothFrames) {
            L.frameBlendingType = FrameBlendingType.PIXEL_MOTION;
            comp.frameBlending = true;
        }
        if (opts.onBeat && !beatNote && beat === null) beatNote = "nomarker";
        return { span: plan.span, factor: plan.factor, beat: beat, beatNote: beatNote };
    }

    function applySpeed(comp, pts, opts, name) {
        var pick = speedLayers(comp), res = { done: 0, skipped: pick.skipped, failed: [], beats: 0, noMarker: 0, noSlow: 0, factor: 1 }, i, r;
        if (!pick.layers.length) return res;
        app.beginUndoGroup(APP_NAME + " - Speed: " + name);
        try {
            for (i = 0; i < pick.layers.length; i++) {
                try {
                    r = applySpeedToLayer(comp, pick.layers[i], pts, opts);
                    res.done++;
                    res.factor = r.factor;
                    if (r.beat !== null) res.beats++;
                    if (r.beatNote === "nomarker") res.noMarker++;
                    if (r.beatNote === "noslow") res.noSlow++;
                } catch (e) {
                    res.failed.push(pick.layers[i].name + ": " + errorText(e));
                }
            }
        } finally {
            app.endUndoGroup();
        }
        return res;
    }

    function readSpeed(comp) {
        var sel = comp.selectedLayers, L, tr, times = [], speeds = [], i, t0, t1, pts = [];
        if (!sel.length) return { problem: "none" };
        L = sel[0];
        if (!L.timeRemapEnabled) return { problem: "noremap", layer: L };
        tr = L.property("ADBE Time Remapping");
        for (i = 1; i <= tr.numKeys; i++) {
            if (tr.keyTime(i) < L.inPoint - 1e-4 || tr.keyTime(i) > L.outPoint + 1e-4) continue;
            times.push(tr.keyTime(i));
            speeds.push(i < tr.numKeys ? tr.keyOutTemporalEase(i)[0].speed : tr.keyInTemporalEase(i)[0].speed);
        }
        if (times.length < 2) return { problem: "few", layer: L };
        if (times.length > SPEED_POINTS_MAX) return { problem: "many", layer: L };
        t0 = times[0];
        t1 = times[times.length - 1];
        for (i = 0; i < times.length; i++) {
            pts.push([(times[i] - t0) / (t1 - t0), clamp(Math.abs(speeds[i]), SPEED_MIN, SPEED_MAX)]);
        }
        return { points: pts, layer: L };
    }

    function loadSpeedCustom() {
        var out = [], i, s, bar, p;
        for (i = 0; i < CUSTOM_SLOTS; i++) {
            s = String(readSetting("speedCustom" + i, ""));
            bar = s.lastIndexOf("|");
            p = bar > 0 ? parsePoints(s.substring(bar + 1)) : null;
            out.push(p ? { name: s.substring(0, bar), points: p } : null);
        }
        return out;
    }

    function saveSpeedCustom(custom, i) {
        var c = custom[i];
        saveSetting("speedCustom" + i, c ? c.name + "|" + pointsText(c.points) : "");
    }
