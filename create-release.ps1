# PowerShell script to create GitHub Release v1.1.0
# Run this script to automatically create the release and upload the executable

$owner = "antonprafanto"
$repo = "videomuter"
$tag = "v1.1.0"
$name = "Video Muter v1.1.0 - High Priority Features"
$exePath = "dist\VideoMuter-Portable.exe"

# Release notes
$body = @"
# 🎉 Video Muter v1.1.0

Major update with 8 new high-priority features!

## ✨ New Features

### 1. ⏸️ Pause/Resume/Cancel Controls
- Pause processing between videos
- Resume paused processing
- Cancel all processing with confirmation
- Control buttons in progress view

### 2. 💾 Disk Space Check
- Automatically checks available disk space before processing
- Shows warning if space is insufficient
- Displays drive, available space, and required space

### 3. ⏱️ ETA (Estimated Time Remaining)
- Real-time calculation of time remaining
- Displayed in minutes and seconds
- Updates as files are processed

### 4. ❌ Better Error Messages
- User-friendly error messages in Indonesian
- Specific messages for common errors
- Technical details available on hover

### 5. 📊 File Size Information
- Shows file size in MB for each file
- Helps estimate processing time

### 6. 🔔 Desktop Notifications
- Windows notification when processing completes
- Shows success/failure count
- Never miss when your videos are done!

### 7. 📁 Recent Files History
- Remembers last 10 processed files
- Quick access to recent work

### 8. ⌨️ Keyboard Shortcuts
- **Ctrl+O**: Open files
- **Ctrl+Enter**: Start processing
- **Space**: Pause/Resume
- **Esc**: Cancel
- **Delete**: Clear files

## 📦 Installation

Download ``VideoMuter-Portable.exe`` and run it. No installation required!

## 🐛 Known Limitations

- Pause/Resume works between videos, not during individual video processing (FFmpeg limitation)

## 📝 Full Changelog

See [CHANGELOG.md](https://github.com/antonprafanto/videomuter/blob/main/CHANGELOG.md) for complete details.

---

🤖 Built with [Claude Code](https://claude.com/claude-code)
"@

Write-Host "Creating GitHub Release $tag..." -ForegroundColor Cyan

# You need to set your GitHub token first
# Get token from: https://github.com/settings/tokens (need 'repo' scope)
$token = $env:GITHUB_TOKEN

if (-not $token) {
    Write-Host "ERROR: GITHUB_TOKEN environment variable not set!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create a GitHub Personal Access Token:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://github.com/settings/tokens/new" -ForegroundColor White
    Write-Host "2. Give it a name (e.g., 'Release Token')" -ForegroundColor White
    Write-Host "3. Select scope: 'repo' (Full control of private repositories)" -ForegroundColor White
    Write-Host "4. Click 'Generate token'" -ForegroundColor White
    Write-Host "5. Copy the token" -ForegroundColor White
    Write-Host ""
    Write-Host "Then set it temporarily with:" -ForegroundColor Yellow
    Write-Host '  $env:GITHUB_TOKEN = "your-token-here"' -ForegroundColor White
    Write-Host ""
    Write-Host "Or permanently in System Environment Variables" -ForegroundColor Yellow
    exit 1
}

$headers = @{
    "Authorization" = "token $token"
    "Accept" = "application/vnd.github+json"
}

# Create release
$releaseData = @{
    tag_name = $tag
    name = $name
    body = $body
    draft = $false
    prerelease = $false
} | ConvertTo-Json

try {
    Write-Host "Creating release..." -ForegroundColor Yellow
    $release = Invoke-RestMethod -Uri "https://api.github.com/repos/$owner/$repo/releases" `
        -Method Post `
        -Headers $headers `
        -Body $releaseData `
        -ContentType "application/json"

    Write-Host "✓ Release created successfully!" -ForegroundColor Green
    Write-Host "  Release ID: $($release.id)" -ForegroundColor Gray
    Write-Host "  URL: $($release.html_url)" -ForegroundColor Gray

    # Upload asset
    if (Test-Path $exePath) {
        Write-Host ""
        Write-Host "Uploading VideoMuter-Portable.exe..." -ForegroundColor Yellow

        $uploadUrl = $release.upload_url -replace '\{\?name,label\}', "?name=VideoMuter-Portable.exe"
        $fileBytes = [System.IO.File]::ReadAllBytes((Resolve-Path $exePath))

        $uploadHeaders = @{
            "Authorization" = "token $token"
            "Content-Type" = "application/octet-stream"
        }

        $uploadResult = Invoke-RestMethod -Uri $uploadUrl `
            -Method Post `
            -Headers $uploadHeaders `
            -Body $fileBytes

        Write-Host "✓ File uploaded successfully!" -ForegroundColor Green
        Write-Host "  Download URL: $($uploadResult.browser_download_url)" -ForegroundColor Gray
    } else {
        Write-Host "⚠ Warning: $exePath not found. Skipping file upload." -ForegroundColor Yellow
        Write-Host "  Please build first with: npm run build" -ForegroundColor Gray
    }

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Release v1.1.0 created successfully! 🎉" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "View release at: $($release.html_url)" -ForegroundColor White

} catch {
    Write-Host "✗ Error creating release:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red

    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
    exit 1
}
