# Master Dashboard Components

## Important: English-Only Policy

**The master dashboard is intentionally English-only and should NEVER be internationalized.**

### Reasons:
- Master dashboard is only used by system administrators and developers
- i18n adds unnecessary complexity, maintenance overhead, and disk usage
- Translation quality for technical admin interfaces is not critical
- Avoids wasting developer time on translating technical terminology
- Reduces bundle size and improves performance
- Eliminates potential translation bugs in critical admin functionality

### Technical Implementation:
- `MasterDashboard.tsx` uses hardcoded English strings only
- No `useDivineParsing`, `useLanguage`, or translation hooks allowed
- Spanish master locale file (`es/master.json`) is empty by design
- English master locale file (`en/master.json`) exists for build compatibility only

### For Future Developers:
- **DO NOT** add i18n to master dashboard components
- **DO NOT** use `t()` functions in `MasterDashboard.tsx`
- **DO NOT** translate master dashboard text
- If you need to modify text, do it directly in the component file
- Keep all master dashboard text in English only

### Components Affected:
- `MasterDashboard.tsx` - Main dashboard (English-only)
- Other master components may still use i18n if they serve multi-lingual users

This decision was made to optimize development efficiency and system performance for admin-only interfaces.
