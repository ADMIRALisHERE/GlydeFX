# GlydeFX - Copyright (C) 2026 Amirhossein Asadi - SPDX-License-Identifier: GPL-3.0-or-later (see LICENSE)
# Renders the panel's text artwork (logo, button labels, footer) as PNGs
# into src/assets and writes src/assets/manifest.json. Run
# tools/make_glass.py afterwards for the glass background.
#   powershell -ExecutionPolicy Bypass -File tools/gen_assets.ps1
param([string]$Out = (Join-Path $PSScriptRoot "..\src\assets"))
$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force $Out | Out-Null

Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Drawing.Text;

public static class GlydeAssets {
    static Color H(string hex) { return ColorTranslator.FromHtml(hex); }

    static float DrawSpaced(Graphics g, Font font, string text, Color color, float x, float y, float spacing) {
        StringFormat fmt = StringFormat.GenericTypographic;
        using (SolidBrush br = new SolidBrush(color)) {
            if (spacing == 0) {
                g.DrawString(text, font, br, x, y, fmt);
                return x + g.MeasureString(text, font, PointF.Empty, fmt).Width;
            }
            foreach (char ch in text) {
                float cw = (ch == ' ') ? font.Size * 0.30f : g.MeasureString(ch.ToString(), font, PointF.Empty, fmt).Width;
                if (ch != ' ') g.DrawString(ch.ToString(), font, br, x, y, fmt);
                x += cw + spacing;
            }
        }
        return x;
    }

