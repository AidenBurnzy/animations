const heroOrbit = document.getElementById('heroOrbit');
const toggleBtn = document.getElementById('nextBtn');
const textElements = Array.from(document.querySelectorAll('.text'));
const infoCards = {
    websites: document.getElementById('websites-desc'),
    ai: document.getElementById('ai-desc'),
    auctus: document.getElementById('auctus-desc')
};
const mobileDetailContainer = document.getElementById('mobileDetail');
const mobileDetailContent = document.getElementById('mobileDetailContent');

const pageMap = {
    websites: 'websites.html',
    ai: 'ai.html',
    auctus: 'auctus.html'
};

const mobileDetailQuery = window.matchMedia('(max-width: 720px)');
const mobileDetailCache = new Map();
const mobileDetailStyles = new Map();
let mobileDetailRequestId = 0;

// Three-state cycle: auctus -> websites -> ai -> auctus
const states = ['auctus', 'websites', 'ai'];
let currentStateIndex = 0;
let activeFocus = states[currentStateIndex];

function applyFocusState(target) {
    if (heroOrbit) {
        heroOrbit.classList.remove('show-ai', 'show-auctus', 'show-websites');
        if (target === 'ai') {
            heroOrbit.classList.add('show-ai');
        } else if (target === 'auctus') {
            heroOrbit.classList.add('show-auctus');
        } else if (target === 'websites') {
            heroOrbit.classList.add('show-websites');
        }
    }

    if (toggleBtn) {
        toggleBtn.classList.toggle('is-active', target !== 'auctus');
    }

    Object.entries(infoCards).forEach(([key, card]) => {
        if (card) {
            card.classList.toggle('active', key === target);
        }
    });

    updateMobileDetail(target);
}

function toggleFocus() {
    currentStateIndex = (currentStateIndex + 1) % states.length;
    activeFocus = states[currentStateIndex];
    applyFocusState(activeFocus);
}

if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleFocus);
}

textElements.forEach((textEl) => {
    textEl.addEventListener('click', function() {
        const target = this.getAttribute('data-target');

        if (!target) {
            return;
        }

        if (activeFocus === target) {
            if (isMobileLayout()) {
                if (mobileDetailContainer) {
                    mobileDetailContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            } else {
                window.location.href = pageMap[target];
            }
            return;
        }

        const nextIndex = states.indexOf(target);
        if (nextIndex === -1) {
            return;
        }

        activeFocus = target;
        currentStateIndex = nextIndex;
        applyFocusState(target);
    });
});

function isMobileLayout() {
    return mobileDetailQuery.matches;
}

const MOBILE_EXCLUDED_SELECTORS = ['#navbar-placeholder', '.quick-links-bar', 'script', 'link', 'style', 'canvas'];

function shouldExcludeNode(node) {
    if (!node || typeof node.matches !== 'function') {
        return false;
    }

    return MOBILE_EXCLUDED_SELECTORS.some((selector) => {
        try {
            return node.matches(selector);
        } catch (error) {
            return false;
        }
    });
}

function buildMobileMarkup(doc, target) {
    const pageRoot = document.createElement('div');
    pageRoot.className = `mobile-detail__page mobile-detail__page--${target} page-root`;

    const bodyWrapper = document.createElement('div');
    bodyWrapper.className = 'page-body';

    Array.from(doc.body?.children || []).forEach((child) => {
        if (shouldExcludeNode(child)) {
            return;
        }

    bodyWrapper.appendChild(document.importNode(child, true));
    });

    pageRoot.appendChild(bodyWrapper);

    pageRoot.querySelectorAll('script, link[rel="stylesheet"], style').forEach((el) => el.remove());

    return pageRoot.outerHTML;
}

function shouldIncludeStylesheet(href, target) {
    if (!href) {
        return false;
    }

    const fileName = href.split('?')[0].split('#')[0].split('/').pop();
    if (!fileName) {
        return false;
    }

    return fileName.toLowerCase().includes(target);
}

async function fetchTextResource(path) {
    const url = new URL(path, window.location.href).toString();
    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
        throw new Error(`Failed to fetch resource: ${url}`);
    }

    return response.text();
}

