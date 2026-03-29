import asyncio
import httpx
from bs4 import BeautifulSoup
from typing import List
from utils.models import RawArticle
import logging

logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

ET_BASE = "https://economictimes.indiatimes.com"


async def fetch_topic_articles(slug: str, max_articles: int = 12) -> List[RawArticle]:
    """
    Fetch article listings from ET topic page.
    ET topic URLs follow: /topic/{slug}
    """
    url = f"{ET_BASE}/topic/{slug}"
    articles = []

    async with httpx.AsyncClient(headers=HEADERS, timeout=15, follow_redirects=True) as client:
        try:
            resp = await client.get(url)
            resp.raise_for_status()
        except Exception as e:
            logger.warning(f"Topic page fetch failed for {slug}: {e}")
            return []

        soup = BeautifulSoup(resp.text, "html.parser")

        # ET topic pages list articles in <div class="clr flt topicstry story_list">
        # Each story item has a headline link and date
        story_items = soup.select("div.story_list .story-box, div.topicstry .story-box, ul.stories li")

        # Fallback: grab all article links from the page
        if not story_items:
            links = soup.select("a[href*='/articleshow/'], a[href*='/news/']")
            seen = set()
            for a in links[:max_articles]:
                href = a.get("href", "")
                if href in seen or not href:
                    continue
                seen.add(href)
                full_url = href if href.startswith("http") else ET_BASE + href
                title = a.get_text(strip=True)
                if len(title) > 20:  # filter nav links
                    articles.append(RawArticle(url=full_url, title=title, date="", snippet=""))
        else:
            for item in story_items[:max_articles]:
                a_tag = item.select_one("a")
                if not a_tag:
                    continue
                href = a_tag.get("href", "")
                full_url = href if href.startswith("http") else ET_BASE + href
                title = a_tag.get_text(strip=True)
                date_el = item.select_one("time, .date-format, span.date")
                date = date_el.get_text(strip=True) if date_el else ""
                snippet_el = item.select_one("p, .story-synopsis")
                snippet = snippet_el.get_text(strip=True) if snippet_el else ""
                if title:
                    articles.append(RawArticle(url=full_url, title=title, date=date, snippet=snippet))

    # Now fetch full text for each article in parallel
    full_articles = await asyncio.gather(
        *[_fetch_article_body(a) for a in articles],
        return_exceptions=True
    )

    result = []
    for art in full_articles:
        if isinstance(art, RawArticle) and art.body:
            result.append(art)

    logger.info(f"Fetched {len(result)} articles for topic: {slug}")
    return result


async def _fetch_article_body(article: RawArticle) -> RawArticle:
    """Fetch full article body text from an ET article page."""
    await asyncio.sleep(0.8)  # polite delay

    async with httpx.AsyncClient(headers=HEADERS, timeout=15, follow_redirects=True) as client:
        try:
            resp = await client.get(article.url)
            resp.raise_for_status()
        except Exception as e:
            logger.warning(f"Article fetch failed {article.url}: {e}")
            return article

        soup = BeautifulSoup(resp.text, "html.parser")

        # ET article body is usually in <div class="artText"> or <div class="Normal">
        body_el = (
            soup.select_one("div.artText") or
            soup.select_one("div.article-body") or
            soup.select_one("div[class*='artBody']") or
            soup.select_one("section.article__content") or
            soup.select_one("div.Normal")
        )

        if body_el:
            # Remove script/style tags
            for tag in body_el(["script", "style", "figure", "aside"]):
                tag.decompose()
            article.body = body_el.get_text(separator=" ", strip=True)[:4000]  # cap at 4k chars

        # Extract publish date from meta tag if not already set
        if not article.date:
            meta_date = soup.select_one("meta[property='article:published_time']")
            if meta_date:
                article.date = meta_date.get("content", "")[:10]

        return article


def topic_to_slug(topic: str) -> str:
    """Convert user query to ET topic slug format."""
    return topic.lower().strip().replace(" ", "-")
