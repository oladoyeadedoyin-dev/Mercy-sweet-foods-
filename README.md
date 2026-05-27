# Mercysweet Foods

Production website for Mercysweet Foods — natural tomato paste and pure honey, Ilorin, Nigeria.

## Stack
- Static HTML/CSS/JS — no build step required
- AVIF/WebP/JPG responsive images
- Service Worker (offline-capable, v8 cache)
- Google Fonts (non-blocking)
- GA4 analytics (idle-loaded)

## Structure
```
/
├── index.html          # Main page
├── css/styles.v8.css   # Deferred non-critical styles
├── js/app.v8.js        # Deferred JS (scroll, SW, analytics)
├── sw.js               # Service Worker
├── _headers            # Netlify security + cache headers
├── vercel.json         # Vercel headers + routing
├── .htaccess           # Apache/cPanel headers
├── robots.txt
├── sitemap.xml
└── assets/images/      # AVIF + WebP + JPG (480w, 768w, 900w)
```

## Before Deploying
1. Open `js/app.v8.js` line 295
2. Replace `G-XXXXXXXXXX` with your real GA4 Measurement ID

## Deploy
- **Netlify**: drag the folder to app.netlify.com
- **Vercel**: `vercel --prod`
- **cPanel**: upload via File Manager to `public_html/`

## Lighthouse Targets
- Performance: 97–99
- Accessibility: 99
- Best Practices: 100
- SEO: 100