function transformSelector(selector, scopeSelector) {
    if (!selector) {
        return null;
    }

    let scoped = selector.trim();

    if (!scoped) {
        return null;
    }

    scoped = scoped
        .replace(/:root/g, `${scopeSelector} .page-root`)
        .replace(/\bhtml\b/g, scopeSelector)
        .replace(/\bbody\b/g, `${scopeSelector} .page-body`);

    if (scoped.startsWith(scopeSelector) || scoped.startsWith('@')) {
        return scoped;
    }

    if (scoped.startsWith('::')) {
        return `${scopeSelector}${scoped}`;
    }

    return `${scopeSelector} ${scoped}`;
}

function fallbackScopeCss(cssText, scopeSelector) {
    const selectorRegex = /(^|})\s*([^@}{]+){/g;

    return cssText.replace(selectorRegex, (match, brace, selectorGroup) => {
        const selectors = selectorGroup
            .split(',')
            .map((selector) => selector.trim())
            .filter(Boolean)
            .map((selector) => {
                if (selector.startsWith(scopeSelector)) {
                    return selector;
                }

                if (selector.startsWith(':root')) {
                    return `${scopeSelector} .page-root${selector.slice(5)}`;
                }

                if (selector.startsWith('html')) {
                    return `${scopeSelector}${selector.slice(4)}`;
                }

                if (selector.startsWith('body')) {
                    return `${scopeSelector} .page-body${selector.slice(4)}`;
                }

                return `${scopeSelector} ${selector}`;
            })
            .join(', ');

        return `${brace} ${selectors} {`;
    });
}

function scopeCssRule(rule, scopeSelector) {
    const CSSRuleEnum = window.CSSRule;

    if (!CSSRuleEnum) {
        return rule.cssText;
    }

    switch (rule.type) {
        case CSSRuleEnum.STYLE_RULE: {
            const selectors = rule.selectorText
                .split(',')
                .map((sel) => transformSelector(sel, scopeSelector))
                .filter(Boolean);

            if (!selectors.length) {
                return '';
            }

            return `${selectors.join(', ')} { ${rule.style.cssText} }`;
        }
        case CSSRuleEnum.MEDIA_RULE: {
            const inner = Array.from(rule.cssRules)
                .map((innerRule) => scopeCssRule(innerRule, scopeSelector))
                .filter(Boolean)
                .join('\n');

            return inner ? `@media ${rule.conditionText} {\n${inner}\n}` : '';
        }
        case CSSRuleEnum.SUPPORTS_RULE: {
            const innerSupports = Array.from(rule.cssRules)
                .map((innerRule) => scopeCssRule(innerRule, scopeSelector))
                .filter(Boolean)
                .join('\n');

            return innerSupports ? `@supports ${rule.conditionText} {\n${innerSupports}\n}` : '';
        }
        case CSSRuleEnum.KEYFRAMES_RULE:
        case CSSRuleEnum.KEYFRAME_RULE:
        case CSSRuleEnum.FONT_FACE_RULE:
        case CSSRuleEnum.IMPORT_RULE:
            return rule.cssText;
        default:
            return rule.cssText;
    }
}

function scopeCssText(cssText, scopeSelector) {
    const styleEl = document.createElement('style');
    styleEl.textContent = cssText;
    document.head.appendChild(styleEl);

    const sheet = styleEl.sheet;
    let scoped = cssText;

    try {
        if (sheet && sheet.cssRules) {
            scoped = Array.from(sheet.cssRules)
                .map((rule) => scopeCssRule(rule, scopeSelector))
                .filter(Boolean)
                .join('\n');
        }
    } catch (error) {
        console.warn('Unable to scope stylesheet via CSSOM; applying fallback scoping.', error);
        scoped = fallbackScopeCss(cssText, scopeSelector);
    }

    document.head.removeChild(styleEl);
    return scoped;
}

