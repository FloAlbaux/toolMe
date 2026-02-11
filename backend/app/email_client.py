"""Send emails (verification, password reset). SMTP from config; if not set, log + optional file (dev)."""

import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.config import (
    EMAIL_DEV_FILE,
    FRONTEND_URL,
    SMTP_FROM,
    SMTP_HOST,
    SMTP_PASSWORD,
    SMTP_PORT,
    SMTP_SKIP_STARTTLS,
    SMTP_USE_SSL,
    SMTP_USER,
)

logger = logging.getLogger(__name__)


def _dev_fallback(url: str, kind: str) -> None:
    """When SMTP not configured: log and optionally write link to a file."""
    logger.info(
        "SMTP not configured; %s link (dev only): %s",
        kind,
        url,
    )
    if EMAIL_DEV_FILE:
        try:
            with open(EMAIL_DEV_FILE, "a", encoding="utf-8") as f:
                f.write(f"[ToolMe] {kind}: {url}\n")
        except OSError as e:
            logger.warning("Could not write to EMAIL_DEV_FILE %s: %s", EMAIL_DEV_FILE, e)


def _send_via_smtp(to_email: str, subject: str, body_plain: str, body_html: str) -> None:
    """Send one email via SMTP. Uses SSL (port 465) or STARTTLS (587)."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = SMTP_FROM
    msg["To"] = to_email
    msg.attach(MIMEText(body_plain, "plain"))
    msg.attach(MIMEText(body_html, "html"))

    if SMTP_USE_SSL:
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
            if SMTP_USER and SMTP_PASSWORD:
                server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM, [to_email], msg.as_string())
    else:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            if not SMTP_SKIP_STARTTLS:
                server.starttls()
            if SMTP_USER and SMTP_PASSWORD:
                server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM, [to_email], msg.as_string())


def send_verification_email(to_email: str, verification_token: str) -> str | None:
    """Send account activation link. Returns the link if not sent (no SMTP), so caller can expose it in dev."""
    verify_url = f"{FRONTEND_URL.rstrip('/')}/verify-email?token={verification_token}"
    subject = "ToolMe – Activate your account"
    body_plain = (
        f"Welcome to ToolMe!\n\n"
        f"Click the link below to activate your account (valid for 24 hours):\n{verify_url}\n\n"
        "If you didn't create this account, you can ignore this email."
    )
    body_html = (
        f"<p>Welcome to ToolMe!</p>"
        f"<p><a href=\"{verify_url}\">Activate your account</a> (link valid for 24 hours).</p>"
        f"<p>If you didn't create this account, you can ignore this email.</p>"
    )

    if not SMTP_HOST:
        _dev_fallback(verify_url, "verification")
        return verify_url

    try:
        _send_via_smtp(to_email, subject, body_plain, body_html)
        logger.info("Verification email sent to %s", to_email)
        return None
    except Exception as e:
        logger.exception("Failed to send verification email: %s", e)
        raise


def send_password_reset_email(to_email: str, reset_token: str) -> str | None:
    """Send password reset link. Returns the link if not sent (no SMTP), so caller can expose it in dev."""
    reset_url = f"{FRONTEND_URL.rstrip('/')}/reset-password?token={reset_token}"
    subject = "ToolMe – Reset your password"
    body_plain = (
        f"You requested a password reset for ToolMe.\n\n"
        f"Click the link below to set a new password (valid for 1 hour):\n{reset_url}\n\n"
        "If you didn't request this, you can ignore this email."
    )
    body_html = (
        f"<p>You requested a password reset for ToolMe.</p>"
        f"<p><a href=\"{reset_url}\">Set a new password</a> (link valid for 1 hour).</p>"
        f"<p>If you didn't request this, you can ignore this email.</p>"
    )

    if not SMTP_HOST:
        _dev_fallback(reset_url, "password reset")
        return reset_url

    try:
        _send_via_smtp(to_email, subject, body_plain, body_html)
        logger.info("Password reset email sent to %s", to_email)
        return None
    except Exception as e:
        logger.exception("Failed to send password reset email: %s", e)
        raise
