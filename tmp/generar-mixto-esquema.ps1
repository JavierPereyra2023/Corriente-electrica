Add-Type -AssemblyName System.Drawing

$out = Join-Path (Get-Location) "assets\mixto_esquema.png"
$bmp = New-Object System.Drawing.Bitmap 1536, 960
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$white = [System.Drawing.Color]::FromArgb(252, 252, 250)
$ink = [System.Drawing.Color]::FromArgb(8, 34, 86)
$gold = [System.Drawing.Color]::FromArgb(194, 118, 0)
$line = [System.Drawing.Color]::FromArgb(214, 201, 175)
$soft = [System.Drawing.Color]::FromArgb(237, 243, 247)
$black = [System.Drawing.Color]::FromArgb(21, 25, 29)

$g.Clear($white)

$fontTitle = New-Object System.Drawing.Font "Segoe UI", 46, ([System.Drawing.FontStyle]::Bold)
$fontLabel = New-Object System.Drawing.Font "Segoe UI", 35, ([System.Drawing.FontStyle]::Bold)
$fontSmall = New-Object System.Drawing.Font "Segoe UI", 24, ([System.Drawing.FontStyle]::Bold)
$fontNote = New-Object System.Drawing.Font "Segoe UI", 22, ([System.Drawing.FontStyle]::Regular)

$penWire = New-Object System.Drawing.Pen $ink, 9
$penWire.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$penWire.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$penThin = New-Object System.Drawing.Pen $ink, 5
$penGold = New-Object System.Drawing.Pen $gold, 5
$penBlack = New-Object System.Drawing.Pen $black, 6
$brushInk = New-Object System.Drawing.SolidBrush $ink
$brushGold = New-Object System.Drawing.SolidBrush $gold
$brushSoft = New-Object System.Drawing.SolidBrush $soft
$brushWhite = New-Object System.Drawing.SolidBrush $white
$brushBlack = New-Object System.Drawing.SolidBrush $black

function Draw-Arrow($x1, $y1, $x2, $y2) {
  $p = New-Object System.Drawing.Pen $gold, 5
  $cap = New-Object System.Drawing.Drawing2D.AdjustableArrowCap 7, 9
  $p.CustomEndCap = $cap
  $script:g.DrawLine($p, $x1, $y1, $x2, $y2)
  $p.Dispose()
  $cap.Dispose()
}

function Draw-Resistor($x1, $y, $x2) {
  $points = New-Object System.Collections.Generic.List[System.Drawing.PointF]
  $points.Add([System.Drawing.PointF]::new($x1, $y))
  $step = ($x2 - $x1) / 8
  for ($i = 1; $i -lt 8; $i++) {
    $yy = if ($i % 2 -eq 1) { $y - 35 } else { $y + 35 }
    $points.Add([System.Drawing.PointF]::new($x1 + $step * $i, $yy))
  }
  $points.Add([System.Drawing.PointF]::new($x2, $y))
  $script:g.DrawLines($script:penBlack, $points.ToArray())
}

function Draw-Bulb($cx, $cy, $label) {
  $script:g.FillEllipse($script:brushWhite, $cx - 55, $cy - 55, 110, 110)
  $script:g.DrawEllipse($script:penWire, $cx - 55, $cy - 55, 110, 110)
  $script:g.DrawLine($script:penGold, $cx - 36, $cy - 36, $cx + 36, $cy + 36)
  $script:g.DrawLine($script:penGold, $cx + 36, $cy - 36, $cx - 36, $cy + 36)
  $script:g.DrawString($label, $script:fontLabel, $script:brushInk, $cx + 72, $cy - 24)
}

# Titulo
$g.DrawString("Circuito mixto: serie + paralelo", $fontTitle, $brushInk, 370, 50)
$g.DrawString("L1/R1 está en serie con un bloque paralelo formado por L2/R2 y L3/R3.", $fontNote, $brushBlack, 330, 115)