    public static Bitmap Crop(Bitmap src, int pad) {
        int minX = src.Width, minY = src.Height, maxX = -1, maxY = -1;
        BitmapData d = src.LockBits(new Rectangle(0, 0, src.Width, src.Height), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
        byte[] buf = new byte[d.Stride * src.Height];
        System.Runtime.InteropServices.Marshal.Copy(d.Scan0, buf, 0, buf.Length);
        int stride = d.Stride;
        src.UnlockBits(d);
        for (int y = 0; y < src.Height; y++)
            for (int x = 0; x < src.Width; x++)
                if (buf[y * stride + x * 4 + 3] > 6) {
                    if (x < minX) minX = x; if (x > maxX) maxX = x;
                    if (y < minY) minY = y; if (y > maxY) maxY = y;
                }
        if (maxX < 0) return src;
        minX = Math.Max(0, minX - pad); minY = Math.Max(0, minY - pad);
        maxX = Math.Min(src.Width - 1, maxX + pad); maxY = Math.Min(src.Height - 1, maxY + pad);
        Bitmap o = src.Clone(new Rectangle(minX, minY, maxX - minX + 1, maxY - minY + 1), PixelFormat.Format32bppArgb);
        src.Dispose();
        return o;
    }

    // The Admiral header: the product's name in mixed case (the user found
    // GLYDEFX in capitals hard to read), Georgia, flat brass, over the
    // tagline in small spaced capitals - as BeatDrop's.
    // Smaller panels get a smaller rendering, never a scaled-down one:
    // ScriptUI scales images without smoothing and the letters broke up.
    public static Bitmap Wordmark(string name, string tagline, float px, float spacing, float tagPx, float tagSpacing) {
        Bitmap bmp = new Bitmap(460, 90, PixelFormat.Format32bppArgb);
        using (Graphics g = Graphics.FromImage(bmp)) {
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.PixelOffsetMode = PixelOffsetMode.HighQuality;
            g.TextRenderingHint = TextRenderingHint.AntiAliasGridFit;
            float bottom;
            using (Font f = new Font("Georgia", px, FontStyle.Regular, GraphicsUnit.Pixel)) {
                DrawSpaced(g, f, name, H("#D4A849"), 10, 10, spacing);
                bottom = 10 + f.GetHeight(g);
            }
            if (!string.IsNullOrEmpty(tagline))
                using (Font f = new Font("Segoe UI", tagPx, FontStyle.Regular, GraphicsUnit.Pixel))
                    DrawSpaced(g, f, tagline, H("#C9B27A"), 11, bottom - 1, tagSpacing);
        }
        return Crop(bmp, 1);
    }

    public static Bitmap Label(string[] texts, string[] colors, string fontName, float px, float spacing) {
        Bitmap bmp = new Bitmap(900, 80, PixelFormat.Format32bppArgb);
        using (Graphics g = Graphics.FromImage(bmp)) {
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.TextRenderingHint = TextRenderingHint.AntiAliasGridFit;
            using (Font f = new Font(fontName, px, FontStyle.Regular, GraphicsUnit.Pixel)) {
                float x = 10;
                for (int i = 0; i < texts.Length; i++) x = DrawSpaced(g, f, texts[i], H(colors[i]), x, 20, spacing);
            }
        }
        return Crop(bmp, 1);
    }
}
"@

function Save($bmp, $name) {
    $path = Join-Path $Out "$name.png"
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    [pscustomobject]@{ name = $name; w = $bmp.Width; h = $bmp.Height; bytes = (Get-Item $path).Length }
    $bmp.Dispose()
}

$navyText = "#1B1407"; $light = "#DCE2EC"
$rows = @()
# Each text picture that may meet a narrow panel also comes smaller ("_m",
# "_s"); the panel draws the largest that fits.
$rows += Save ([GlydeAssets]::Wordmark("GlydeFX", "EASING & SPEED RAMPS", 29, 1.2, 11, 3)) "logo"
$rows += Save ([GlydeAssets]::Wordmark("GlydeFX", "EASING & SPEED RAMPS", 24, 1, 9.5, 1.9)) "logo_m"
$rows += Save ([GlydeAssets]::Wordmark("GlydeFX", "", 21, 0.8, 0, 0)) "logo_s"
$rows += Save ([GlydeAssets]::Label(@("Apply to Keyframes"), @($navyText), "Segoe UI Semibold", 16, 0)) "btn_apply"
$rows += Save ([GlydeAssets]::Label(@("Apply"), @($navyText), "Segoe UI Semibold", 16, 0)) "btn_apply_s"
$rows += Save ([GlydeAssets]::Label(@("Read from Keys"), @($light), "Segoe UI", 13, 0)) "btn_read"
$rows += Save ([GlydeAssets]::Label(@("Read"), @($light), "Segoe UI", 13, 0)) "btn_read_s"
$rows += Save ([GlydeAssets]::Label(@("Save Preset"), @($light), "Segoe UI", 13, 0)) "btn_save"
$rows += Save ([GlydeAssets]::Label(@("Save"), @($light), "Segoe UI", 13, 0)) "btn_save_s"
$rows += Save ([GlydeAssets]::Label(@("Help"), @($light), "Segoe UI", 13, 0)) "btn_help"
# The Speed tab: its own apply and read labels, the tab names (plain and
# gold when active) and the speed scale.
$rows += Save ([GlydeAssets]::Label(@("Apply to Layer"), @($navyText), "Segoe UI Semibold", 16, 0)) "btn_apply_layer"
$rows += Save ([GlydeAssets]::Label(@("Read from Layer"), @($light), "Segoe UI", 13, 0)) "btn_read_layer"
$rows += Save ([GlydeAssets]::Label(@("Keyframes"), @("#AEB8C8"), "Segoe UI Semibold", 13, 0.4)) "tab_keys"
$rows += Save ([GlydeAssets]::Label(@("Keyframes"), @("#E2C275"), "Segoe UI Semibold", 13, 0.4)) "tab_keys_on"
$rows += Save ([GlydeAssets]::Label(@("Speed"), @("#AEB8C8"), "Segoe UI Semibold", 13, 0.4)) "tab_speed"
$rows += Save ([GlydeAssets]::Label(@("Speed"), @("#E2C275"), "Segoe UI Semibold", 13, 0.4)) "tab_speed_on"
foreach ($pair in @(@("4x", "lbl_4"), @("2x", "lbl_2"), @("1x", "lbl_1"), @("0.5x", "lbl_05"), @("0.25x", "lbl_025"), @("0.1x", "lbl_01"))) {
    $rows += Save ([GlydeAssets]::Label(@($pair[0]), @("#8E98AB"), "Segoe UI", 10, 0)) $pair[1]
}
$rows += Save ([GlydeAssets]::Label(@("Remove"), @($light), "Segoe UI", 12, 0)) "btn_remove"
$rows += Save ([GlydeAssets]::Label(@("made by  ", "Admiral"), @("#7E899E", "#D4A849"), "Segoe UI Semibold", 11, 1.4)) "footer"
$rows | Format-Table -AutoSize | Out-String
$rows | ConvertTo-Json | Set-Content -Encoding ascii (Join-Path $Out "manifest.json")
