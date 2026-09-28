/* GlydeFX - Copyright (C) 2026 Amirhossein Asadi - SPDX-License-Identifier: GPL-3.0-or-later (see LICENSE) */
    /* ------------------------------------------------------------------ */
    /*  Admiral theme                                                      */
    /* ------------------------------------------------------------------ */

    function rgb(hex) {
        return [parseInt(hex.substring(1, 3), 16) / 255,
                parseInt(hex.substring(3, 5), 16) / 255,
                parseInt(hex.substring(5, 7), 16) / 255];
    }

    var T = {
        bg:      rgb("#0B1220"),
        well:    rgb("#070D18"),
        gold:    rgb("#D4A849"),
        goldHi:  rgb("#F6DE9A"),
        goldLo:  rgb("#B0822D"),
        curve:   rgb("#E2C275"),
        text:    rgb("#E6E9EF"),
        dim:     rgb("#8E98AB"),
        handle:  rgb("#8FB0E0"),
        ink:     rgb("#1B1407"),
        edge:    rgb("#AAC3EB")
    };
    var WHITE = [1, 1, 1];

    function rgba(c, a) { return [c[0], c[1], c[2], a === undefined ? 1 : a]; }

    function mix(a, b, f) {
        return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
    }

    function fillRect(g, x, y, w, h, c, a) {
        if (w <= 0 || h <= 0) return;
        g.newPath();
        g.rectPath(x, y, w, h);
        g.fillPath(g.newBrush(g.BrushType.SOLID_COLOR, rgba(c, a)));
    }

    function strokeRect(g, x, y, w, h, c, a) {
        g.newPath();
        g.rectPath(x, y, w, h);
        g.strokePath(g.newPen(g.PenType.SOLID_COLOR, rgba(c, a), 1));
    }

    function strokeLine(g, pts, c, a, width) {
        var i;
        g.newPath();
        g.moveTo(pts[0][0], pts[0][1]);
        for (i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
        g.strokePath(g.newPen(g.PenType.SOLID_COLOR, rgba(c, a), width));
    }

    function fillCircle(g, x, y, r, c, a) {
        g.newPath();
        g.ellipsePath(x - r, y - r, 2 * r, 2 * r);
        g.fillPath(g.newBrush(g.BrushType.SOLID_COLOR, rgba(c, a)));
    }

    function strokeCircle(g, x, y, r, c, a, width) {
        g.newPath();
        g.ellipsePath(x - r, y - r, 2 * r, 2 * r);
        g.strokePath(g.newPen(g.PenType.SOLID_COLOR, rgba(c, a), width));
    }

    function goldRamp(g, x, y, w, h, lift) {
        var i, f, c;
        for (i = 0; i < h; i++) {
            f = h > 1 ? i / (h - 1) : 0;
            c = f < 0.5 ? mix(T.goldHi, T.gold, f * 2) : mix(T.gold, T.goldLo, (f - 0.5) * 2);
            if (lift) c = mix(c, lift > 0 ? [1, 1, 1] : [0, 0, 0], Math.abs(lift));
            fillRect(g, x, y + i, w, 1, c, 1);
        }
    }

    function fadeLine(g, x, y, w, fadeRight) {
        var steps = 24, i, sw, f;
        if (w <= 0) return;
        sw = w / steps;
        for (i = 0; i < steps; i++) {
            f = (i + 1) / steps;
            fillRect(g, x + i * sw, y, sw + 0.5, 1, T.gold, 0.6 * (fadeRight ? (1 - f + 1 / steps) : f));
        }
    }

    function topOf(ctrl) {
        var c = ctrl;
        while (c.parent) c = c.parent;
        return c;
    }

    function drawGlass(g, ctrl) {
        var top = topOf(ctrl), a = IMG.glass, x = 0, y = 0, c = ctrl;
        if (a) {
            while (c && c !== top) { x += c.location[0]; y += c.location[1]; c = c.parent; }
            try {
                g.drawImage(a.img, -x, -y, top.size.width, top.size.height);
                return;
            } catch (_) {}
        }
        fillRect(g, 0, 0, ctrl.size.width, ctrl.size.height, T.bg, 1);
    }

    function drawPane(g, ctrl, w, h, lift) {
        drawGlass(g, ctrl);
        fillRect(g, 0, 0, w, h, WHITE, 0.045 + (lift || 0));
        fillRect(g, 0, 0, w, Math.round(h / 2), WHITE, 0.02);
        fillRect(g, 1, 1, w - 2, 1, WHITE, 0.07);
        strokeRect(g, 0.5, 0.5, w - 1, h - 1, T.edge, 0.17);
    }

    function glassBody(win, margins, spacing) {
        win.orientation = "stack";
        win.alignChildren = ["fill", "fill"];
        win.margins = 0;
        win.spacing = 0;
        var sheet = win.add("panel");
        sheet.alignment = ["fill", "fill"];
        sheet.onDraw = function () {
            var g = this.graphics, w = this.size.width, h = this.size.height;
            drawGlass(g, this);
            fillRect(g, 0, 0, w, 1, WHITE, 0.16);
            strokeRect(g, 0.5, 0.5, w - 1, h - 1, T.edge, 0.30);
        };
        var body = win.add("group");
        body.alignment = ["fill", "fill"];
        body.orientation = "column";
        body.alignChildren = ["fill", "top"];
        body.margins = margins;
        body.spacing = spacing;
        return body;
    }

    function paintText(ctrl, c) {
        try {
            ctrl.graphics.foregroundColor =
                ctrl.graphics.newPen(ctrl.graphics.PenType.SOLID_COLOR, rgba(c, 1), 1);
        } catch (_) {}
    }

    function setFont(ctrl, font) {
        if (!font) return;
        try { ctrl.graphics.font = font; } catch (_) {}
    }

    function makeFont(style, size) {
        try { return ScriptUI.newFont("dialog", style, size); } catch (_) { return null; }
    }

    function fixed(ctrl, w) {
        ctrl.preferredSize.width = w;
        ctrl.maximumSize.width = w;
        ctrl.minimumSize.width = w;
    }

    function flex(ctrl) {
        var inColumn = false;
        try { inColumn = (ctrl.parent.orientation === "column"); } catch (_) {}
        ctrl.alignment = ["fill", inColumn ? "top" : "center"];
        ctrl.minimumSize.width = 10;
    }

    function redraw(ctrl) {
        try {
            ctrl.visible = false;
            ctrl.visible = true;
        } catch (_) {}
    }

    function selIndex(dd) { return dd.selection ? dd.selection.index : 0; }

    function fitText(ctrl, text) {
        var s = String(text), w, g, n;
        try {
            g = ctrl.graphics;
            w = ctrl.size.width - 2;
            if (!(w > 0) || g.measureString(s, g.font)[0] <= w) return s;
            for (n = s.length - 1; n > 1; n--) {
                if (g.measureString(s.substring(0, n) + "...", g.font)[0] <= w) return s.substring(0, n) + "...";
            }
            return s.substring(0, 1) + "...";
        } catch (_) {
            return s.length > 14 ? s.substring(0, 13) + "..." : s;
        }
    }

    /* ------------------------------------------------------------------ */
    /*  Artwork                                                            */
    /* ------------------------------------------------------------------ */

    var IMG = {};

    function imageFromTempFile(key, bin) {
        var f;
        try {
            f = new File(Folder.temp.fsName + "/AdmiralGlydeFx_" + VERSION + "_" + key + ".png");
            if (!f.exists) {
                f.encoding = "BINARY";
                if (!f.open("w")) return null;
                f.write(bin);
                f.close();
            }
            return ScriptUI.newImage(f);
        } catch (_) {
            return null;
        }
    }

    function loadImages() {
        var assets = admiralAssets(), key, img;
        for (key in assets) {
            if (!assets.hasOwnProperty(key)) continue;
            img = null;
            try { img = ScriptUI.newImage(assets[key].png); } catch (_) { img = null; }
            if (!img) img = imageFromTempFile(key, assets[key].png);
            IMG[key] = img ? { img: img, w: assets[key].w, h: assets[key].h } : null;
        }
    }

    function pickImage(key, room) {
        var names = [key, key + "_m", key + "_s"], i, a, last = null;
        for (i = 0; i < names.length; i++) {
            a = IMG[names[i]];
            if (!a) continue;
            if (a.w <= room) return a;
            last = a;
        }
        return last;
    }

    function drawImageFit(g, key, w, h, pad) {
        var a = pickImage(key, w - 2 * pad);
        if (!a) return false;
        try {
            g.drawImage(a.img, Math.round((w - a.w) / 2), Math.round((h - a.h) / 2));
            return true;
        } catch (_) {
            return false;
        }
    }

    function drawFallbackText(g, text, c, h) {
        try {
            g.drawString(text, g.newPen(g.PenType.SOLID_COLOR, rgba(c, 1), 1),
                         8, Math.max(0, Math.floor((h - 16) / 2)));
        } catch (_) {}
    }

    /* ------------------------------------------------------------------ */
    /*  Drawing curves                                                     */
    /* ------------------------------------------------------------------ */

    function curvePoints(p, map, steps) {
        var pts = [], i, s;
        for (i = 0; i <= steps; i++) {
            s = i / steps;
            pts.push(map(bez(p[0], p[2], s), bez(p[1], p[3], s)));
        }
        return pts;
    }

    function drawThumb(g, w, h, p, strong) {
        var r = curveRange(p), lo = Math.min(0, r.lo), hi = Math.max(1, r.hi), px = 9, py = 6;
        var bw = w - 2 * px, bh = h - 2 * py;
        function map(u, v) { return [px + u * bw, py + (hi - v) / (hi - lo) * bh]; }
        var a = map(0, 0), b = map(1, 1);
        strokeLine(g, [[a[0], a[1]], [b[0], a[1]]], T.edge, 0.18, 1);
        strokeLine(g, [[a[0], b[1]], [b[0], b[1]]], T.edge, 0.18, 1);
        strokeLine(g, curvePoints(p, map, 24), T.curve, strong ? 1 : 0.85, strong ? 2 : 1.5);
    }

    function speedFrac(v) {
        var hi = Math.log(SPEED_MAX), lo = Math.log(SPEED_MIN);
        return (hi - Math.log(clamp(v, SPEED_MIN, SPEED_MAX))) / (hi - lo);
    }

    function speedLine(pts, map) {
        var out = [], i, j, u, v;
        for (i = 1; i < pts.length; i++) {
            for (j = (i === 1 ? 0 : 1); j <= 10; j++) {
                u = pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * j / 10;
                v = pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * j / 10;
                out.push(map(u, v));
            }
        }
        return out;
    }

    function drawSpeedThumb(g, w, h, pts, strong) {
        var px = 7, py = 5, bw = w - 2 * px, bh = h - 2 * py, one, lo = 0.5, hi = 2, i, a, b;
        for (i = 0; i < pts.length; i++) {
            if (pts[i][1] < lo) lo = pts[i][1];
            if (pts[i][1] > hi) hi = pts[i][1];
        }
        a = Math.log(hi * 1.15);
        b = Math.log(lo / 1.15);
        function map(u, v) { return [px + u * bw, py + (a - Math.log(v)) / (a - b) * bh]; }
        one = map(0, 1)[1];
        strokeLine(g, [[px, one], [px + bw, one]], T.edge, 0.3, 1);
        strokeLine(g, speedLine(pts, map), T.curve, strong ? 1 : 0.85, strong ? 2 : 1.5);
    }

    /* ------------------------------------------------------------------ */
    /*  Tooltips and help                                                  */
    /* ------------------------------------------------------------------ */

    var TIP = {
        editor: "The curve: time runs left to right, the motion bottom to top.\n" +
                "Drag the two round handles to shape it. Above or below the\n" +
                "square, the motion goes past its end or pulls back first.",
        curve: "The curve as four numbers: x1, y1, x2, y2 - the same as CSS\n" +
               "cubic-bezier. Type or paste values here, for example from easings.net,\n" +
               "and press Enter.",
        category: "Which presets to show.\n" +
                  "Essentials: the everyday curves.\n" +
                  "Classic In / Out / In Out: the standard easing families.\n" +
                  "Edit: curves named after what edits use them for.\n" +
                  "My Presets: the curves you saved.",
        apply: "Writes the curve between every two neighbouring selected keyframes -\n" +
               "any layers, any properties. " + UNDO_KEYS + " undoes it in one step.",
        read: "Loads the curve of the selected keyframes into the editor,\n" +
              "so you can change it, save it or apply it elsewhere.",
        save: "Keeps the editor's curve in My Presets, under a name you choose.",
        remove: "Removes the selected preset from My Presets.",
        help: "A short guide to this panel.",
        tabKeys: "Keyframes: easing curves for any keyframes.",
        tabSpeed: "Speed: speed ramps for video clips, with Time Remap.",
        speedEditor: "The clip's speed over its length: left is its first frame, right its last.\n" +
                     "The bright line is normal speed (1x); up is faster, down is slower.\n" +
                     "Drag the points. Double-click the curve to add a point,\n" +
                     "double-click a point to remove it.",
        length: "Keep clip length: the clip keeps its place and length in the timeline;\n" +
                "its speeds are scaled so it still shows the same part of the footage.\n" +
                "Keep all frames: the speeds are used as drawn, and the clip gets\n" +
                "longer or shorter.",
        fitNote: "For a clip at normal speed: how much the speeds are scaled (Keep clip\n" +
                 "length) or how much the clip's length changes (Keep all frames).",
        onBeat: "Moves the curve so the slow motion starts on the nearest beat marker\n" +
                "inside the clip - markers on the composition or on any layer, such as\n" +
                "the ones BeatDrop adds.",
        smooth: "Turns on Pixel Motion frame blending for the layer (and frame blending\n" +
                "for the composition), so slow motion looks smooth. Renders take longer.",
        speedCategory: "Which presets to show.\n" +
                       "Popular: the speed curves edit makers know.\n" +
                       "Basic: simple ramps and fixed speeds.\n" +
                       "My Presets: the speed curves you saved.",
        applySpeed: "Writes the speed curve onto every selected video or precomp layer,\n" +
                    "with Time Remap. " + UNDO_KEYS + " undoes it in one step.",
        readSpeed: "Loads the speed curve of the selected layer's Time Remap into the editor.",
        saveSpeed: "Keeps the editor's speed curve in My Presets, under a name you choose."
    };

    var HELP_TEXT =
        "HOW TO USE\n\n" +
        "1.  Select two or more keyframes next to each other in the timeline\n" +
        "     (any layers, any properties).\n" +
        "2.  Pick a curve: click a preset, or drag the handles in the editor.\n" +
        "3.  Click Apply to Keyframes.\n\n" +
        "MORE\n\n" +
        "Read from Keys loads the curve of the selected keyframes.\n" +
        "Save Preset keeps the editor's curve in My Presets (8 places).\n" +
        "The four numbers are the curve as x1, y1, x2, y2, like CSS cubic-bezier;\n" +
        "paste values from a website there and press Enter.\n" +
        "A handle above or below the square makes the motion overshoot.\n" +
        "Position, paths and colors cannot overshoot: After Effects stops them\n" +
        "at their keyframes. For Position, right-click Position > Separate Dimensions\n" +
        "first, then apply the curve to X and Y.\n\n" +
        UNDO_KEYS + " undoes an Apply in one step.\n" +
        "Hover over anything to see what it does.\n\n" +
        "made by Admiral";

    var HELP_SPEED =
        "SPEED RAMPS\n\n" +
        "1.  Select one or more video or precomp layers.\n" +
        "2.  Pick a speed curve: click a preset, or drag the points in the editor.\n" +
        "3.  Click Apply to Layer.\n\n" +
        "MORE\n\n" +
        "Up is faster, down is slower; the bright line is normal speed.\n" +
        "Double-click the curve to add a point, a point to remove it.\n" +
        "Keep clip length: the clip keeps its length and shows the same part;\n" +
        "its speeds are scaled to fit.  Keep all frames: the speeds stay as drawn\n" +
        "and the clip gets longer or shorter.\n" +
        "Slow-mo on beat starts the slow motion on the nearest beat marker\n" +
        "inside the clip (BeatDrop can add the markers).\n" +
        "Smooth frames turns on Pixel Motion for smoother slow motion.\n" +
        "Read from Layer loads a layer's speed curve back into the editor.\n\n" +
        UNDO_KEYS + " undoes an Apply in one step.\n\n" +
        "made by Admiral";

    /* ------------------------------------------------------------------ */
    /*  UI construction                                                    */
    /* ------------------------------------------------------------------ */

    function buildUI(host) {
        var root = (host instanceof Panel)
            ? host
            : new Window("palette", APP_NAME + " " + VERSION, undefined, { resizeable: true });
        if (!root) return null;

        loadImages();
        var body = glassBody(root, [10, 6, 10, 6], 6);
        var FONT_SMALL = makeFont("REGULAR", 11);

        var tab = readIndex("tab", 0, 2);

        var custom = loadCustom();
        var cat = readIndex("category", 0, CATEGORIES.length);
        var P = parseCurve(readSetting("curve", "")) || ESSENTIALS[5][1].slice();
        var curveName = String(readSetting("curveName", "Smooth"));

        var spCustom = loadSpeedCustom();
        var spCat = readIndex("speedCategory", 0, SPEED_CATEGORIES.length);
        var SP = parsePoints(readSetting("speedCurve", "")) || copyPoints(SPEED_POPULAR[6][1]);
        var speedName = String(readSetting("speedName", "Velocity"));

        var SPE = parseEase(readSetting("speedEase", ""));
        if (SPE && !samePoints(SP, easePoints(SPE))) SPE = null;
        var lengthMode = readIndex("lengthMode", 0, LENGTH_ITEMS.length);

        var shown = [];
        var picked = -1;

        function addRow(parent) {
            var g = parent.add("group");
            g.orientation = "row";
            g.alignChildren = ["left", "center"];
            g.spacing = 6;
            g.margins = 0;
            g.minimumSize.width = 10;
            return g;
        }

        function addColumn(parent) {
            var g = parent.add("group");
            g.orientation = "column";
            g.alignChildren = ["fill", "top"];
            g.alignment = ["fill", "top"];
            g.spacing = 6;
            g.margins = 0;
            g.minimumSize.width = 10;
            return g;
        }

        function addCard(parent) {
            var s = parent.add("group");
            s.orientation = "stack";
            s.alignChildren = ["fill", "fill"];
            s.alignment = ["fill", "top"];
            s.minimumSize.width = 10;
            var pane = s.add("panel");
            pane.alignment = ["fill", "fill"];
            pane.onDraw = function () {
                drawPane(this.graphics, this, this.size.width, this.size.height, 0);
            };
            var c = s.add("group");
            c.alignment = ["fill", "fill"];
            c.orientation = "column";
            c.alignChildren = ["fill", "top"];
            c.spacing = 6;
            c.margins = [10, 10, 10, 10];
            c.minimumSize.width = 10;
            return c;
        }

        function addText(parent, text, c, font) {
            var t = parent.add("statictext", undefined, text);
            flex(t);
            setFont(t, font);
            paintText(t, c);
            return t;
        }

        function addCheck(parent, label, value, tip) {
            var c = parent.add("checkbox", undefined, label);
            c.value = value;
            c.helpTip = tip;
            paintText(c, T.text);
            return c;
        }

        function setShown(ctrl, show) {
            ctrl.visible = show;
            ctrl.maximumSize.height = show ? 10000 : 0;
        }

        function addImageButton(parent, key, label, kind, tip) {
            var b = parent.add("button", undefined, label);
            b.__key = key;
            b.__kind = kind;
            b.helpTip = tip;
            b.minimumSize.width = 10;
            b.preferredSize.height = (kind === "primary") ? 40 : 30;
            b.onDraw = function (state) {
                var g = this.graphics, w = this.size.width, h = this.size.height;
                var hover = false, down = false, primary = (this.__kind === "primary");
                try { hover = !!state.mouseOver; down = !!state.leftButtonPressed; } catch (_) {}
                if (primary) {
                    goldRamp(g, 0, 0, w, h, !this.enabled ? -0.2 : (down ? -0.12 : (hover ? 0.1 : 0)));
                    strokeRect(g, 0.5, 0.5, w - 1, h - 1, T.goldHi, 0.8);
                } else {
                    drawGlass(g, this);
                    fillRect(g, 0, 0, w, h, WHITE, (hover && this.enabled) ? 0.075 : 0.035);
                    fillRect(g, 1, 1, w - 2, 1, WHITE, 0.07);
                    strokeRect(g, 0.5, 0.5, w - 1, h - 1, T.edge, 0.22);
                }
                if (!drawImageFit(g, this.__key, w, h, 6)) {
                    drawFallbackText(g, this.text, primary ? T.ink : T.text, h);
                }
                if (!this.enabled && !primary) fillRect(g, 0, 0, w, h, T.bg, 0.45);
            };
            return b;
        }

        var header = addRow(body);
        header.margins = [0, 2, 0, 0];
        var logoArea = header.add("panel");
        flex(logoArea);

        logoArea.preferredSize = [IMG.logo_s ? IMG.logo_s.w : 100, IMG.logo ? IMG.logo.h + 2 : 24];
        logoArea.minimumSize.width = 80;
        logoArea.helpTip = APP_NAME + " " + VERSION + "  -  made by Admiral";

        logoArea.onDraw = function () {
            var g = this.graphics, w = this.size.width, h = this.size.height, a = pickImage("logo", w);
            drawGlass(g, this);
            if (!a) { drawFallbackText(g, APP_NAME, T.gold, h); return; }
            try {
                g.drawImage(a.img, 0, Math.round((h - a.h) / 2));
            } catch (_) {
                drawFallbackText(g, APP_NAME, T.gold, h);
            }
        };
        var versionText = header.add("statictext", undefined, "v" + VERSION);
        versionText.alignment = ["right", "bottom"];
        paintText(versionText, T.dim);

        var tabRow = addRow(body);
        tabRow.alignChildren = ["fill", "center"];
        tabRow.spacing = 4;

        function addTab(index, key, label, tip) {
            var b = tabRow.add("button", undefined, label);
            flex(b);
            b.preferredSize = [60, 28];
            b.helpTip = tip;
            b.onDraw = function (state) {
                var g = this.graphics, w = this.size.width, h = this.size.height, hov = false, on = (tab === index);
                try { hov = !!state.mouseOver; } catch (_) {}
                drawGlass(g, this);
                fillRect(g, 0, 0, w, h, WHITE, on ? 0.075 : (hov ? 0.05 : 0.02));
                strokeRect(g, 0.5, 0.5, w - 1, h - 1, T.edge, on ? 0.28 : 0.14);
                if (on) fillRect(g, 1, h - 3, w - 2, 2, T.gold, 1);
                if (!drawImageFit(g, on ? key + "_on" : key, w, h, 4)) drawFallbackText(g, this.text, on ? T.gold : T.dim, h);
            };
            b.onClick = function () { switchTab(index); };
            return b;
        }
        var tabKeys = addTab(0, "tab_keys", "Keyframes", TIP.tabKeys);
        var tabSpeed = addTab(1, "tab_speed", "Speed", TIP.tabSpeed);

        var ED_MIN = 110, ED_MAX = 400;
        var edCard = addCard(body);
        var kfBox = addColumn(edCard);
        var spBox = addColumn(edCard);

        var ed = kfBox.add("panel");
        ed.alignment = ["fill", "top"];
        ed.minimumSize.width = 10;
        ed.preferredSize = [200, 130];
        ed.helpTip = TIP.editor;

        var MX = 18, MY = 12, GRAB = 14;
        var view = viewFor(P), drag = -1, hover = -1;

        function viewFor(p) {
            var lo = Math.min(0, p[1], p[3]), hi = Math.max(1, p[1], p[3]), m = 0.06 * (hi - lo) + 0.06;
            return { lo: lo - m, hi: hi + m };
        }

        function toPx(u, v) {
            var W = ed.size.width, H = ed.size.height;
            return [MX + u * (W - 2 * MX), MY + (view.hi - v) / (view.hi - view.lo) * (H - 2 * MY)];
        }

        function fromPx(x, y) {
            var W = ed.size.width, H = ed.size.height;
            return [(x - MX) / (W - 2 * MX), view.hi - (y - MY) / (H - 2 * MY) * (view.hi - view.lo)];
        }

        ed.onDraw = function () {
            var g = this.graphics, W = this.size.width, H = this.size.height, i, o, e, h1, h2, x, y, which;
            drawGlass(g, this);
            fillRect(g, 0, 0, W, H, T.well, 0.45);
            strokeRect(g, 0.5, 0.5, W - 1, H - 1, T.edge, 0.20);
            o = toPx(0, 0);
            e = toPx(1, 1);

            fillRect(g, o[0], MY, e[0] - o[0], H - 2 * MY, WHITE, 0.035);
            for (i = 1; i < 4; i++) {
                x = o[0] + (e[0] - o[0]) * i / 4;
                strokeLine(g, [[x, MY], [x, H - MY]], T.edge, 0.08, 1);
            }
            for (i = Math.ceil(view.lo * 4); i <= Math.floor(view.hi * 4); i++) {
                if (i === 0 || i === 4) continue;
                y = toPx(0, i / 4)[1];
                strokeLine(g, [[o[0], y], [e[0], y]], T.edge, 0.08, 1);
            }
            strokeRect(g, o[0] + 0.5, MY + 0.5, e[0] - o[0], H - 2 * MY, T.edge, 0.22);
            strokeLine(g, [[o[0], o[1]], [e[0], o[1]]], T.edge, 0.3, 1);
            strokeLine(g, [[o[0], e[1]], [e[0], e[1]]], T.edge, 0.3, 1);
            strokeLine(g, [o, e], T.edge, 0.12, 1);

            h1 = toPx(P[0], P[1]);
            h2 = toPx(P[2], P[3]);
            strokeLine(g, [o, h1], T.handle, 0.9, 1.5);
            strokeLine(g, [e, h2], T.handle, 0.9, 1.5);
            strokeLine(g, curvePoints(P, toPx, 60), T.curve, 1, 3);
            fillCircle(g, o[0], o[1], 4, T.curve, 1);
            fillCircle(g, e[0], e[1], 4, T.curve, 1);
            for (i = 0; i < 2; i++) {
                which = i ? h2 : h1;
                fillCircle(g, which[0], which[1], 6, T.bg, 1);
                strokeCircle(g, which[0], which[1], 6, (drag === i || hover === i) ? T.curve : [0.87, 0.9, 0.95], 1, 2);
            }
        };

        function nearestHandle(x, y) {
            var h1 = toPx(P[0], P[1]), h2 = toPx(P[2], P[3]);
            var d1 = Math.pow(x - h1[0], 2) + Math.pow(y - h1[1], 2);
            var d2 = Math.pow(x - h2[0], 2) + Math.pow(y - h2[1], 2);
            if (Math.min(d1, d2) > GRAB * GRAB) return -1;
            return d1 <= d2 ? 0 : 1;
        }

        function buttonUp(ev) {
            return ev.type === "mousemove" && ev.button !== 0;
        }

        function onEditorMouse(ev) {
            var x = ev.clientX, y = ev.clientY, q, h;
            if (drag >= 0 && buttonUp(ev)) {
                drag = -1;
                curveChanged();
                return;
            }
            if (ev.type === "mousedown") {
                drag = nearestHandle(x, y);
                if (drag >= 0) redraw(ed);
            } else if (ev.type === "mousemove") {
                if (drag >= 0) {
                    q = fromPx(x, y);
                    P[drag * 2] = clamp(q[0], 0, 1);
                    P[drag * 2 + 1] = clamp(q[1], Math.max(Y_LIMIT[0], view.lo), Math.min(Y_LIMIT[1], view.hi));
                    curveEdit.text = curveText(P);
                    redraw(ed);
                } else {
                    h = nearestHandle(x, y);
                    if (h !== hover) {
                        hover = h;
                        redraw(ed);
                    }
                }
            } else if (ev.type === "mouseup") {
                if (drag >= 0) {
                    drag = -1;
                    curveChanged();
                }
            }
        }
        ed.addEventListener("mousedown", onEditorMouse);
        ed.addEventListener("mousemove", onEditorMouse);
        ed.addEventListener("mouseup", onEditorMouse);
        ed.addEventListener("mouseout", function () {
            if (hover >= 0 && drag < 0) {
                hover = -1;
                redraw(ed);
            }
        });

        var curveRow = addRow(kfBox);
        var curveCap = curveRow.add("statictext", undefined, "Curve");
        fixed(curveCap, 40);
        curveCap.helpTip = TIP.curve;
        paintText(curveCap, T.dim);
        var curveEdit = curveRow.add("edittext", undefined, curveText(P));
        flex(curveEdit);
        curveEdit.preferredSize.width = 60;
        curveEdit.helpTip = TIP.curve;

        var sed = spBox.add("panel");
        sed.alignment = ["fill", "top"];
        sed.minimumSize.width = 10;
        sed.preferredSize = [200, 130];
        sed.helpTip = TIP.speedEditor;
        var SX = 36, SXR = 12, SY = 10;
        var sdrag = -1, shover = -1, lastDown = { time: 0, x: -99, y: -99 };
        var SCALE = [[4, "lbl_4"], [2, "lbl_2"], [1, "lbl_1"], [0.5, "lbl_05"], [0.25, "lbl_025"], [0.1, "lbl_01"]];

        function spPx(u, v) {
            var W = sed.size.width, H = sed.size.height;
            return [SX + u * (W - SX - SXR), SY + speedFrac(v) * (H - 2 * SY)];
        }

        function spFromPx(x, y) {
            var W = sed.size.width, H = sed.size.height, f = (y - SY) / (H - 2 * SY);
            var lv = Math.log(SPEED_MAX) - f * (Math.log(SPEED_MAX) - Math.log(SPEED_MIN));
            return [(x - SX) / (W - SX - SXR), clamp(Math.exp(lv), SPEED_MIN, SPEED_MAX)];
        }

        sed.onDraw = function () {
            var g = this.graphics, W = this.size.width, H = this.size.height, i, a, b, y, x, line, poly, p, lab;
            drawGlass(g, this);
            fillRect(g, 0, 0, W, H, T.well, 0.45);
            strokeRect(g, 0.5, 0.5, W - 1, H - 1, T.edge, 0.20);
            a = spPx(0, SPEED_MAX);
            b = spPx(1, SPEED_MIN);
            fillRect(g, a[0], a[1], b[0] - a[0], b[1] - a[1], WHITE, 0.035);
            for (i = 1; i < 4; i++) {
                x = a[0] + (b[0] - a[0]) * i / 4;
                strokeLine(g, [[x, a[1]], [x, b[1]]], T.edge, 0.08, 1);
            }

            var lastY = -99, keep;
            for (i = 0; i < SCALE.length; i++) {
                y = spPx(0, SCALE[i][0])[1];
                strokeLine(g, [[a[0], y], [b[0], y]], T.edge, SCALE[i][0] === 1 ? 0.35 : 0.08, 1);
                lab = IMG[SCALE[i][1]];
                keep = (SCALE[i][0] === 1) || (y - lastY >= 12 && Math.abs(y - spPx(0, 1)[1]) >= 12);
                if (lab && keep) {
                    try { g.drawImage(lab.img, a[0] - lab.w - 5, Math.round(y - lab.h / 2)); } catch (_) {}
                    lastY = y;
                }
            }
            strokeRect(g, a[0] + 0.5, a[1] + 0.5, b[0] - a[0], b[1] - a[1], T.edge, 0.22);
            line = speedLine(SP, spPx);

            poly = [[line[0][0], b[1]]].concat(line).concat([[line[line.length - 1][0], b[1]]]);
            g.newPath();
            g.moveTo(poly[0][0], poly[0][1]);
            for (i = 1; i < poly.length; i++) g.lineTo(poly[i][0], poly[i][1]);
            g.closePath();
            g.fillPath(g.newBrush(g.BrushType.SOLID_COLOR, rgba(T.curve, 0.10)));
            strokeLine(g, line, T.curve, 1, 2.5);
            for (i = 0; i < SP.length; i++) {
                p = spPx(SP[i][0], SP[i][1]);
                fillCircle(g, p[0], p[1], 5, T.bg, 1);
                strokeCircle(g, p[0], p[1], 5, (sdrag === i || shover === i) ? T.curve : [0.87, 0.9, 0.95], 1, 2);
            }
        };

        function nearestPoint(x, y) {
            var best = -1, bd = GRAB * GRAB, i, p, d;
            for (i = 0; i < SP.length; i++) {
                p = spPx(SP[i][0], SP[i][1]);
                d = Math.pow(x - p[0], 2) + Math.pow(y - p[1], 2);
                if (d <= bd) { bd = d; best = i; }
            }
            return best;
        }

        function speedAt(u) {
            var i;
            for (i = 1; i < SP.length; i++) {
                if (u <= SP[i][0]) {
                    if (SP[i][0] - SP[i - 1][0] < 1e-9) return SP[i][1];
                    return SP[i - 1][1] + (SP[i][1] - SP[i - 1][1]) * (u - SP[i - 1][0]) / (SP[i][0] - SP[i - 1][0]);
                }
            }
            return SP[SP.length - 1][1];
        }

        function pointText(i) {
            return "Point " + (i + 1) + ": " + (Math.round(SP[i][1] * 100) / 100) + "x at " + Math.round(SP[i][0] * 100) + " %";
        }

        function isDoubleClick(x, y) {
            var now = new Date().getTime(), dbl = (now - lastDown.time < 400 && Math.abs(x - lastDown.x) < 6 && Math.abs(y - lastDown.y) < 6);
            lastDown = dbl ? { time: 0, x: -99, y: -99 } : { time: now, x: x, y: y };
            return dbl;
        }

        function onSpeedMouse(ev) {
            var x = ev.clientX, y = ev.clientY, q, h, i, u;
            if (sdrag >= 0 && buttonUp(ev)) {
                sdrag = -1;
                speedChanged();
                return;
            }
            if (ev.type === "mousedown") {
                h = nearestPoint(x, y);
                if (isDoubleClick(x, y)) {
                    if (h > 0 && h < SP.length - 1 && SP.length > 2) {
                        SP.splice(h, 1);
                        sdrag = -1;
                        speedChanged("Removed a point.");
                        return;
                    }
                    if (h < 0) {
                        u = clamp(spFromPx(x, y)[0], 0.01, 0.99);
                        if (SP.length >= SPEED_POINTS_MAX) {
                            setStatus("At most " + SPEED_POINTS_MAX + " points.", C_WARN);
                            return;
                        }
                        for (i = 1; i < SP.length && SP[i][0] < u; i++) {}
                        SP.splice(i, 0, [u, speedAt(u)]);
                        speedChanged("Added a point.");
                        return;
                    }
                }
                sdrag = h;
                if (sdrag >= 0) {
                    setStatus(pointText(sdrag), T.dim);
                    redraw(sed);
                }
            } else if (ev.type === "mousemove") {
                if (sdrag >= 0) {
                    q = spFromPx(x, y);
                    SP[sdrag][1] = q[1];
                    if (sdrag > 0 && sdrag < SP.length - 1) {
                        SP[sdrag][0] = clamp(q[0], SP[sdrag - 1][0] + 0.01, SP[sdrag + 1][0] - 0.01);
                    }
                    setStatus(pointText(sdrag), T.dim);
                    updateFitNote();
                    redraw(sed);
                } else {
                    h = nearestPoint(x, y);
                    if (h !== shover) {
                        shover = h;
                        redraw(sed);
                    }
                }
            } else if (ev.type === "mouseup") {
                if (sdrag >= 0) {
                    sdrag = -1;
                    speedChanged();
                }
            }
        }
        sed.addEventListener("mousedown", onSpeedMouse);
        sed.addEventListener("mousemove", onSpeedMouse);
        sed.addEventListener("mouseup", onSpeedMouse);
        sed.addEventListener("mouseout", function () {
            if (shover >= 0 && sdrag < 0) {
                shover = -1;
                redraw(sed);
            }
        });

        var lengthRow = addRow(spBox);
        var lengthCap = lengthRow.add("statictext", undefined, "Length");
        fixed(lengthCap, 44);
        lengthCap.helpTip = TIP.length;
        paintText(lengthCap, T.dim);
        var lengthDD = lengthRow.add("dropdownlist", undefined, LENGTH_ITEMS);
        flex(lengthDD);
        lengthDD.preferredSize.width = 60;
        lengthDD.helpTip = TIP.length;
        var fitNote = lengthRow.add("statictext", undefined, "");
        flex(fitNote);
        fitNote.preferredSize.width = 40;
        fitNote.helpTip = TIP.fitNote;
        setFont(fitNote, FONT_SMALL);
        paintText(fitNote, T.dim);

        var optBox = addColumn(spBox);
        optBox.spacing = 2;
        var beatChk = addCheck(optBox, "Slow-mo on beat", readSetting("onBeat", "0") === "1", TIP.onBeat);
        var smoothChk = addCheck(optBox, "Smooth frames", readSetting("smoothFrames", "0") === "1", TIP.smooth);

        var presetCard = addCard(body);
        var catDD = presetCard.add("dropdownlist", undefined, tab ? SPEED_CATEGORIES : CATEGORIES);
        flex(catDD);
        catDD.helpTip = tab ? TIP.speedCategory : TIP.category;

        var tiles = [];

        function addTile(parent, index) {
            var col = parent.add("group");
            col.orientation = "column";
            col.alignChildren = ["fill", "top"];
            col.alignment = ["fill", "top"];
            col.spacing = 2;
            col.margins = 0;
            col.minimumSize.width = 10;
            col.preferredSize.width = 56;
            var b = col.add("button", undefined, "");
            b.alignment = ["fill", "top"];
            b.minimumSize.width = 10;
            b.preferredSize = [56, 38];
            var t = col.add("statictext", undefined, "");
            t.alignment = ["fill", "top"];
            t.minimumSize.width = 10;
            t.preferredSize.width = 56;
            t.justify = "center";
            setFont(t, FONT_SMALL);
            paintText(t, T.text);
            var tile = { box: col, btn: b, label: t, preset: null, index: index };
            b.onDraw = function (state) {
                var g = this.graphics, w = this.size.width, h = this.size.height, hov = false, sel = (picked === index);
                try { hov = !!state.mouseOver && (!!tile.preset || curCat() === curMine()); } catch (_) {}
                drawGlass(g, this);
                fillRect(g, 0, 0, w, h, WHITE, hov ? 0.08 : 0.035);
                if (tile.preset && tile.preset.points) {
                    drawSpeedThumb(g, w, h, tile.preset.points, sel || hov);
                } else if (tile.preset) {
                    drawThumb(g, w, h, tile.preset.curve, sel || hov);
                } else if (curCat() === curMine()) {

                    strokeLine(g, [[w / 2 - 6, h / 2], [w / 2 + 6, h / 2]], T.dim, 0.9, 1.5);
                    strokeLine(g, [[w / 2, h / 2 - 6], [w / 2, h / 2 + 6]], T.dim, 0.9, 1.5);
                }
                if (sel) strokeRect(g, 0.5, 0.5, w - 1, h - 1, T.curve, 1);
                else strokeRect(g, 0.5, 0.5, w - 1, h - 1, T.edge, hov ? 0.35 : 0.18);
            };
            b.onClick = function () { tileClicked(index); };
            try { t.addEventListener("mousedown", function () { tileClicked(index); }); } catch (_) {}
            return tile;
        }

        var grid = presetCard.add("group");
        grid.orientation = "column";
        grid.alignChildren = ["fill", "top"];
        grid.alignment = ["fill", "top"];
        grid.spacing = 6;
        grid.margins = 0;

        var r, c, rowG, pairG, gridRows = [];
        for (r = 0; r < 2; r++) {
            rowG = addRow(grid);
            rowG.alignChildren = ["fill", "top"];
            rowG.spacing = 6;
            gridRows.push(rowG);
            for (c = 0; c < 2; c++) {
                pairG = addRow(rowG);
                pairG.alignment = ["fill", "top"];
                pairG.alignChildren = ["fill", "top"];
                pairG.spacing = 6;
                tiles.push(addTile(pairG, r * 4 + c * 2));
                tiles.push(addTile(pairG, r * 4 + c * 2 + 1));
            }
        }

        var hintRow = addRow(presetCard);
        var catHint = addText(hintRow, "", T.dim, FONT_SMALL);
        catHint.preferredSize.width = 60;
        var removeBtn = addImageButton(hintRow, "btn_remove", "Remove", "secondary", TIP.remove);
        removeBtn.preferredSize = [70, 24];
        removeBtn.maximumSize.width = 70;

        var applyBtn = addImageButton(body, "btn_apply", "Apply", "primary", TIP.apply);
        applyBtn.alignment = ["fill", "top"];

        var actions = addRow(body);
        actions.alignChildren = ["fill", "center"];
        var readBtn = addImageButton(actions, "btn_read", "Read", "secondary", TIP.read);
        flex(readBtn);
        readBtn.preferredSize.width = 60;
        var saveBtn = addImageButton(actions, "btn_save", "Save Preset", "secondary", TIP.save);
        flex(saveBtn);
        saveBtn.preferredSize.width = 60;
        var helpBtn = addImageButton(actions, "btn_help", "Help", "secondary", TIP.help);
        flex(helpBtn);
        helpBtn.preferredSize.width = 30;

        var statusText = addText(body, "", T.dim);
        statusText.preferredSize.width = 60;

        var footer = body.add("panel");
        footer.alignment = ["fill", "top"];
        footer.minimumSize.width = 10;
        footer.preferredSize.height = 22;
        footer.maximumSize.height = 22;
        footer.onDraw = function () {
            var g = this.graphics, w = this.size.width, h = this.size.height, a = IMG.footer;
            var iw = a ? a.w : 110, lineW = Math.max(0, Math.round((w - iw) / 2) - 12);
            var y = Math.round(h / 2);
            drawGlass(g, this);
            fadeLine(g, 0, y, lineW, false);
            fadeLine(g, w - lineW, y, lineW, true);
            if (!drawImageFit(g, "footer", w, h, 0)) drawFallbackText(g, "made by Admiral", T.gold, h);
        };

        function relayout() {
            try { root.layout.layout(true); } catch (_) {}
            try { root.layout.resize(); } catch (_) {}
        }

        var statusFull = "";

        function setStatus(text, col, tip) {
            statusFull = text;
            statusText.text = fitText(statusText, text);
            statusText.helpTip = tip || text;
            paintText(statusText, col);
        }

        function persistCurve() {
            saveSetting("curve", P.join(","));
            saveSetting("curveName", curveName);
        }

        function persistSpeed() {
            saveSetting("speedCurve", pointsText(SP));
            saveSetting("speedName", speedName);
            saveSetting("speedEase", SPE ? SPE.ease.join(",") + "," + SPE.avg : "");
        }

        function curCat() { return tab ? spCat : cat; }
        function curMine() { return tab ? SPEED_MINE : CAT_MINE; }
        function curHint() { return tab ? SPEED_HINT[spCat] : CAT_HINT[cat]; }
        function curCustom() { return tab ? spCustom : custom; }
        function readKey() { return tab ? "btn_read_layer" : "btn_read"; }
        function emptyName() { return curCat() === curMine() ? "Empty" : ""; }

        function fitLabels() {
            var i, pr, s, brief, full = IMG[readKey()];
            for (i = 0; i < tiles.length; i++) {
                pr = tiles[i].preset;
                s = fitText(tiles[i].label, pr ? pr.tileName : emptyName());
                if (tiles[i].label.text !== s) tiles[i].label.text = s;
            }
            s = fitText(catHint, curHint());
            if (catHint.text !== s) catHint.text = s;
            s = fitText(statusText, statusFull);
            if (statusText.text !== s) statusText.text = s;
            s = fitText(fitNote, fitFull);
            if (fitNote.text !== s) fitNote.text = s;
            brief = (full && readBtn.size.width - 12 < full.w) ||
                    (IMG.btn_save && saveBtn.size.width - 12 < IMG.btn_save.w);
            readBtn.__key = brief ? "btn_read_s" : readKey();
            saveBtn.__key = brief ? "btn_save_s" : "btn_save";
            redraw(readBtn);
            redraw(saveBtn);
        }

        function refreshTiles() {
            var i, pr;
            for (i = 0; i < tiles.length; i++) {
                pr = shown[i] || null;
                tiles[i].preset = pr;
                tiles[i].label.text = fitText(tiles[i].label, pr ? pr.tileName : emptyName());
                paintText(tiles[i].label, pr ? T.text : T.dim);
                if (!pr) tiles[i].btn.helpTip = emptyName() ? "An empty place. Click it to save the " + (tab ? "speed curve" : "curve") + " in the editor here." : "";
                else if (tab) tiles[i].btn.helpTip = pr.name + "\n" + pr.tip;
                else tiles[i].btn.helpTip = pr.name + "  (" + curveText(pr.curve) + ")\n" + pr.tip;
                tiles[i].label.helpTip = tiles[i].btn.helpTip;
                redraw(tiles[i].btn);
            }
            removeBtn.visible = (curCat() === curMine() && picked >= 0 && !!shown[picked]);
        }

        function findPicked() {
            var i;
            for (i = 0; i < shown.length; i++) {
                if (!shown[i]) continue;
                if (tab ? samePoints(shown[i].points, SP) : sameCurve(shown[i].curve, P)) return i;
            }
            return -1;
        }

        function showCategory() {
            shown = tab ? speedPresets(spCat, spCustom) : categoryPresets(cat, custom);
            picked = findPicked();
            catHint.text = fitText(catHint, curHint());
            refreshTiles();
            if (narrowExtras() && !fitting) {
                try { layoutKeepingSize(); } catch (_) {}
                fitLayout();
            }
        }

        function curveChanged() {
            view = viewFor(P);
            curveEdit.text = curveText(P);
            picked = findPicked();
            curveName = picked >= 0 ? shown[picked].name : "Custom curve";
            redraw(ed);
            refreshTiles();
            persistCurve();
        }

        function setCurve(p, name) {
            P = cleanCurve(p);
            view = viewFor(P);
            curveEdit.text = curveText(P);
            curveName = name;
            picked = findPicked();
            redraw(ed);
            refreshTiles();
            persistCurve();
        }

        var fitFull = "";

        function updateFitNote() {
            var f = 1 / (SPE ? SPE.avg : speedAverage(SP)), s = String(Math.round(f * 100) / 100);
            fitFull = (lengthMode ? "length x" : "speeds x") + s;
            fitNote.text = fitText(fitNote, fitFull);
        }

        function speedChanged(note) {
            SPE = null;
            picked = findPicked();
            speedName = picked >= 0 ? shown[picked].name : "Custom speed";
            updateFitNote();
            redraw(sed);
            refreshTiles();
            persistSpeed();
            if (note) setStatus(note, T.dim);
        }

        function setLength(mode) {
            lengthMode = mode;
            quietSelect(lengthDD, mode);
            saveSetting("lengthMode", mode);
            updateFitNote();
        }

        function setSpeed(pts, name, ease) {
            SP = copyPoints(pts);
            SPE = ease || null;
            speedName = name;
            picked = findPicked();
            updateFitNote();
            redraw(sed);
            refreshTiles();
            persistSpeed();
        }

        function tileClicked(i) {
            var pr = shown[i];
            if (!pr) {
                if (curCat() === curMine()) saveToSlot(i);
                return;
            }
            if (tab) {
                setSpeed(pr.points, pr.name, pr.ease);

                if (pr.keepFrames && lengthMode === 0) {
                    setLength(1);
                    setStatus(pr.name + " is in the editor - Length is now Keep all frames.", T.dim);
                } else {
                    setStatus(pr.name + " is in the editor.  Apply to Layer writes it.", T.dim);
                }
            } else {
                setCurve(pr.curve.slice(), pr.name);
                setStatus(pr.name + " is in the editor.  Apply to Keyframes writes it.", T.dim);
            }
            picked = i;
            refreshTiles();
        }

        function suggestName() {
            var n = 1, i, taken, list = curCustom(), base = tab ? "My Speed " : "My Curve ";
            while (true) {
                taken = false;
                for (i = 0; i < list.length; i++) if (list[i] && list[i].name === base + n) taken = true;
                if (!taken) return base + n;
                n++;
            }
        }

        function saveToSlot(i) {
            var current = tab ? speedName : curveName, plain = tab ? "Custom speed" : "Custom curve";
            var name = prompt("Name for this preset:", current !== plain && picked < 0 ? current : suggestName(), APP_NAME);
            if (name === null) return;
            name = cleanName(name);
            if (!name) name = suggestName();
            if (tab) {
                spCustom[i] = { name: name, points: copyPoints(SP) };
                saveSpeedCustom(spCustom, i);
                speedName = name;
                persistSpeed();
                if (spCat !== SPEED_MINE) {
                    spCat = SPEED_MINE;
                    quietSelect(catDD, SPEED_MINE);
                    saveSetting("speedCategory", spCat);
                }
            } else {
                custom[i] = { name: name, curve: P.slice() };
                saveCustom(custom, i);
                curveName = name;
                persistCurve();
                if (cat !== CAT_MINE) {
                    cat = CAT_MINE;
                    quietSelect(catDD, CAT_MINE);
                    saveSetting("category", cat);
                }
            }
            showCategory();
            picked = i;
            refreshTiles();
            setStatus("Saved '" + name + "' in My Presets.", C_OK);
        }

        var quiet = false;
        function quietSelect(dd, index) {
            quiet = true;
            try { dd.selection = index; } finally { quiet = false; }
        }

        function nothingText(sel) {
            if (sel && sel.lonely > 0) return "Select two keyframes next to each other - one alone has no curve.";
            if (sel && sel.unsupported > 0) return "Those keyframes only hold (text, markers, pickers): no curve.";
            return "Select two or more keyframes next to each other first.";
        }

        function propWord(n) { return n + (n === 1 ? " property" : " properties"); }

        function applyKeys() {
            var comp = activeComp(), res, text, tip, kinds;
            if (!comp) { setStatus("Open a composition and select keyframes first.", C_WARN); return; }
            try {
                res = applyCurve(comp, P, curveName);
            } catch (e) {
                setStatus(errorText(e), C_ERR);
                return;
            }
            if (!res.pairs) {
                if (res.failed) setStatus("Could not apply: " + errorText(res.error), C_ERR);
                else setStatus(nothingText(res.sel), C_WARN);
                return;
            }
            text = curveName + " on " + plural(res.pairs, "keyframe pair") +
                   (res.props > 1 ? " (" + propWord(res.props) + ")" : "") + ".";
            if (res.clippedPos || res.clippedPath || res.clippedColor) {
                kinds = [];
                if (res.clippedPos) kinds.push("Position");
                if (res.clippedPath) kinds.push("paths");
                if (res.clippedColor) kinds.push("colors");
                kinds = kinds.length > 1 ? kinds.slice(0, -1).join(", ") + " and " + kinds[kinds.length - 1] : kinds[0];
                tip = text + "\nThis curve goes past its end or pulls back first. After Effects cannot do\n" +
                      "that on " + kinds + ": it stops them at their keyframes, so that part is cut off.";
                if (res.clippedPos) tip += "\nFor Position: right-click Position > Separate Dimensions, then apply\n" +
                                           "the curve to X Position and Y Position - they can overshoot.";
                setStatus("Done - " + kinds + " cannot overshoot. See the tip.", C_WARN, tip);
            } else if (res.failed) {
                setStatus(text + " " + res.failed + " failed.", C_WARN, errorText(res.error));
            } else {
                setStatus(text, C_OK, text + "\n" + UNDO_KEYS + " undoes it.");
            }
        }

        function applySpeedNow() {
            var comp = activeComp(), res, text, tip, onBeat = beatChk.value;
            if (!comp) { setStatus("Open a composition and select a clip first.", C_WARN); return; }
            try {
                res = applySpeed(comp, SP, { keepFrames: lengthMode === 1, onBeat: onBeat, smoothFrames: smoothChk.value,
                                             ease: (SPE && samePoints(SP, easePoints(SPE))) ? SPE : null }, speedName);
            } catch (e) {
                setStatus(errorText(e), C_ERR);
                return;
            }
            if (!res.done) {
                if (res.failed.length) setStatus("Could not apply - see the tip.", C_ERR, res.failed.join("\n"));
                else setStatus("Select a video or precomp layer first.", C_WARN,
                               res.skipped.length ? "Skipped:\n" + res.skipped.join("\n") +
                               "\nSpeed needs footage or a precomposition at 100 % stretch." : "");
                return;
            }
            text = speedName + " on " + plural(res.done, "layer") + ".";
            tip = text + (lengthMode === 0 ? "\nSpeeds scaled x" + Math.round(res.factor * 100) / 100 +
                                             " so the clip keeps its length and shows the same part." : "") +
                  (res.skipped.length ? "\nSkipped:\n" + res.skipped.join("\n") : "") +
                  (res.failed.length ? "\nFailed:\n" + res.failed.join("\n") : "") +
                  "\n" + UNDO_KEYS + " undoes it.";
            if (onBeat && res.noMarker) {
                setStatus(text + " No beat marker inside " + (res.noMarker === 1 ? "the clip." : res.noMarker + " clips."),
                          C_WARN, tip + "\nSlow-mo on beat needs a marker inside the clip - BeatDrop can add them.");
            } else if (res.failed.length || res.skipped.length) {
                setStatus(text + " Some were skipped - see the tip.", C_WARN, tip);
            } else if (onBeat && res.noSlow) {
                setStatus(text + " It has no slow moment to put on a beat.", C_OK,
                          tip + "\nSlow-mo on beat moves a slow moment inside the curve onto the nearest beat;\n" +
                          "this curve is slowest at its start or end, so nothing was moved.");
            } else {
                setStatus(text + (onBeat && res.beats ? " Slow-mo on the beat." : ""), C_OK, tip);
            }
        }

        function readKeys() {
            var comp = activeComp(), r;
            if (!comp) { setStatus("Open a composition and select keyframes first.", C_WARN); return; }
            try {
                r = readCurve(comp);
            } catch (e) {
                setStatus(errorText(e), C_ERR);
                return;
            }
            if (r.problem === "none") setStatus(nothingText(r.sel), C_WARN);
            else if (r.problem === "hold") setStatus("Those keyframes jump (Hold), so there is no curve to read.", C_WARN);
            else if (r.problem === "flat") setStatus("Both keyframes have the same value: no curve to read.", C_WARN);
            else {
                setCurve(r.curve, "Custom curve");
                if (picked >= 0) curveName = shown[picked].name;
                setStatus("Read the curve of " + r.prop.name + ".", C_OK);
            }
        }

        function readSpeedNow() {
            var comp = activeComp(), r;
            if (!comp) { setStatus("Open a composition and select a clip first.", C_WARN); return; }
            try {
                r = readSpeed(comp);
            } catch (e) {
                setStatus(errorText(e), C_ERR);
                return;
            }
            if (r.problem === "none") setStatus("Select a layer first.", C_WARN);
            else if (r.problem === "noremap") setStatus("'" + r.layer.name + "' has no Time Remap, so no speed curve.", C_WARN);
            else if (r.problem === "few") setStatus("'" + r.layer.name + "' has no speed changes to read.", C_WARN);
            else if (r.problem === "many") setStatus("'" + r.layer.name + "' has more than " + SPEED_POINTS_MAX + " speed keys.", C_WARN);
            else {
                setSpeed(r.points, "Custom speed");
                if (picked >= 0) speedName = shown[picked].name;
                setStatus("Read the speed curve of " + r.layer.name + ".", C_OK);
            }
        }

        function saveNow() {
            var i, list = curCustom();
            for (i = 0; i < CUSTOM_SLOTS; i++) {
                if (!list[i]) { saveToSlot(i); return; }
            }
            alert("My Presets is full (" + CUSTOM_SLOTS + " places).\n\n" +
                  "To make room, open My Presets, click a preset and click Remove.", APP_NAME);
        }

        function removeNow() {
            var i = picked, list = curCustom(), pr = (curCat() === curMine() && i >= 0) ? list[i] : null;
            if (!pr) return;
            if (!confirm("Remove '" + pr.name + "' from My Presets?", false, APP_NAME)) return;
            list[i] = null;
            if (tab) saveSpeedCustom(spCustom, i);
            else saveCustom(custom, i);
            showCategory();
            setStatus("Removed '" + pr.name + "'.", T.dim);
        }

        function switchTab(index) {
            var i, items;
            tab = index;
            saveSetting("tab", tab);
            setShown(kfBox, tab === 0);
            setShown(spBox, tab === 1);
            quiet = true;
            try {
                catDD.removeAll();
                items = tab ? SPEED_CATEGORIES : CATEGORIES;
                for (i = 0; i < items.length; i++) catDD.add("item", items[i]);
                catDD.selection = curCat();
            } finally {
                quiet = false;
            }
            catDD.helpTip = tab ? TIP.speedCategory : TIP.category;
            applyBtn.__key = tab ? "btn_apply_layer" : "btn_apply";
            applyBtn.helpTip = tab ? TIP.applySpeed : TIP.apply;
            readBtn.helpTip = tab ? TIP.readSpeed : TIP.read;
            saveBtn.helpTip = tab ? TIP.saveSpeed : TIP.save;
            showCategory();
            redraw(tabKeys);
            redraw(tabSpeed);
            redraw(applyBtn);

            try { layoutKeepingSize(); } catch (_) {}
            lastLabelW = -1;
            fitLayout();
            setStatus(tab ? "Select a clip, pick a speed curve, click Apply." : "Select keyframes, pick a curve, click Apply.", T.dim);
        }

        catDD.onChange = function () {
            if (quiet) return;
            if (tab) {
                spCat = selIndex(catDD);
                saveSetting("speedCategory", spCat);
            } else {
                cat = selIndex(catDD);
                saveSetting("category", cat);
            }
            showCategory();
        };
        curveEdit.onChange = function () {
            var p = parseCurve(curveEdit.text);
            if (!p) {
                curveEdit.text = curveText(P);
                setStatus("Type four numbers: x1, y1, x2, y2 (x between 0 and 1).", C_WARN);
                return;
            }
            P = p;
            curveChanged();
        };
        lengthDD.onChange = function () {
            if (quiet) return;
            setLength(selIndex(lengthDD));
        };
        beatChk.onClick = function () { saveSetting("onBeat", beatChk.value ? "1" : "0"); };
        smoothChk.onClick = function () { saveSetting("smoothFrames", smoothChk.value ? "1" : "0"); };
        applyBtn.onClick = function () { if (tab) applySpeedNow(); else applyKeys(); };
        readBtn.onClick = function () { if (tab) readSpeedNow(); else readKeys(); };
        saveBtn.onClick = saveNow;
        removeBtn.onClick = removeNow;
        helpBtn.onClick = function () { alert(tab ? HELP_SPEED : HELP_TEXT, APP_NAME); };

        var MEDIUM_W = 330, NARROW_W = 250, tileMode = 0, lastLabelW = -1;

        function tileShape(tile, mode) {
            var beside = (mode === 1);
            var bw = beside ? 44 : 56, bh = [38, 26, 24][mode];
            tile.box.orientation = beside ? "row" : "column";
            tile.box.alignChildren = beside ? ["left", "center"] : ["fill", "top"];
            tile.box.spacing = beside ? 6 : 2;
            tile.btn.alignment = beside ? ["left", "center"] : ["fill", "top"];

            tile.btn.minimumSize.width = 10;
            tile.btn.minimumSize.height = 0;
            tile.btn.maximumSize.width = beside ? 44 : 10000;
            tile.btn.maximumSize.height = bh;
            tile.btn.minimumSize.width = beside ? 44 : 10;
            tile.btn.minimumSize.height = bh;
            tile.btn.preferredSize.width = bw;
            tile.btn.preferredSize.height = bh;
            try { tile.btn.size = [bw, bh]; } catch (_) {}
            tile.label.alignment = beside ? ["fill", "center"] : ["fill", "top"];
            try { tile.label.justify = beside ? "left" : "center"; } catch (_) {}
            redraw(tile.btn);
        }

        function layoutKeepingSize() {
            var win = (root instanceof Window), s, mn, mx;
            if (win) {
                s = [root.size.width, root.size.height];
                mn = [root.minimumSize.width, root.minimumSize.height];
                mx = [root.maximumSize.width, root.maximumSize.height];
                root.minimumSize = s;
                root.maximumSize = s;
            }
            try {
                root.layout.layout(true);
            } finally {
                if (win) {
                    root.minimumSize = mn;
                    root.maximumSize = mx;
                }
            }
            root.layout.resize();
        }

        var fitting = false;

        function edMin() { return tileMode === 2 ? 80 : ED_MIN; }

        function narrowExtras() {
            var tight = (tileMode === 2), hint = !tight || curCat() === curMine(), was = hintRow.visible;
            lengthCap.minimumSize.width = 0;
            lengthCap.maximumSize.width = tight ? 0 : 44;
            lengthCap.minimumSize.width = tight ? 0 : 44;
            lengthCap.visible = !tight;
            fitNote.minimumSize.width = 0;
            fitNote.maximumSize.width = tight ? 0 : 10000;
            fitNote.minimumSize.width = tight ? 0 : 10;
            fitNote.visible = !tight;
            setShown(hintRow, hint);
            return was !== hint;
        }

        function fitLayout() {
            var h, want, top, mode, i, box = tab ? sed : ed;
            if (fitting) return;
            fitting = true;
            try {
                mode = root.size.width < NARROW_W ? 2 : (root.size.width < MEDIUM_W ? 1 : 0);
                if (mode !== tileMode) {
                    tileMode = mode;
                    for (i = 0; i < gridRows.length; i++) gridRows[i].orientation = mode ? "column" : "row";
                    for (i = 0; i < tiles.length; i++) tileShape(tiles[i], mode);
                    narrowExtras();
                    layoutKeepingSize();
                }

                h = box.preferredSize.height;
                top = Math.max(edMin(), Math.min(ED_MAX, Math.round(box.size.width)));
                want = clamp(Math.round(root.size.height - (body.preferredSize.height - h)), edMin(), top);
                if (want !== h) {

                    box.minimumSize.height = 0;
                    box.maximumSize.height = want;
                    box.minimumSize.height = want;
                    box.preferredSize.height = want;
                    layoutKeepingSize();
                }
                root.layout.resize();
            } catch (_) {}
            try {
                if (tiles[0] && tiles[0].label.size.width !== lastLabelW) {
                    lastLabelW = tiles[0].label.size.width;
                    fitLabels();
                }
            } catch (_) {}
            fitting = false;
        }

        body.alignment = ["fill", "top"];
        root.onResizing = root.onResize = fitLayout;

        function endDrags() {
            if (drag >= 0) {
                drag = -1;
                curveChanged();
            }
            if (sdrag >= 0) {
                sdrag = -1;
                speedChanged();
            }
        }
        try { root.addEventListener("mouseup", endDrags, false); } catch (_) {}

        quietSelect(catDD, curCat());
        quietSelect(lengthDD, lengthMode);
        setShown(kfBox, tab === 0);
        setShown(spBox, tab === 1);
        applyBtn.__key = tab ? "btn_apply_layer" : "btn_apply";
        updateFitNote();
        relayout();
        if (root instanceof Window) {
            try {

                root.size = [380, root.size[1] + 80];
            } catch (_) {}
        }
        switchTab(tab);
        return root;
    }

    /* ------------------------------------------------------------------ */

    var ui = buildUI(thisObj);
    if (ui && (ui instanceof Window)) {
        ui.center();
        ui.show();
    }
