$pages = @(
    'bucket-list.html',
    'chat-profile.html',
    'chat.html',
    'confession-archive.html',
    'confessions.html',
    'coupons.html',
    'diary.html',
    'dice.html',
    'envelope-archive.html',
    'envelopes.html',
    'games.html',
    'jackpot.html',
    'lists.html',
    'market.html',
    'memory-game.html',
    'mine-game.html',
    'music.html',
    'notification-center.html',
    'profile.html',
    'scratch-game.html',
    'special-days.html',
    'theme-editor.html',
    'time-stats.html',
    'index.html'
)

$trackerTag = '<script type="module" src="time-tracker.js"></script>'

foreach ($page in $pages) {
    if (Test-Path $page) {
        $content = [System.IO.File]::ReadAllText($page, [System.Text.Encoding]::UTF8)
        
        # Check if tracker already added
        if ($content -notmatch 'time-tracker\.js') {
            if ($content -match '</body>') {
                $content = $content.Replace('</body>', "$trackerTag`n</body>")
                [System.IO.File]::WriteAllText($page, $content, [System.Text.Encoding]::UTF8)
                Write-Host "Added tracker to $page"
            } else {
                Write-Host "No </body> tag in $page"
            }
        } else {
            Write-Host "Tracker already exists in $page"
        }
    } else {
        Write-Host "File not found: $page"
    }
}
