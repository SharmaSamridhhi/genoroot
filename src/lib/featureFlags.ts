// Plain source-of-truth toggles, not env vars — flip these directly and
// redeploy when you want to change them. No admin panel, no per-user
// override; that's more machinery than this app needs.

/** The interactive scalp SVG on the pattern question (Q4). Off by default —
 * reads as abstract line art rather than a scalp at a glance; the plain chip
 * picker every other multi-select question already uses is the fallback. */
export const ENABLE_SCALP_DIAGRAM = false;

/** Mic buttons + voice-interpretation suggestion UI everywhere they'd
 * otherwise appear (VoiceChipSelect, VoiceTextInput). A safety switch more
 * than a real toggle — flip off if Web Speech or the Groq route misbehaves
 * without ripping the feature out. */
export const ENABLE_VOICE = true;
