"""Shared HTML email layout helpers used across appointment, contact, and admin emails."""
from __future__ import annotations

from html import escape

CTA_STYLE = (
    "display: inline-block; background: #B8860B; color: #2C1810; "
    "font: 700 13px Arial, sans-serif; letter-spacing: .08em; text-transform: uppercase; "
    "text-decoration: none; padding: 14px 24px; border-radius: 999px; border: 1px solid #D4A843;"
)
OUTER_TABLE_STYLE = "background: #FAF6F0; margin: 0; padding: 32px 16px;"
CARD_STYLE = (
    "max-width: 640px; overflow: hidden; background: #FFFDF9; border: 1px solid #E4D9CE; "
    "border-radius: 18px; box-shadow: 0 18px 48px rgba(44, 24, 16, 0.12);"
)
EYEBROW_STYLE = (
    "font: 700 11px Arial, sans-serif; letter-spacing: .18em; text-transform: uppercase; color: #D4A843;"
)
TITLE_STYLE = (
    "margin: 12px 0 0 0; color: #FAF6F0; font-family: Georgia, 'Times New Roman', serif; "
    "font-size: 34px; line-height: 1.05; font-weight: 600;"
)
DETAIL_LABEL_STYLE = (
    "padding: 14px 0; color: #A07850; font: 700 11px Arial, sans-serif; "
    "letter-spacing: .08em; text-transform: uppercase; border-bottom: 1px solid #E4D9CE; width: 38%;"
)
DETAIL_VALUE_STYLE = (
    "padding: 14px 0; color: #2C1810; font: 600 15px/1.45 Arial, sans-serif; "
    "border-bottom: 1px solid #E4D9CE;"
)


def email_layout(
    *,
    preheader: str,
    title: str,
    intro: str,
    content: str,
    cta_label: str | None = None,
    cta_url: str | None = None,
) -> str:
    cta = ""
    if cta_label and cta_url:
        cta = f"""
          <tr>
            <td style="padding: 8px 32px 36px 32px; text-align: center;">
              <a href="{escape(cta_url)}" style="{CTA_STYLE}">
                {escape(cta_label)}
              </a>
            </td>
          </tr>
        """

    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{escape(title)}</title>
  </head>
  <body style="margin: 0; padding: 0; background: #FAF6F0;">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent;">
      {escape(preheader)}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="{OUTER_TABLE_STYLE}">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="{CARD_STYLE}">
            <tr>
              <td style="background: #2C1810; padding: 30px 32px; text-align: center;">
                <div style="{EYEBROW_STYLE}">
                  Grace Hair Beauty
                </div>
                <h1 style="{TITLE_STYLE}">
                  {escape(title)}
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px 32px 10px 32px;">
                <p style="margin: 0; color: #6B4226; font: 400 16px/1.65 Arial, sans-serif;">
                  {escape(intro)}
                </p>
              </td>
            </tr>
            {content}
            {cta}
            <tr>
              <td style="background: #F2EAE0; border-top: 1px solid #E4D9CE; padding: 22px 32px; text-align: center;">
                <p style="margin: 0; color: #6B4226; font: 400 12px/1.6 Arial, sans-serif;">
                  Grace Hair Beauty · Indianapolis, IN
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>"""


def detail_row(label: str, value: str | None) -> str:
    if not value:
        return ""
    return f"""
      <tr>
        <td style="{DETAIL_LABEL_STYLE}">
          {escape(label)}
        </td>
        <td style="{DETAIL_VALUE_STYLE}">
          {escape(value)}
        </td>
      </tr>
    """


def details_table(rows: list[tuple[str, str | None]]) -> str:
    rendered_rows = "".join(detail_row(label, value) for label, value in rows)
    return f"""
      <tr>
        <td style="padding: 14px 32px 30px 32px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
            {rendered_rows}
          </table>
        </td>
      </tr>
    """
