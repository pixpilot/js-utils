---
'@pixpilot/mcp': minor
---

Make `search_utilities` results easier to trust: terms now match at word starts (`move` no longer matches `remove`), matches far weaker than the best one are dropped, each result lists its `matchedTerms`, and the response flags `unmatchedTerms` that no result covers. Adds the `queryTerms` export.