async function buildScopedStyles(doc, target) {
    const styles = [];
    const scopeSelector = `.mobile-detail[data-page="${target}"]`;

    const stylesheetLinks = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));

    for (const link of stylesheetLinks) {
        const href = link.getAttribute('href');

        if (!shouldIncludeStylesheet(href, target)) {
            continue;
        }

        try {
            const cssText = await fetchTextResource(href);
            styles.push(scopeCssText(cssText, scopeSelector));
        } catch (error) {
            console.warn(`Failed to scope stylesheet ${href}`, error);
        }
    }

    Array.from(doc.querySelectorAll('style')).forEach((styleEl) => {
        const cssText = styleEl.textContent || '';
        if (cssText.trim()) {
            styles.push(scopeCssText(cssText, scopeSelector));
        }
    });

    return styles;
}

async function prepareMobilePage(target) {
    if (mobileDetailCache.has(target)) {
        return mobileDetailCache.get(target);
    }

    const source = pageMap[target];

    if (!source) {
        return null;
    }

    const response = await fetch(source, { cache: 'no-store' });

    if (!response.ok) {
        throw new Error(`Failed to load ${source}`);
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const markup = buildMobileMarkup(doc, target);
    const styles = await buildScopedStyles(doc, target);

    const pageData = { markup, styles };
    mobileDetailCache.set(target, pageData);
    return pageData;
}

function activateMobileStyles(target, styles) {
    mobileDetailStyles.forEach((styleEl, key) => {
        styleEl.disabled = key !== target;
    });

    if (!styles || !styles.length) {
        return;
    }

    if (mobileDetailStyles.has(target)) {
        mobileDetailStyles.get(target).disabled = false;
        return;
    }

    const styleEl = document.createElement('style');
    styleEl.dataset.mobileDetailStyle = target;
    styleEl.textContent = styles.join('\n');
    document.head.appendChild(styleEl);
    mobileDetailStyles.set(target, styleEl);
}

async function updateMobileDetail(target) {
    if (!isMobileLayout() || !mobileDetailContainer || !mobileDetailContent) {
        return;
    }

    const requestId = ++mobileDetailRequestId;
    mobileDetailContainer.dataset.page = target;
    mobileDetailContainer.classList.add('is-loading');

    try {
        const pageData = await prepareMobilePage(target);

        if (!pageData) {
            mobileDetailContainer.classList.remove('is-loading');
            return;
        }

        if (requestId !== mobileDetailRequestId) {
            return;
        }

        activateMobileStyles(target, pageData.styles);
        const shouldScroll = mobileDetailContent.innerHTML.trim().length > 0;
        mobileDetailContent.innerHTML = pageData.markup;

        if (isMobileLayout() && shouldScroll) {
            mobileDetailContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        requestAnimationFrame(() => {
            if (requestId === mobileDetailRequestId) {
                mobileDetailContainer.classList.remove('is-loading');
            }
        });
    } catch (error) {
        console.error('Failed to load mobile detail content', error);

        if (requestId === mobileDetailRequestId) {
            mobileDetailContainer.classList.remove('is-loading');
            mobileDetailContent.innerHTML = '<p class="mobile-detail__error">Unable to load this content right now. Please try again later.</p>';
        }
    }
}

const handleMobileQueryChange = (event) => {
    const matches = event && typeof event.matches === 'boolean' ? event.matches : isMobileLayout();

    if (matches) {
        updateMobileDetail(activeFocus);
    } else {
        mobileDetailRequestId += 1;
        if (mobileDetailContainer) {
            mobileDetailContainer.classList.remove('is-loading');
            mobileDetailContainer.removeAttribute('data-page');
        }

        if (mobileDetailContent) {
            mobileDetailContent.innerHTML = '';
        }

        mobileDetailStyles.forEach((styleEl) => {
            styleEl.disabled = true;
        });
    }
};

if (typeof mobileDetailQuery.addEventListener === 'function') {
    mobileDetailQuery.addEventListener('change', handleMobileQueryChange);
} else if (typeof mobileDetailQuery.addListener === 'function') {
    mobileDetailQuery.addListener(handleMobileQueryChange);
}

// Apply initial state
applyFocusState(activeFocus);

if (isMobileLayout()) {
    updateMobileDetail(activeFocus);
}