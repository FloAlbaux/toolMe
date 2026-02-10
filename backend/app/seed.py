"""Seed default projects if the table is empty."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import Project

SEED_PROJECTS = [
    {
        "id": "1",
        "title": "Community recipe wiki",
        "domain": "Documentation",
        "short_description": "Help build a small wiki of open recipes with clear licensing.",
        "full_description": "We are building a small, open wiki where anyone can contribute recipes under a clear permissive license (CC-BY or similar). Your mission: help structure a few core pages (soups, breads, seasonal), add or improve 2–3 recipes with clear attribution, and suggest a simple licensing notice for the site. No coding required unless you want to improve the wiki template.",
        "deadline": "2026-03-15",
        "delivery_instructions": "Share the link to your contributed pages or a short summary in a single document (PDF or Markdown).",
    },
    {
        "id": "2",
        "title": "Local event calendar",
        "domain": "Web app",
        "short_description": "A simple calendar to list and share local meetups and workshops.",
        "full_description": "A simple web app to list and share local events (meetups, workshops, small conferences). We need help designing the data model (event title, date, place, link, tags), drafting the first version of the UI (list + optional calendar view), and writing a short contribution guide so others can add events. Tech stack is flexible (static site, small backend, or spreadsheet-backed).",
        "deadline": "2026-04-01",
        "delivery_instructions": "Provide a repo link or prototype URL plus a one-page contribution guide.",
    },
    {
        "id": "3",
        "title": "Accessibility audit template",
        "domain": "Tooling",
        "short_description": "Create a reusable checklist for auditing small websites for a11y.",
        "full_description": "Create a reusable checklist (and optionally a simple report template) for auditing small websites for accessibility. It should cover: keyboard navigation, focus visibility, contrast, headings and landmarks, images and alt text, forms and labels. The deliverable should be easy to use by non-experts and compatible with WCAG 2.1 Level A/AA where applicable.",
        "deadline": "2026-03-31",
        "delivery_instructions": "Deliver a Markdown or PDF checklist and, if you like, a short \"how to use\" guide.",
    },
]


async def seed_if_empty(db: AsyncSession) -> None:
    result = await db.execute(select(Project).limit(1))
    if result.scalar_one_or_none() is not None:
        return
    for data in SEED_PROJECTS:
        project = Project(**data)
        db.add(project)
    await db.flush()
    await db.commit()
