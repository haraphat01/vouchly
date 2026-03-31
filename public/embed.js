/**
 * vouchly Embed Widget
 * Usage: <script src="https://yourapp.com/embed.js" data-space="your-space-slug" async></script>
 */
(function () {
  'use strict';

  const script = document.currentScript || document.querySelector('script[data-space]');
  if (!script) return;

  const spaceSlug = script.getAttribute('data-space');
  const theme = script.getAttribute('data-theme') || 'light';
  const limit = parseInt(script.getAttribute('data-limit') || '6', 10);
  const layout = script.getAttribute('data-layout') || 'grid'; // grid | list | carousel

  if (!spaceSlug) {
    console.warn('[vouchly] Missing data-space attribute');
    return;
  }

  const BASE_URL = script.src.replace('/embed.js', '');

  // Create container
  const container = document.createElement('div');
  container.id = 'vouchly-widget';
  container.setAttribute('data-vouchly-space', spaceSlug);
  script.parentNode && script.parentNode.insertBefore(container, script.nextSibling);

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    #vouchly-widget {
      font-family: 'Georgia', serif;
      color: #1a1713;
      line-height: 1.6;
    }
    .pp-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 16px;
      margin: 0;
      padding: 0;
    }
    .pp-card {
      background: #fff;
      border: 1px solid #eceae6;
      border-radius: 12px;
      padding: 20px;
      position: relative;
    }
    .pp-quote-mark {
      position: absolute;
      top: 12px;
      left: 16px;
      font-size: 48px;
      line-height: 1;
      color: #faecd8;
      font-family: Georgia, serif;
    }
    .pp-stars {
      display: flex;
      gap: 3px;
      margin: 12px 0 10px;
    }
    .pp-star { color: #e8963a; font-size: 13px; }
    .pp-star-empty { color: #d5d1c9; font-size: 13px; }
    .pp-content {
      font-size: 14px;
      color: #3d3a35;
      margin: 0 0 16px;
      line-height: 1.65;
    }
    .pp-author {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .pp-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #faecd8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      color: #d4751f;
      flex-shrink: 0;
    }
    .pp-name { font-size: 13px; font-weight: 600; color: #1a1713; }
    .pp-role { font-size: 11px; color: #7a7367; }
    .pp-branding {
      text-align: center;
      margin-top: 16px;
      font-size: 11px;
      color: #b8b3a8;
    }
    .pp-branding a { color: #b8b3a8; text-decoration: none; }
    .pp-branding a:hover { color: #7a7367; }
    .pp-video {
      width: 100%;
      border-radius: 8px;
      margin: 12px 0 8px;
      display: block;
      background: #1a1713;
      max-height: 260px;
    }
    .pp-cta {
      display: inline-block;
      margin-top: 16px;
      padding: 8px 18px;
      background: #d4751f;
      color: white;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      font-family: inherit;
    }
    .pp-cta:hover { background: #b85c14; }
    .pp-loading { text-align: center; padding: 24px; color: #7a7367; font-size: 14px; }
  `;
  document.head.appendChild(style);

  // Fetch testimonials
  fetch(`${BASE_URL}/api/testimonials?spaceId=&status=approved`)
    .then(() => {
      // Fallback: fetch using wall endpoint
      return fetch(`${BASE_URL}/api/embed?space=${spaceSlug}&limit=${limit}`);
    })
    .catch(() => null);

  // Render widget with inline fetch
  async function render() {
    container.innerHTML = '<div class="pp-loading">Loading testimonials…</div>';

    try {
      // Use the wall API
      const res = await fetch(`${BASE_URL}/api/embed?space=${spaceSlug}&limit=${limit}`);
      if (!res.ok) throw new Error('Failed to load');
      const { testimonials, space } = await res.json();

      if (!testimonials || testimonials.length === 0) {
        container.innerHTML = '';
        return;
      }

      const brandColor = space?.theme_color || '#d4751f';
      // Update cta color
      style.textContent = style.textContent.replace(/#d4751f/g, brandColor).replace(/#b85c14/g, brandColor + 'cc');

      const cards = testimonials.map(t => {
        const initials = t.submitter_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        const stars = t.rating ? Array.from({ length: 5 }, (_, i) =>
          `<span class="${i < t.rating ? 'pp-star' : 'pp-star-empty'}">★</span>`
        ).join('') : '';
        const content = t.ai_enhanced_content || t.content || '';
        const role = [t.submitter_role, t.submitter_company].filter(Boolean).join(' · ');
        const videoHtml = t.video_url ? `<video class="pp-video" src="${t.video_url}" controls playsinline></video>` : '';

        return `<div class="pp-card">
          <span class="pp-quote-mark">"</span>
          ${stars ? `<div class="pp-stars">${stars}</div>` : ''}
          ${videoHtml}
          ${content ? `<p class="pp-content">${escapeHtml(content)}</p>` : ''}
          <div class="pp-author">
            <div class="pp-avatar" style="background:${brandColor}22;color:${brandColor}">${initials}</div>
            <div>
              <div class="pp-name">${escapeHtml(t.submitter_name)}</div>
              ${role ? `<div class="pp-role">${escapeHtml(role)}</div>` : ''}
            </div>
          </div>
        </div>`;
      }).join('');

      container.innerHTML = `
        <div class="pp-grid">${cards}</div>
        <div style="text-align:center;margin-top:20px">
          <a href="${BASE_URL}/collect/${spaceSlug}" target="_blank" class="pp-cta">Leave a testimonial</a>
        </div>
        ${space.removeBranding ? '' : `<div class="pp-branding">Powered by <a href="${BASE_URL}" target="_blank">vouchly</a></div>`}
      `;
    } catch (e) {
      container.innerHTML = '';
    }
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  render();
})();
