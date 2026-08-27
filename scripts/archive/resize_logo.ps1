Add-Type -AssemblyName System.Drawing
$srcPath = Join-Path (Get-Location) "logo.jpg"
$destPath = Join-Path (Get-Location) "logo.jpg"

if (Test-Path $srcPath) {
    $img = [System.Drawing.Image]::FromFile($srcPath)
    $bmp = New-Object System.Drawing.Bitmap 256, 256
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, 0, 0, 256, 256)
    $img.Dispose()
    
    # Save as compressed JPEG
    $encoder = [System.Drawing.Imaging.Encoder]::Quality
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($encoder, [long]85)
    $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
    
    $tempPath = Join-Path (Get-Location) "logo_opt.jpg"
    $bmp.Save($tempPath, $jpegCodec, $encoderParams)
    $g.Dispose()
    $bmp.Dispose()
    
    Move-Item -Path $tempPath -Destination $destPath -Force
    Write-Host "Successfully optimized logo.jpg!"
}
