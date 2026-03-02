# 1vt

A vim-like terminal UI for [1Password](https://1password.com). Browse vaults, search items, and copy credentials — all without leaving the terminal.

Built with [Ink](https://github.com/vadimdemedes/ink) (React for CLI), powered by the [1Password CLI](https://developer.1password.com/docs/cli/).

```
 1vt > Private > Items (142)
─────────────────────────────────────────────────────────
   1  > [Login] GitHub                    github.com
   1    [Login] Gmail                     gmail.com
   2    [Pass]  AWS Root Key
   3    [Note]  Recovery Codes
   4    [Login] Netflix                   netflix.com
   5    [Card]  Visa *4242
   6    [Login] Twitter                   x.com
─────────────────────────────────────────────────────────
 NORMAL  j/k:nav  enter:open  /:search     3:142  Top
```

## Features

- **Vim motions** — `j`/`k`, `gg`/`G`, `Ctrl-d`/`Ctrl-u`, `H`/`M`/`L`, count prefixes (`5j`, `12G`)
- **Relative line numbers** — just like `:set relativenumber`
- **Fuzzy search** — press `/` to filter, `Enter` to lock the filter, `c` to clear
- **Copy anything** — `y` copies selected field, `p`/`u`/`t` for password/username/TOTP
- **Open in browser** — `o` opens the item URL
- **Fast** — vaults and item metadata are cached locally (AES-256-GCM encrypted, key stored in macOS Keychain). Secrets are never cached.
- **Full-screen** — uses the alternate terminal buffer, restores your terminal on exit

## Prerequisites

- [Node.js](https://nodejs.org) >= 18
- [1Password CLI](https://developer.1password.com/docs/cli/) (`op`) installed
- 1Password desktop app with **CLI integration enabled** (Settings > Developer)

## Install

```bash
# From source
git clone https://github.com/itelo/1vt.git
cd 1vt
pnpm install
pnpm dev
```

## Keybindings

### Navigation

| Key | Action |
|-----|--------|
| `j` / `↓` | Move down |
| `k` / `↑` | Move up |
| `gg` | Jump to first item |
| `G` | Jump to last item |
| `[n]G` | Jump to line n |
| `[n]j` / `[n]k` | Move n lines |
| `Ctrl-d` | Half-page down |
| `Ctrl-u` | Half-page up |
| `H` / `M` / `L` | Screen top / middle / bottom |
| `Enter` | Select / open |

### Search

| Key | Action |
|-----|--------|
| `/` | Start search |
| `Enter` | Finish search (keep filter) |
| `Esc` | Cancel search (clear filter) |
| `c` | Clear active filter |

### Item Detail

| Key | Action |
|-----|--------|
| `y` | Copy selected field |
| `p` | Copy password |
| `u` | Copy username |
| `t` | Copy TOTP |
| `o` | Open URL in browser |

### General

| Key | Action |
|-----|--------|
| `q` / `Esc` | Go back |
| `Q` | Quit from any screen |
| `R` | Clear cache and refresh |
| `Ctrl-c` | Force quit |

## Architecture

```
src/
├── cli.tsx                  # Entry point
├── app.tsx                  # Root component + global keybindings
├── screens/                 # Auth, vault list, item list, item detail
├── components/              # Fullscreen, ListView, Footer, Header
├── hooks/                   # useVimNavigation (motions + counts)
├── stores/                  # Zustand (navigation, data cache, UI state)
├── services/                # op CLI wrapper, clipboard, encrypted cache
└── lib/                     # Types, constants, formatting
```

- **No secrets on disk** — only vault names, item titles, categories, and URLs are cached. Passwords, TOTP seeds, and field values are fetched live from `op` each time.
- **Encrypted cache** — cached metadata is AES-256-GCM encrypted. The encryption key is stored in the macOS Keychain, never on the filesystem.
- **Async CLI calls** — all `op` commands run asynchronously via `execa`, keeping the UI responsive.

## License

MIT
