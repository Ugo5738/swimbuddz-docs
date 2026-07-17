# Intro to Water Pilot Assets

This folder holds the working source and portrait exports for the corporate **Intro to Water** pilot one-pager.

## Files

| File                                              | Purpose                                                               | Status  |
| ------------------------------------------------- | --------------------------------------------------------------------- | ------- |
| `INTRO_TO_WATER_PILOT_OUTLINE.md`                 | Current source-of-truth outline for the pilot narrative and structure | Current |
| `build_pilot_assets.py`                           | Generator for the portrait DOCX/PDF exports                           | Current |
| `SwimBuddz_Intro_to_Water_Pilot_Outline.docx`     | Editable portrait version of the generic HR-review one-pager          | Current |
| `SwimBuddz_Intro_to_Water_Pilot_Outline.pdf`      | Portrait PDF export of the generic HR-review one-pager                | Current |
| `SwimBuddz_Intro_to_Water_Pilot_for_Nestuge.docx` | Editable portrait version tailored for Nestuge                        | Current |
| `SwimBuddz_Intro_to_Water_Pilot_for_Nestuge.pdf`  | Portrait PDF export tailored for Nestuge                              | Current |

## Review Notes

The designed exports now lead with the **why** before the operational details:

- physical wellbeing through low-impact cardio, mobility, and recovery
- mental decompression beyond the usual office, gym, or screen routine
- confidence and water-safety skills employees keep beyond work
- inclusion for adults who avoid water from fear, embarrassment, or limited access
- why a sponsored first experience helps employees feel the value before committing
- why HR gets a stronger participation signal after a pilot than after an announcement

The current operating model prices the corporate pilot as a **2-hour** session. Keep the designed exports, markdown outline, and corporate pricing docs aligned on that duration.

The prospect-facing exports are portrait A4 so they are easier to open from email, LinkedIn, WhatsApp, and mobile devices. The first row keeps the two value sections prominent; the operational details sit below them, followed by a short next-step callout.

## Layout Notes

Current PDF section-card alignment values:

- Section grid `VALIGN`: `TOP`
- Section grid `TOPPADDING`: `8`
- Section grid `BOTTOMPADDING`: `11`
- Section grid side padding: `7`

Current DOCX section-card alignment values:

- Section card vertical alignment: `WD_CELL_VERTICAL_ALIGNMENT.TOP`
- Section card margins: `top=200`, `bottom=170`
- Bullet line spacing: `1.05`

To regenerate the DOCX/PDF exports after copy changes:

```bash
cd docs/marketing/intro_to_water_pilot
python3 build_pilot_assets.py
or
/Users/i/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 build_pilot_assets.py
```

The generator requires `reportlab` and `python-docx`. In Codex Desktop, the bundled workspace Python already includes both.
