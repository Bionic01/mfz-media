# Shared free B-roll library (both channels)

`manifest.json` lists every stock clip we've collected: what it shows, category, source page, licence and a
1080p download link. The clip files themselves are too big for git: they live as 720p copies in the workspace at
`/home/claude/stock/<category>/` (a cache). If a session doesn't have them, re-download the clips a video needs
from `url_1080` (or re-run the build scripts). Licences: Mixkit Stock Video Free License and the Pexels License,
both free for YouTube and commercial use with no attribution required.

Add new clips with the build scripts so the manifest stays the single index. Search first: Pexels has no clips of
specific South African store brands (PEP, Ackermans, Shoprite, Takealot); those come from Rodney or are skipped.
