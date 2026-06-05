import { useEffect } from 'react';

const FALLBACK_SITE    = 'https://niteshg.com.np';
const FALLBACK_IMG     = `${FALLBACK_SITE}/og-image.png`;
const FALLBACK_TITLE   = 'Nitesh Ghimire | Penetration Tester & Security Researcher';
const FALLBACK_DESC    = 'Penetration Tester, Security Researcher & CTF Player from Nepal. CVEs, bug bounties, CTF write-ups, and cybersecurity insights.';
const FALLBACK_TWITTER = '@niteshghimire';

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
 * useGlobalSEO — call once in App.jsx to apply admin-panel SEO settings site-wide.
 * Individual pages override with useSEO().
 */
export function useGlobalSEO(seoConfig = {}) {
  useEffect(() => {
    const {
      metaTitle, metaDescription, keywords, ogImage,
      twitterHandle, siteUrl, googleVerification,
      bingVerification, robotsIndex,
    } = seoConfig;

    // Search engine verification codes
    if (googleVerification) setMeta('google-site-verification', googleVerification);
    if (bingVerification)   setMeta('msvalidate.01', bingVerification);
    if (keywords)           setMeta('keywords', keywords);

    // Robots indexing — admin controlled toggle
    setMeta('robots', robotsIndex === false ? 'noindex, nofollow' : 'index, follow');

    const twHandle = twitterHandle
      ? `@${twitterHandle.replace(/^@/, '')}`
      : FALLBACK_TWITTER;
    setMeta('twitter:site',    twHandle);
    setMeta('twitter:creator', twHandle);

    if (siteUrl) setCanonical(siteUrl);

    // Apply title/desc/image only if not already overridden by a page-level useSEO
    if (!document.title || document.title === FALLBACK_TITLE) {
      if (metaTitle) document.title = metaTitle;
    }
    if (ogImage)         setOG('og:image', ogImage);
    if (metaDescription) setMeta('description', metaDescription.slice(0, 160));
    setOG('og:site_name', 'Nitesh Ghimire Portfolio');
    setOG('og:locale', 'en_US');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(seoConfig)]);
}

/**
 * useSEO — sets all SEO/OG/Twitter meta + canonical + JSON-LD for a specific page.
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
  title = FALLBACK_TITLE,
  description = FALLBACK_DESC,
  keywords,
  canonical,
  image = FALLBACK_IMG,
  type = 'website',
  article,
  jsonLD,
} = {}) {
  useEffect(() => {
    const fullTitle = title.includes('Nitesh Ghimire') ? title : `${title} | Nitesh Ghimire`;
    const url       = canonical || window.location.href;
    const truncDesc = description.slice(0, 160);

    // ── Primary ──
    document.title = fullTitle;
    setMeta('description', truncDesc);
    if (keywords) setMeta('keywords', keywords);
    setMeta('author', 'Nitesh Ghimire');
    setCanonical(url);

    // ── Open Graph ──
    setOG('og:title',       fullTitle);
    setOG('og:description', truncDesc);
    setOG('og:type',        type);
    setOG('og:url',         url);
    setOG('og:image',       image);
    setOG('og:image:width',  '1200');
    setOG('og:image:height', '630');
    setOG('og:site_name',   'Nitesh Ghimire Portfolio');
    setOG('og:locale',      'en_US');

    // ── Article-specific OG ──
    if (article) {
      if (article.publishedTime) setOG('article:published_time', article.publishedTime);
      if (article.modifiedTime)  setOG('article:modified_time',  article.modifiedTime);
      (article.tags || []).forEach(tag => setOG('article:tag', tag));
    }

    // ── Twitter Card ──
    setMeta('twitter:card',        'summary_large_image');
    setMeta('twitter:title',       fullTitle);
    setMeta('twitter:description', truncDesc);
    setMeta('twitter:image',       image);

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
        url: FALLBACK_SITE,
        sameAs: [
          'https://github.com/niteshghimire0147',
          'https://www.linkedin.com/in/nitesh-ghimire-694104382/',
          'https://tryhackme.com/p/niteshghimire',
        ],
      },
      publisher: {
        '@type': 'Person',
        name: 'Nitesh Ghimire',
        url: FALLBACK_SITE,
      },
      ...(article?.publishedTime ? { datePublished: article.publishedTime } : {}),
      ...(article?.modifiedTime  ? { dateModified:  article.modifiedTime  } : {}),
    };
    setLD(ld);

    // Cleanup: restore defaults when component unmounts
    return () => {
      document.title = FALLBACK_TITLE;
      setMeta('description', FALLBACK_DESC);
      setCanonical(`${FALLBACK_SITE}/`);
    };
  }, [title, description, keywords, canonical, image, type]); // eslint-disable-line
}
