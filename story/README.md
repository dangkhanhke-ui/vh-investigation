# Writing VH dialogue scripts

Put each chapter in its own file in `story/dialogues/`. Every scene is a map of **stable node IDs**. A node has `id`, `speaker`, `text`, and either `choices` or `next`. A choice has `id`, `text`, `next`, optional `when`, and optional `effects`.

Condition keys: `allFlags`, `anyFlags`, `noFlags`, `evidence`. Effects: `flags`, `clearFlags`, `evidence`. The engine returns a new session instead of mutating the old one. Store its `nodeId`, `context`, and `history` in a future versioned save file.

The sample chapter-01 is **placeholder dialogue**, not VH canon. The dialogue engine and chapter scripts are **not connected to the current chat UI yet**; current gameplay remains unchanged. Wire them in after the actual investigator script and chat interaction requirements are approved. This avoids accidentally changing the existing bot.

To test in the browser console after loading the scripts:

`VHDialogueEngine.validate(VH_DIALOGUES.chapter01)` should return `[]`.

For production, client-side scripts are inspectable. Do not store secret plot twists or authoritative answer verification here if they must remain hidden from players.
