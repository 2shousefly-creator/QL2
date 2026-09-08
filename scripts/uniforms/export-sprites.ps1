param(
  [string]$Manifest,
  [switch]$ShoulderBoardsOnly,
  [string]$OutputRoot = (Join-Path $PSScriptRoot '../../public/assets/uniforms')
)

# Garments retain their ImageGen export; shoulder boards use the shared material/geometry.
# Manifest entries: { key, kind: "uniform" | "board", source: absolute PNG path }.
$ErrorActionPreference = 'Stop'
if ($ShoulderBoardsOnly) {
  & node (Join-Path $PSScriptRoot 'render-shoulder-boards.cjs') --output-root $OutputRoot
  if ($LASTEXITCODE -ne 0) { throw 'Shoulder-board export failed' }
  return
}
if (-not $Manifest) { throw 'Provide -Manifest or -ShoulderBoardsOnly' }
Add-Type -AssemblyName System.Drawing
$entries = Get-Content -LiteralPath $Manifest -Raw | ConvertFrom-Json
$exportBoards = $false
foreach ($entry in $entries) {
  if ($entry.key -notmatch '^[a-z0-9_]+$') { throw "Invalid rank key: $($entry.key)" }
  if ($entry.kind -notin @('uniform', 'board')) { throw "Invalid sprite kind" }
  # Never overwrite the common grid with independently sized generated boards.
  if ($entry.kind -eq 'board') { $exportBoards = $true; continue }
  $isUniform = $entry.kind -eq 'uniform'
  $folder = Join-Path $OutputRoot $(if ($isUniform) { 'uniforms' } else { 'shoulder-boards' })
  [System.IO.Directory]::CreateDirectory($folder) | Out-Null
  $source = [System.Drawing.Bitmap]::new($entry.source)
  if ($source.GetPixel(0, 0).A -ne 0 -or $source.GetPixel([int]($source.Width / 2), 0).A -ne 0) {
    $source.Dispose()
    throw "Source still has an opaque background: $($entry.kind)/$($entry.key)"
  }
  $width = if ($isUniform) { 840 } else { 512 }
  $height = if ($isUniform) { 1120 } else { 192 }
  $target = [System.Drawing.Bitmap]::new($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($target)
  try {
    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    # The generated garment extends to its hem. Export only collar/shoulders/chest/upper sleeves.
    $top = if ($isUniform) { [int]($source.Height * 0.065) } else { 0 }
    $cropHeight = if ($isUniform) { [int]($source.Height * 0.78) } else { $source.Height }
    $graphics.DrawImage($source, [System.Drawing.Rectangle]::new(0, 0, $width, $height),
      0, $top, $source.Width, $cropHeight, [System.Drawing.GraphicsUnit]::Pixel)
    $target.Save((Join-Path $folder "$($entry.key).png"), [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $graphics.Dispose()
    $target.Dispose()
    $source.Dispose()
  }
}
if ($exportBoards) {
  & node (Join-Path $PSScriptRoot 'render-shoulder-boards.cjs') --output-root $OutputRoot
  if ($LASTEXITCODE -ne 0) { throw 'Shoulder-board export failed' }
}
Write-Output 'Export complete (board entries regenerate the complete shared set of 24).'
