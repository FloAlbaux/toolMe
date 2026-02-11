"""Unit tests for email_client: SMTP (SSL / STARTTLS / skip STARTTLS) and dev fallback."""

import pytest
from unittest.mock import MagicMock, patch

from app.email_client import (
    _send_via_smtp,
    send_password_reset_email,
    send_verification_email,
)


def test_send_verification_email_no_smtp_returns_link():
    with patch("app.email_client.SMTP_HOST", ""):
        link = send_verification_email("u@example.com", "abc-token-123")
    assert link is not None
    assert "verify-email?token=abc-token-123" in link


def test_send_password_reset_email_no_smtp_returns_link():
    with patch("app.email_client.SMTP_HOST", ""):
        link = send_password_reset_email("u@example.com", "reset-token-456")
    assert link is not None
    assert "reset-password?token=reset-token-456" in link


def test_send_verification_email_via_smtp_ssl():
    with (
        patch("app.email_client.SMTP_HOST", "smtp.example.com"),
        patch("app.email_client.SMTP_USE_SSL", True),
        patch("app.email_client.SMTP_PORT", 465),
        patch("app.email_client.SMTP_FROM", "noreply@example.com"),
        patch("app.email_client.SMTP_USER", None),
        patch("app.email_client.smtplib.SMTP_SSL") as mock_ssl,
    ):
        mock_ssl.return_value.__enter__ = MagicMock(return_value=MagicMock())
        mock_ssl.return_value.__exit__ = MagicMock(return_value=False)
        link = send_verification_email("u@example.com", "tok")
    assert link is None
    mock_ssl.assert_called_once_with("smtp.example.com", 465)


def test_send_verification_email_via_smtp_with_starttls():
    mock_server = MagicMock()
    mock_server.__enter__ = MagicMock(return_value=mock_server)
    mock_server.__exit__ = MagicMock(return_value=False)
    with (
        patch("app.email_client.SMTP_HOST", "smtp.example.com"),
        patch("app.email_client.SMTP_USE_SSL", False),
        patch("app.email_client.SMTP_SKIP_STARTTLS", False),
        patch("app.email_client.SMTP_PORT", 587),
        patch("app.email_client.SMTP_FROM", "noreply@example.com"),
        patch("app.email_client.SMTP_USER", None),
        patch("app.email_client.smtplib.SMTP", return_value=mock_server),
    ):
        _send_via_smtp("u@example.com", "Subj", "plain", "<p>html</p>")
    mock_server.starttls.assert_called_once()


def test_send_verification_email_via_smtp_skip_starttls():
    mock_server = MagicMock()
    mock_server.__enter__ = MagicMock(return_value=mock_server)
    mock_server.__exit__ = MagicMock(return_value=False)
    with (
        patch("app.email_client.SMTP_HOST", "mailpit"),
        patch("app.email_client.SMTP_USE_SSL", False),
        patch("app.email_client.SMTP_SKIP_STARTTLS", True),
        patch("app.email_client.SMTP_PORT", 1025),
        patch("app.email_client.SMTP_FROM", "noreply@local"),
        patch("app.email_client.SMTP_USER", None),
        patch("app.email_client.smtplib.SMTP", return_value=mock_server),
    ):
        _send_via_smtp("u@example.com", "Subj", "plain", "<p>html</p>")
    mock_server.starttls.assert_not_called()


def test_send_password_reset_email_via_smtp_skip_starttls():
    mock_server = MagicMock()
    mock_server.__enter__ = MagicMock(return_value=mock_server)
    mock_server.__exit__ = MagicMock(return_value=False)
    with (
        patch("app.email_client.SMTP_HOST", "mailpit"),
        patch("app.email_client.SMTP_USE_SSL", False),
        patch("app.email_client.SMTP_SKIP_STARTTLS", True),
        patch("app.email_client.SMTP_PORT", 1025),
        patch("app.email_client.SMTP_FROM", "noreply@local"),
        patch("app.email_client.SMTP_USER", None),
        patch("app.email_client.smtplib.SMTP", return_value=mock_server),
    ):
        link = send_password_reset_email("u@example.com", "tok")
    assert link is None
    mock_server.starttls.assert_not_called()
