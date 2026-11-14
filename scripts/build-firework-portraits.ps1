param([string]$Source, [string]$Output, [string]$Preview)
Add-Type -AssemblyName System.Drawing
$original = [System.Drawing.Bitmap]::new($Source)
$bitmap = [System.Drawing.Bitmap]::new(900, 300)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.DrawImage($original, 0, 0, 900, 300)
$graphics.Dispose()
$original.Dispose()
$portraits = @()
$names = @('Lexa', 'Octavia', 'Clarke')
for ($cell = 0; $cell -lt 3; $cell++) {
    $candidates = [System.Collections.Generic.List[object]]::new()
    for ($y = 2; $y -lt 298; $y += 2) {
        for ($x = 2; $x -lt 298; $x += 2) {
            $px = $cell * 300 + $x
            $color = $bitmap.GetPixel($px, $y)
            $light = [int]$color.R
            $edge = [math]::Abs([int]$bitmap.GetPixel($px + 1, $y).R - [int]$bitmap.GetPixel($px - 1, $y).R) + [math]::Abs([int]$bitmap.GetPixel($px, $y + 1).R - [int]$bitmap.GetPixel($px, $y - 1).R)
            if ($light -gt 200 -or ($light -gt 35 -and $edge -gt 85)) {
                $candidates.Add(@([math]::Round(($x - 150) / 150, 3), [math]::Round(($y - 150) / 150, 3)))
            }
        }
    }
    $points = @()
    $count = [math]::Min(850, $candidates.Count)
    for ($i = 0; $i -lt $count; $i++) { $points += ,$candidates[[int][math]::Floor($i * $candidates.Count / $count)] }
    $portraits += @{ name = $names[$cell]; points = $points }
}
$bitmap.Dispose()
$json = ConvertTo-Json -InputObject $portraits -Depth 6 -Compress
[System.IO.File]::WriteAllText($Output, "window.CARTA_FIREWORK_PORTRAITS = $json;", [System.Text.UTF8Encoding]::new($false))
if ($Preview) {
    $canvas = [System.Drawing.Bitmap]::new(900, 300)
    $g = [System.Drawing.Graphics]::FromImage($canvas)
    $g.Clear([System.Drawing.Color]::FromArgb(7, 14, 19))
    $brush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(235, 218, 168))
    for ($cell = 0; $cell -lt 3; $cell++) {
        foreach ($point in $portraits[$cell].points) { $g.FillEllipse($brush, [single]($cell * 300 + 150 + $point[0] * 142), [single](150 + $point[1] * 142), [single]1.6, [single]1.6) }
    }
    $canvas.Save($Preview, [System.Drawing.Imaging.ImageFormat]::Png)
    $brush.Dispose(); $g.Dispose(); $canvas.Dispose()
}
$portraits | ForEach-Object { "$($_.name): $($_.points.Count) points" }
