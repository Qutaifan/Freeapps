#Requires -Version 5.1
<#
.SYNOPSIS
  Installs agent skills for THEHUB via the `npx skills` CLI.

.DESCRIPTION
  Matches the existing project pattern: skills land in .claude\skills\<name>\SKILL.md
  and are recorded in skills-lock.json (already tracking `programmatic-seo`).

  Only installs things that are actually SKILLS. MCP servers, Claude Code plugins,
  and SDK platforms are deliberately out of scope -- see NOTES at the bottom.

  Reversible: delete .claude\skills\<name> and remove its skills-lock.json entry.

.PARAMETER DryRun
  Print the commands without running them.

.PARAMETER Include
  Extra optional sets to install. Valid: caveman

.EXAMPLE
  .\scripts\install-skills.ps1 -DryRun
.EXAMPLE
  .\scripts\install-skills.ps1
.EXAMPLE
  .\scripts\install-skills.ps1 -Include caveman
#>

[CmdletBinding()]
param(
    [switch]$DryRun,
    [ValidateSet('caveman')]
    [string[]]$Include = @()
)

$ErrorActionPreference = 'Stop'

# --- resolve repo root (script lives in <root>\scripts) -----------------------
$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot
Write-Host "repo root : $RepoRoot" -ForegroundColor DarkGray

if (-not (Test-Path (Join-Path $RepoRoot 'skills-lock.json'))) {
    throw "skills-lock.json not found in $RepoRoot -- wrong directory?"
}

# --- preflight ---------------------------------------------------------------
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) { throw "Node.js not found on PATH. Install Node 18+ and retry." }

$nodeMajor = [int](((& node --version) -replace '^v', '') -split '\.')[0]
if ($nodeMajor -lt 18) { throw "Node $nodeMajor found; the skills CLI needs 18+." }
Write-Host "node      : $(& node --version)" -ForegroundColor DarkGray

# --- the install set ---------------------------------------------------------
# Each entry: Repo = <owner/repo>, Skills = names it drops into .claude\skills
$targets = @(
    [pscustomobject]@{
        Key    = 'obsidian'
        Repo   = 'kepano/obsidian-skills'
        Skills = @('obsidian-markdown', 'obsidian-bases', 'json-canvas', 'obsidian-cli', 'defuddle')
        Why    = 'Obsidian vault at MY-NOTES\ + defuddle for clean web->markdown extraction'
    }
)

if ($Include -contains 'caveman') {
    $targets += [pscustomobject]@{
        Key    = 'caveman'
        Repo   = 'JuliusBrussee/caveman'
        Skills = @('caveman')
        Why    = 'Output-token compression (see NOTES -- may be net-negative here)'
    }
}

# --- snapshot before ---------------------------------------------------------
$skillsDir = Join-Path $RepoRoot '.claude\skills'
$before = @()
if (Test-Path $skillsDir) {
    $before = @(Get-ChildItem $skillsDir -Directory | Select-Object -ExpandProperty Name)
}
Write-Host "installed : $($before.Count) skill(s) -- $($before -join ', ')" -ForegroundColor DarkGray
Write-Host ''

# --- install -----------------------------------------------------------------
foreach ($t in $targets) {
    Write-Host "==> $($t.Repo)" -ForegroundColor Cyan
    Write-Host "    $($t.Why)" -ForegroundColor DarkGray

    $cmd = "npx --yes skills add $($t.Repo) --yes"

    if ($DryRun) {
        Write-Host "    [dry-run] $cmd" -ForegroundColor Yellow
        continue
    }

    & npx --yes skills add $t.Repo --yes
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "  '$($t.Repo)' exited with code $LASTEXITCODE -- continuing."
    }
    Write-Host ''
}

if ($DryRun) {
    Write-Host 'Dry run complete. Nothing was written.' -ForegroundColor Yellow
    return
}

# --- verify (explicit numeric output, no test that cannot fail) --------------
Write-Host '--- verification ---' -ForegroundColor Cyan

$after = @()
if (Test-Path $skillsDir) {
    $after = @(Get-ChildItem $skillsDir -Directory | Select-Object -ExpandProperty Name)
}
$added = @($after | Where-Object { $before -notcontains $_ })

Write-Host ("skills before : {0}" -f $before.Count)
Write-Host ("skills after  : {0}" -f $after.Count)
Write-Host ("newly added   : {0} -- {1}" -f $added.Count, ($added -join ', '))

$expected = $targets | ForEach-Object { $_.Skills } | Sort-Object -Unique
$missing = @($expected | Where-Object { $after -notcontains $_ })

foreach ($name in $expected) {
    $md = Join-Path $skillsDir "$name\SKILL.md"
    if (Test-Path $md) {
        $bytes = (Get-Item $md).Length
        Write-Host ("  OK   {0,-22} SKILL.md {1} bytes" -f $name, $bytes) -ForegroundColor Green
    }
    else {
        Write-Host ("  MISS {0,-22} no SKILL.md at {1}" -f $name, $md) -ForegroundColor Red
    }
}

$lock = Get-Content (Join-Path $RepoRoot 'skills-lock.json') -Raw | ConvertFrom-Json
$lockNames = @($lock.skills.PSObject.Properties.Name)
Write-Host ("skills-lock.json entries: {0} -- {1}" -f $lockNames.Count, ($lockNames -join ', '))

Write-Host ''
if ($missing.Count -eq 0) {
    Write-Host "PASS - all $($expected.Count) expected skills present." -ForegroundColor Green
}
else {
    Write-Host "FAIL - $($missing.Count) missing: $($missing -join ', ')" -ForegroundColor Red
    exit 1
}

Write-Host ''
Write-Host 'Restart your agent session to pick up the new skills.' -ForegroundColor DarkGray

<#
NOTES -- what was deliberately NOT installed here, and why.

  codebase-memory-mcp (DeusData)
    An MCP server, not a skill. Ships a native binary, writes into agent config
    files, and installs lifecycle hooks. It indexes source code into a knowledge
    graph -- THEHUB is mostly static .html, so the payoff is small. Its own README
    notes Microsoft Defender may flag the binary as a false positive.
    If you still want it:  irm https://raw.githubusercontent.com/DeusData/codebase-memory-mcp/main/install.ps1 -OutFile cbm.ps1
                           # read cbm.ps1 first, then:  Unblock-File .\cbm.ps1 ; .\cbm.ps1

  composio (ComposioHQ)
    An SDK / hosted integration platform. Needs an API key plus per-app OAuth.
    You already have Gmail, Drive, Calendar, Notion and Slack connected natively,
    so this mostly duplicates what you have.

  oh-my-claudecode (Yeachan-Heo)
    A Claude Code plugin, not a skill. Requires tmux (on Windows: psmux or WSL2).
    Adds autonomous multi-agent autopilot loops -- weigh that against the branch
    protection and PR-verification policy on main.
    If you still want it, from inside a Claude Code session:
      /plugin marketplace add https://github.com/Yeachan-Heo/oh-my-claudecode
      /plugin install oh-my-claudecode
      /setup

  caveman (JuliusBrussee) -- optional, off by default
    The skill compresses OUTPUT tokens only and adds roughly 1-1.5k input tokens
    per turn (its own HONEST-NUMBERS.md says so). Your prompts already enforce
    terse output, so the marginal gain is small and can go net-negative.
    The separate caveman proxy/engine is BSL-1.1, not OSI open source -- relevant
    if THEHUB ever writes about it.
#>
