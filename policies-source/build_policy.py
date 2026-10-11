#!/usr/bin/env python3
"""Convert an ALETH policy .md master into a house-styled page. Text verbatim; only markup added."""
import re, sys, html, pathlib

HEAD_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} · ALETH Chemical Co</title>
<meta name="description" content="{desc}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="ALETH Chemical Co">
<meta property="og:title" content="{title} · ALETH Chemical Co">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="https://alethchemical.com/{slug}.html">
<meta property="og:image" content="https://alethchemical.com/assets/og-card.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://alethchemical.com/assets/og-card.jpg">
<meta name="twitter:title" content="{title} · ALETH Chemical Co">
<meta name="twitter:description" content="{desc}">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="styles.css?v=mist15">
</head>
<body>
<header class="site-header">
  <a class="wordmark" href="index.html">ALETH<small>CHEMICAL CO.</small></a>
  <nav class="site-nav">
    <a class="nav-link" href="products.html">The Thirteen</a>
    <a class="nav-link" href="house.html">House</a>
    <a class="nav-link" href="sds.html">SDS</a>
  </nav>
  <a class="cart-link" href="#">Cart (<span id="cartBadge">0</span>)</a>
</header>
<main class="wrap policy">
  <p class="kicker mono">Policies</p>
  <h1 class="policy-title">{h1}</h1>
  <p class="pol-meta mono">{meta}</p>
  <p class="pol-lede"><em>{lede}</em></p>
"""

FOOT_TMPL = """  <div class="pol-colophon">
    <p class="mono">ALETH Chemical Co. — alethchemical.com</p>
    <p class="pol-copy"><em>{copy}</em></p>
  </div>
</main>
{footer}
<script src="data.js"></script>
<script src="cart.js"></script>
</body>
</html>
"""

def inline(t):
    t = html.escape(t)
    t = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'(orders@alethchemical\.com|house@alethchemical\.com)',
               r'<a href="mailto:\1">\1</a>', t)
    return t

def convert(md_path, slug, title, h1, desc):
    raw = pathlib.Path(md_path).read_text().strip()
    lines = raw.split('\n')
    meta, lede, copy = '', '', ''
    body, i = [], 0
    # extract meta line, lede, copyright
    for ln in lines:
        m = re.match(r'\*\*Effective date:\*\*\s*(.+?)\s*·\s*\*\*Version:\*\*\s*(.+)', ln)
        if m:
            meta = f'Effective {m.group(1)} · Version {m.group(2)}'
    # lede = every standalone italic block before the first Article
    lede_parts = []
    for ln in lines:
        s = ln.strip()
        if s.startswith('## Article'): break
        if s.startswith('*') and s.endswith('*') and not s.startswith('**') and len(s) > 60:
            lede_parts.append(s.strip('*'))
    lede = lede_parts[0] if lede_parts else ''
    extra_ledes = lede_parts[1:]
    for ln in reversed(lines):
        s = ln.strip()
        if s.startswith('*©') and s.endswith('*'):
            copy = s.strip('*'); break
    # walk body
    out = []
    cur_list = None
    for ln in lines:
        s = ln.rstrip()
        st = s.strip()
        if not st or st == '---' or 'Effective date' in st: continue
        if st.lstrip('# ').startswith('ALETH CHEMICAL CO.'):
            continue
        if st == f'*{copy}*' or any(st == f'*{x}*' for x in [lede] + extra_ledes):
            continue
        am = re.match(r'## Article (\d+) — (.+)', st)
        if am:
            if cur_list: out.append('</ul>'); cur_list = None
            out.append(f'<section class="pol-art"><h2><span class="pol-art-n mono">Article {am.group(1)}</span><span class="pol-art-t">{html.escape(am.group(2))}</span></h2>')
            continue
        if st.startswith('- '):
            if not cur_list: out.append('<ul class="pol-list">'); cur_list = True
            out.append(f'<li>{inline(st[2:])}</li>')
            continue
        if cur_list: out.append('</ul>'); cur_list = None
        nm = re.match(r'\*\*([\d.]+)\*\*\s*(.*)', st)
        nb = re.match(r'\*\*([\d.]+)\s+(.+?)\*\*\s*(.*)', st)
        if nm:
            out.append(f'<p class="pol-p"><span class="pol-n">{nm.group(1)}</span><span>{inline(nm.group(2))}</span></p>')
        elif nb:
            out.append(f'<p class="pol-p"><span class="pol-n">{nb.group(1)}</span><span><strong>{inline(nb.group(2))}</strong> {inline(nb.group(3))}</span></p>')
        else:
            out.append(f'<p class="pol-p">{inline(st)}</p>')
    if cur_list: out.append('</ul>')
    # close article sections: re-open pattern — wrap by replacing section tags
    body = '\n  '.join(out)
    # close each section before the next opens
    body = body.replace('<section class="pol-art">', '</section><section class="pol-art">')
    if body.startswith('</section>'): body = body[len('</section>'):]
    body += '\n</section>'
    footer = pathlib.Path('/mnt/agents/output/app/shipping.html').read_text()
    ffoot = footer[footer.index('<footer'):footer.index('</footer>') + len('</footer>')]
    page = HEAD_TMPL.format(title=title, desc=desc, slug=slug, h1=h1, meta=meta, lede=lede) \
        + ('<p class="pol-lede pol-lede-2"><em>' + '</em><br><br><em>'.join(extra_ledes) + '</em></p>\n' if extra_ledes else '') + '  ' + body + '\n' \
        + FOOT_TMPL.format(copy=copy, footer=ffoot)
    pathlib.Path(f'/mnt/agents/output/app/{slug}.html').write_text(page)
    print('built', slug)

if __name__ == '__main__':
    convert('/mnt/agents/output/policies-source/01_RETURNS_AND_REFUNDS.md',
            'returns', 'Returns &amp; Refunds', 'Returns &amp; <em>Refunds.</em>',
            'All sales are final — and when the fault is ours or the failure is real, we make it right completely. The whole policy, in plain language.')
    convert('/mnt/agents/output/policies-source/06_PRODUCT_SAFETY.md',
            'safety', 'Product Safety &amp; Handling', 'Product Safety &amp; <em>Handling.</em>',
            'Read the label and the SDS before every use. Gloves, ventilation, test patches, storage, emergencies — the whole safety practice, in plain language.')
