# Protected paths

- Update list: `.protected-paths` (repo-relative). Lines ending with `/` are treated as directories.
- Local guard: pre-commit blocks deletions/renames of protected files/dirs.
- OS guard: `scripts/protect.sh` applies `chattr +i` to files (not directories). Use `scripts/unprotect.sh <path>` to unlock, edit, then `scripts/protect.sh` to re-lock.
- CI guard: `.github/workflows/protected-paths.yml` fails if any protected path is missing.
- Clean safely: `scripts/clean.sh` uses `git clean -fdX` to remove ignored artifacts only.

## Typical update flow

1. `bash scripts/unprotect.sh <path>`
2. Edit the file
3. `bash scripts/protect.sh`
