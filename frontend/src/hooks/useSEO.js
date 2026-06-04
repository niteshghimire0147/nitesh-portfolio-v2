import { useEffect } from 'react';

const SITE = 'https://niteshg.com.np';
const DEFAULT_IMG = `${SITE}/og-image.png`;
const DEFAULT_TITLE = 'Nitesh Ghimire | Penetration Tester & Security Researcher';
const DEFAULT_DESC = 'Penetration Tester, Security Researcher & CTF Player from Nepal. CVEs, bug bounties, CTF write-ups, and cybersecurity insights.';

function setMeta(name, content) {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
  el.setAttribute('content', content);
}

function setOG(property, content) {
  if (!content) return;
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el); }
  el.setAttribute('content', content);
}

function setCanonical(url) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) { el = document.createElement('link'); el.setAttribute('rel', 'canonical'); document.head.appendChild(el); }
  el.setAttribute('href', url);
}

function setLD(data) {
  let el = document.getElementById('ld-json');
  if (!el) { el = document.createElement('script'); el.id = 'ld-json'; el.type = 'application/ld+json'; document.head.appendChild(el); }
  el.textContent = JSON.stringify(data);
}

/**
 * useSEO — sets all SEO/OG/Twitter meta + canonical + JSON-LD.
 *
 * @param {object} opts
 * @param {string}  opts.title        - Page <title>
 * @param {string}  opts.description  - Meta description (≤160 chars)
 * @param {string}  [opts.keywords]   - Comma-separated keywords
 * @param {string}  [opts.canonical]  - Canonical URL (defaults to current URL)
 * @param {string}  [opts.image]      - OG image URL
 * @param {string}  [opts.type]       - OG type ('website' | 'article')
 * @param {object}  [opts.article]    - { publishedTime, modifiedTime, tags[] }
 * @param {object}  [opts.jsonLD]     - Override full JSON-LD object
 */
export function useSEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESC,
  keywords,
  canonical,
  image = DEFAULT_IMG,
  type = 'website',
  article,
  jsonLD,
} = {}) {
  useEffect(() => {
    const fullTitle = title.includes('Nitesh Ghimire') ? title : `${title} | Nitesh Ghimire`;
    const url = canonical || window.location.href;
    const truncDesc = description.slice(0, 160);

    // ── Primary ──
    document.title = fullTitle;
    setMeta('description', truncDesc);
    if (keywords) setMeta('keywords', keywords);
    setMeta('robots', 'index, follow');
    setMeta('author', 'Nitesh Ghimire');
    setCanonical(url);

    // ── Open Graph ──
    setOG('og:title', fullTitle);
    setOG('og:description', truncDesc);
    setOG('og:type', type);
    setOG('og:url', url);
    setOG('og:image', image);
    setOG('og:image:width', '1200');
    setOG('og:image:height', '630');
    setOG('og:site_name', 'Nitesh Ghimire Portfolio');
    setOG('og:locale', 'en_US');

    // ── Article-specific OG ──
    if (article) {
      if (article.publishedTime) setOG('article:published_time', article.publishedTime);
      if (article.modifiedTime)  setOG('article:modified_time',  article.modifiedTime);
      (article.tags || []).forEach(tag => setOG('article:tag', tag));
    }

    // ── Twitter Card ──
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', truncDesc);
    setMeta('twitter:image', image);
    setMeta('twitter:site', '@niteshghimire');
    setMeta('twitter:creator', '@niteshghimire');

    // ── JSON-LD Structured Data ──
    const ld = jsonLD || {
      '@context': 'https://schema.org',
      '@type': type === 'article' ? 'Article' : 'WebPage',
      name: fullTitle,
      description: truncDesc,
      url,
      image,
      author: {
        '@type': 'Person',
        name: 'Nitesh Ghimire',
        url: SITE,
        sameAs: [
          'https://github.com/niteshghimire0147',
          'https://www.linkedin.com/in/nitesh-ghimire-694104382/',
          'https://tryhackme.com/p/niteshghimire',
        ],
      },
      publisher: {
        '@type': 'Person',
        name: 'Nitesh Ghimire',
        url: SITE,
      },
      ...(article?.publishedTime ? { datePublished: article.publishedTime } : {}),
      ...(article?.modifiedTime  ? { dateModified:  article.modifiedTime  } : {}),
    };
    setLD(ld);

    // Cleanup: restore defaults when component unmounts
    return () => {
      document.title = DEFAULT_TITLE;
      setMeta('description', DEFAULT_DESC);
      setCanonical(`${SITE}/`);
    };
  }, [title, description, keywords, canonical, image, type]); // eslint-disable-line
}
