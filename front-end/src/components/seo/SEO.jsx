// src/components/seo/SEO.jsx
import React, { useEffect } from 'react';

const DEFAULT_TITLE = 'کلینیک تخصصی پستان دکتر نگار معشوری';
const DEFAULT_DESCRIPTION =
  'ارائه خدمات تخصصی جراحی پستان، انکوپلاستی، غربالگری و درمان بیماری‌های خوش‌خیم و بدخیم پستان توسط دکتر نگار معشوری.';
const SITE_URL = 'https://kamelion.ir';
const DEFAULT_IMAGE = `${SITE_URL}/pink-ribbon.svg`;

/**
 * Reusable SEO component for React 19 Native Document Metadata & Schema.org JSON-LD
 *
 * @param {string} title - Page specific title
 * @param {string} description - Meta description
 * @param {string} url - Canonical relative or absolute path
 * @param {string} image - Open Graph preview image URL
 * @param {string} type - 'website' | 'article'
 * @param {object} schema - Schema.org JSON-LD structured data
 * @param {boolean} noindex - If true, injects noindex, nofollow
 */
const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  url,
  image = DEFAULT_IMAGE,
  type = 'website',
  schema = null,
  noindex = false,
}) => {
  const fullTitle = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE;
  const currentUrl = url
    ? url.startsWith('http')
      ? url
      : `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`
    : typeof window !== 'undefined'
      ? window.location.href
      : SITE_URL;

  // Additional assurance for client-side document.title in older environments
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = fullTitle;
    }
  }, [fullTitle]);

  return (
    <>
      {/* 1. Document Title & Core Meta (Hoisted by React 19 to <head>) */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={currentUrl} />

      {/* 2. Robots Indexing Directive */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* 3. Open Graph (Facebook, WhatsApp, Telegram) */}
      <meta property="og:site_name" content={DEFAULT_TITLE} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* 4. Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* 5. Structured Data (JSON-LD) for Search Engines */}
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
    </>
  );
};

export default SEO;
