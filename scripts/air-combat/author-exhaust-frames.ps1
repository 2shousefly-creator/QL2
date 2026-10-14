# Asset authoring only: read the original generated RGBA files and write atlas metadata.
# No source pixels are changed. Ignition anchors register each unique generated frame.
Add-Type -AssemblyName System.Drawing
$artDirectory = Join-Path $PSScriptRoot '../../src/assets/khong-kich/26.32.2'
$atlas = [ordered]@{}
foreach ($file in Get-ChildItem -LiteralPath $artDirectory -Filter '*-exhaust.png') {
    $bitmap = [System.Drawing.Bitmap]::new($file.FullName)
    $frames = @()
    for ($index = 0; $index -lt 16; $index++) {
        $column = $index % 4
        $row = [Math]::Floor($index / 4)
        $left = [int][Math]::Round($column * $bitmap.Width / 4)
        $top = [int][Math]::Round($row * $bitmap.Height / 4)
        $width = [int][Math]::Round(($column + 1) * $bitmap.Width / 4) - $left
        $height = [int][Math]::Round(($row + 1) * $bitmap.Height / 4) - $top
        $anchorX = $width / 2
        $anchorY = $height * .08
        for ($y = 2; $y -lt $height * .25; $y++) {
            $sumX = 0; $count = 0
            for ($x = [int]($width * .4); $x -lt $width * .6; $x++) {
                $pixel = $bitmap.GetPixel($left + $x, $top + $y)
                if ($pixel.A -gt 200 -and ($pixel.R + $pixel.G + $pixel.B) -gt 610) { $sumX += $x; $count++ }
            }
            if ($count -ge 3) { $anchorX = $sumX / $count; $anchorY = $y + 2; break }
        }
        $frames += [ordered]@{ rect = @($left, $top, $width, $height); anchor = @([Math]::Round($anchorX / $width, 5), [Math]::Round($anchorY / $height, 5)) }
    }
    $atlas[$file.BaseName.Replace('-exhaust', '')] = [ordered]@{ width = $bitmap.Width; height = $bitmap.Height; frames = $frames }
    $bitmap.Dispose()
}
$atlas | ConvertTo-Json -Depth 8 | Set-Content -Encoding utf8 (Join-Path $artDirectory 'frames.json')
