"""Shared HTML email layout helpers used across appointment, contact, and admin emails."""
from __future__ import annotations

from html import escape

# ── Design tokens — light-mode only (forces light mode to avoid iOS dark mode inversion) ──
_BG          = "#F4EFE9"
_CARD_BG     = "#FFFFFF"
_GOLD        = "#C9A84C"
_GOLD_DARK   = "#9A7630"
_TEXT_DARK   = "#1A1008"
_TEXT_BODY   = "#4A3728"
_TEXT_MUTED  = "#7A6050"
_BORDER      = "#E2D5C8"
_ROW_ALT_BG  = "#FAF7F3"
_FOOTER_BG   = "#F0EAE2"

# ── Accent colours by email type ──
ACCENT_CONFIRMED   = "#C9A84C"  # gold — booking confirmed
ACCENT_RESCHEDULED = "#3D7E9E"  # steel blue — calm, informational
ACCENT_CANCELLED   = "#9B5068"  # rose-mauve — regretful but professional
ACCENT_FORFEITED   = "#B05A30"  # terracotta — firm policy enforcement
ACCENT_NOSHOW      = "#8B6840"  # bronze-brown — firm, neutral


def email_layout(
    *,
    preheader: str,
    title: str,
    intro: str,
    content: str,
    cta_label: str | None = None,
    cta_url: str | None = None,
    show_check: bool = False,
    accent_color: str = _GOLD,
    cta_text_color: str = _TEXT_DARK,
) -> str:

    check_html = ""
    if show_check:
        check_html = f"""
              <tr>
                <td align="center" style="padding: 0 0 20px 0;">
                  <table border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td bgcolor="{accent_color}" width="52" height="52"
                        style="border-radius: 26px; text-align: center; vertical-align: middle;
                               font-size: 26px; font-family: Arial, sans-serif; color: {cta_text_color};
                               line-height: 52px;">
                        &#10003;
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>"""

    _cta_style = (
        f"display: inline-block; background-color: {accent_color}; color: {cta_text_color}; "
        "font-family: Arial, sans-serif; font-size: 13px; font-weight: 700; "
        "letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; "
        "padding: 15px 36px; border-radius: 4px;"
    )

    cta_html = ""
    if cta_label and cta_url:
        cta_html = f"""
          <tr>
            <td align="center" style="padding: 8px 40px 36px 40px;">
              <table border="0" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td bgcolor="{accent_color}" style="border-radius: 4px; text-align: center;">
                    <a href="{escape(cta_url)}" target="_blank" style="{_cta_style}">
                      {escape(cta_label)}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 12px 0 0 0; font-family: Arial, sans-serif; font-size: 11px;
                line-height: 1.5; color: {_TEXT_MUTED}; text-align: center;">
                Use this link to view, reschedule, or cancel your appointment
                (available more than 24 hours before your appointment).
              </p>
            </td>
          </tr>"""

    return f"""<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>{escape(title)}</title>
    <style>
      :root {{ color-scheme: light; supported-color-schemes: light; }}
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: {_BG};
    -webkit-text-size-adjust: 100%; mso-line-height-rule: exactly;">

    <!-- Preheader (hidden) -->
    <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;
      font-size: 1px; line-height: 1px; opacity: 0; color: {_BG};">
      {escape(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
    </div>

    <!-- Outer wrapper -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0"
      bgcolor="{_BG}" style="background-color: {_BG};">
      <tr>
        <td align="center" style="padding: 36px 16px;">

          <!-- Card -->
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0"
            style="max-width: 580px; background-color: {_CARD_BG};
              border-radius: 6px; overflow: hidden;
              border: 1px solid {_BORDER};
              box-shadow: 0 2px 16px rgba(26, 16, 8, 0.10);">

            <!-- Accent bar -->
            <tr>
              <td bgcolor="{accent_color}" height="4" style="font-size: 0; line-height: 0;">&nbsp;</td>
            </tr>

            <!-- Header -->
            <tr>
              <td align="center" style="padding: 32px 40px 24px 40px;
                background-color: {_CARD_BG}; border-bottom: 1px solid {_BORDER};">
                <p style="margin: 0; font-family: Arial, sans-serif; font-size: 10px;
                  font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase;
                  color: {_GOLD_DARK};">
                  Grace Hair Beauty
                </p>
                <h1 style="margin: 12px 0 0 0; font-family: Georgia, 'Times New Roman', serif;
                  font-size: 26px; font-weight: 600; line-height: 1.2; color: {_TEXT_DARK};
                  letter-spacing: -0.01em;">
                  {escape(title)}
                </h1>
              </td>
            </tr>

            <!-- Intro -->
            <tr>
              <td style="padding: 28px 40px 8px 40px; background-color: {_CARD_BG};">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                  {check_html}
                  <tr>
                    <td>
                      <p style="margin: 0; font-family: Arial, sans-serif; font-size: 15px;
                        line-height: 1.65; color: {_TEXT_BODY};">
                        {escape(intro)}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Dynamic content -->
            {content}

            <!-- CTA -->
            {cta_html}

            <!-- Footer -->
            <tr>
              <td bgcolor="{_FOOTER_BG}" style="background-color: {_FOOTER_BG};
                border-top: 1px solid {_BORDER}; padding: 20px 40px; text-align: center;">
                <p style="margin: 0 0 4px 0; font-family: Arial, sans-serif; font-size: 12px;
                  font-weight: 700; color: {_TEXT_DARK}; letter-spacing: 0.04em;">
                  Grace Hair Beauty
                </p>
                <p style="margin: 0; font-family: Arial, sans-serif; font-size: 11px;
                  line-height: 1.6; color: {_TEXT_MUTED};">
                  Indianapolis, IN
                  &nbsp;&middot;&nbsp;
                  <a href="mailto:booking@gracehairsbeauty.com"
                    style="color: {_TEXT_MUTED}; text-decoration: none;">
                    booking@gracehairsbeauty.com
                  </a>
                </p>
              </td>
            </tr>

          </table>
          <!-- /Card -->

        </td>
      </tr>
    </table>
    <!-- /Outer wrapper -->

  </body>
</html>"""


def detail_row(label: str, value: str | None, alt: bool = False) -> str:
    if not value:
        return ""
    bg = f"background-color: {_ROW_ALT_BG};" if alt else f"background-color: {_CARD_BG};"
    return f"""
      <tr>
        <td style="{bg} padding: 12px 0; width: 40%; vertical-align: top;
          font-family: Arial, sans-serif; font-size: 11px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase; color: {_TEXT_MUTED};
          border-bottom: 1px solid {_BORDER};">
          {escape(label)}
        </td>
        <td style="{bg} padding: 12px 0 12px 16px; vertical-align: top;
          font-family: Arial, sans-serif; font-size: 14px; font-weight: 500;
          line-height: 1.4; color: {_TEXT_DARK};
          border-bottom: 1px solid {_BORDER};">
          {escape(value)}
        </td>
      </tr>"""


def details_table(rows: list[tuple[str, str | None]]) -> str:
    rendered_rows = "".join(
        detail_row(label, value, alt=(i % 2 == 1))
        for i, (label, value) in enumerate(rows)
    )
    return f"""
      <tr>
        <td style="padding: 16px 40px 24px 40px; background-color: {_CARD_BG};">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0"
            style="border-collapse: collapse; border-top: 1px solid {_BORDER};">
            {rendered_rows}
          </table>
        </td>
      </tr>"""