# Bateria
$g.DrawLine($penWire, 230, 270, 230, 680)
$g.DrawLine((New-Object System.Drawing.Pen $gold, 7), 150, 340, 310, 340)
$g.DrawLine($penWire, 180, 405, 280, 405)
$g.DrawLine($penWire, 180, 475, 280, 475)
$g.DrawString("+", $fontLabel, $brushGold, 165, 285)
$g.DrawString("batería", $fontLabel, $brushInk, 75, 425)

# Camino superior con llave y R1/L1
$g.DrawLine($penWire, 230, 270, 505, 270)
$g.DrawString("llave cerrada", $fontSmall, $brushInk, 485, 200)
$g.FillEllipse($brushWhite, 510, 253, 34, 34)
$g.DrawEllipse($penWire, 510, 253, 34, 34)
$g.FillEllipse($brushWhite, 650, 253, 34, 34)
$g.DrawEllipse($penWire, 650, 253, 34, 34)
$g.DrawLine($penBlack, 535, 270, 660, 235)
$g.DrawLine($penWire, 684, 270, 780, 270)
Draw-Bulb 865 270 "L1"
$g.DrawString("R1 en serie", $fontSmall, $brushInk, 805, 180)
$g.DrawLine($penWire, 920, 270, 1010, 270)

# Nodo A
$g.FillEllipse($brushGold, 995, 255, 30, 30)
$g.DrawEllipse($penBlack, 995, 255, 30, 30)
$g.DrawString("nodo A", $fontSmall, $brushInk, 945, 210)

# Paralelo
$g.DrawLine($penWire, 1010, 270, 1010, 170)
$g.DrawLine($penWire, 1010, 170, 1165, 170)
Draw-Bulb 1235 170 "L2"
$g.DrawString("rama 1", $fontSmall, $brushInk, 1185, 80)
$g.DrawLine($penWire, 1290, 170, 1400, 170)
$g.DrawLine($penWire, 1400, 170, 1400, 440)

$g.DrawLine($penWire, 1010, 270, 1010, 500)
$g.DrawLine($penWire, 1010, 500, 1165, 500)
Draw-Bulb 1235 500 "L3"
$g.DrawString("rama 2", $fontSmall, $brushInk, 1185, 590)
$g.DrawLine($penWire, 1290, 500, 1400, 500)
$g.DrawLine($penWire, 1400, 500, 1400, 440)

# Nodo B y retorno
$g.FillEllipse($brushGold, 1385, 425, 30, 30)
$g.DrawEllipse($penBlack, 1385, 425, 30, 30)
$g.DrawString("nodo B", $fontSmall, $brushInk, 1308, 385)
$g.DrawLine($penWire, 1400, 440, 1400, 760)
$g.DrawLine($penWire, 1400, 760, 230, 760)
$g.DrawLine($penWire, 230, 760, 230, 680)

# Flechas de corriente
Draw-Arrow 330 235 455 235
Draw-Arrow 720 235 800 235
Draw-Arrow 1038 225 1125 185
Draw-Arrow 1038 330 1130 465
Draw-Arrow 900 805 760 805
Draw-Arrow 280 705 280 600
$g.DrawString("IT", $fontSmall, $brushGold, 350, 195)
$g.DrawString("I2", $fontSmall, $brushGold, 1070, 155)
$g.DrawString("I3", $fontSmall, $brushGold, 1070, 390)

# Nota
$g.FillRectangle($brushSoft, 365, 840, 900, 70)
$g.DrawRectangle((New-Object System.Drawing.Pen $line, 3), 365, 840, 900, 70)
$g.DrawString("Lectura: L2 y L3 comparten los nodos A y B, por eso están en paralelo.", $fontNote, $brushBlack, 390, 850)
$g.DrawString("Ese bloque completo está conectado en serie con L1.", $fontNote, $brushBlack, 390, 880)

$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
