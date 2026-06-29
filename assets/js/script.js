(function() {
    'use strict';

    const menuData = [
        { id: 1, name: 'اسپرسو', desc: 'یک شات اصیل و غنی با کرمای مخملی.', price: 35000, category: 'hot-drinks', image: 'espresso.webp' },
        { id: 2, name: 'لاته', desc: 'شیرین و مخملی با میکروفوم ظریف.', price: 45000, category: 'hot-drinks', image: 'latte.webp' },
        { id: 3, name: 'آمریکانو', desc: 'ملایم، قوی و متعادل با طعمی پاک.', price: 38000, category: 'hot-drinks', image: 'americano.webp' },
        { id: 4, name: 'آیس لاته', desc: 'لاته سرد روی یخ با بافتی نرم و خنک.', price: 48000, category: 'cold-drinks', image: 'ice_latte.webp' },
        { id: 5, name: 'آیس آمریکانو', desc: 'آمریکانو سرد با طعمی قوی و نشاط‌بخش.', price: 40000, category: 'cold-drinks', image: 'ice_americano.webp' },
        { id: 6, name: 'موهیتو', desc: 'نوشیدنی گازدار با نعنا و لیموی تازه.', price: 42000, category: 'cold-drinks', image: 'mojito.webp' },
        { id: 7, name: 'کوکا', desc: 'نوشیدنی گازدار کلاسیک با یخ و لیمو.', price: 25000, category: 'cold-drinks', image: 'coca.webp' },
        { id: 8, name: 'ساندویچ بیکن', desc: 'بیکن برشته، کاهو، گوجه و سس مخصوص.', price: 75000, category: 'sandwich', image: 'bacon_sandwich.webp' },
        { id: 9, name: 'ساندویچ فیله مرغ', desc: 'فیله مرغ گریل شده با سبزیجات تازه.', price: 70000, category: 'sandwich', image: 'chicken_sandwich.webp' },
        { id: 10, name: 'ساندویچ سبزیجات', desc: 'سبزیجات گریل شده با پنیر و سس مخصوص.', price: 62000, category: 'sandwich', image: 'veggie_sandwich.webp' },
        { id: 11, name: 'چیزکیک جنگلی', desc: 'چیزکیک خامه‌ای با رویه توت‌های جنگلی.', price: 68000, category: 'desserts', image: 'cheesecake_forest.webp' },
        { id: 12, name: 'چیزکیک شکلاتی', desc: 'چیزکیک شکلاتی غنی و کرمی با پوسته بیسکوییتی.', price: 72000, category: 'desserts', image: 'cheesecake_chocolate.webp' },
        { id: 13, name: 'بستنی مخصوص', desc: 'بستنی وانیلی و شکلاتی با سس داغ و مغزیجات.', price: 55000, category: 'shake', image: 'special_icecream.webp' },
        { id: 14, name: 'شیک قهوه', desc: 'شیک خنک با طعم قهوه و خامه فرم گرفته.', price: 60000, category: 'shake', image: 'coffee_shake.webp' },
        { id: 15, name: 'شیک بادام زمینی', desc: 'شیک کرمی با بادام زمینی و شیر.', price: 58000, category: 'shake', image: 'peanut_shake.webp' }
    ];

    let activeFilters = new Set();
    let searchQuery = '';

    const productListEl = document.getElementById('productList');
    const searchInput = document.getElementById('searchInput');
    const desktopFilterFixed = document.getElementById('desktopFilterFixed');
    const mobileFilterGrid = document.getElementById('mobileFilterGrid');
    const fab = document.getElementById('fabFilter');
    const overlay = document.getElementById('bottomSheetOverlay');
    const sheet = document.getElementById('bottomSheet');
    const closeSheetBtn = document.getElementById('closeSheetBtn');
    let isSheetOpen = false;
    let searchTimeout = null;

    const categoryMeta = {
        'hot-drinks': { label: 'نوشیدنی گرم', icon: 'icon-hot' },
        'cold-drinks': { label: 'نوشیدنی سرد', icon: 'icon-cold' },
        'sandwich': { label: 'ساندویچ', icon: 'icon-sandwich' },
        'desserts': { label: 'دسر و کیک', icon: 'icon-dessert-cake' },
        'shake': { label: 'شیک و بستنی', icon: 'icon-shake' }
    };

    function getCategoryLabel(cat) { return categoryMeta[cat]?.label || cat; }
    function getCategoryIcon(cat) { return categoryMeta[cat]?.icon || 'icon-all'; }

    function render() {
        let filtered = menuData.filter(item => {
            const categoryMatch = (activeFilters.size === 0) || activeFilters.has(item.category);
            const query = searchQuery.toLowerCase().trim();
            const textMatch = query === '' || item.name.includes(query) || item.desc.includes(query);
            return categoryMatch && textMatch;
        });

        let html = '';
        let lastCategory = null;
        let firstItem = true;

        if (filtered.length === 0) {
            html = `
                <div class="empty-state">
                    <p>هیچ محصولی با این فیلترها یافت نشد.</p>
                    <p class="sub">می‌توانید فیلترهای دیگر را امتحان کنید یا جستجو را تغییر دهید.</p>
                    <button class="clear-filters-btn" id="clearFiltersBtn">پاک کردن همه فیلترها</button>
                </div>
            `;
            productListEl.innerHTML = html;
            document.getElementById('clearFiltersBtn')?.addEventListener('click', function() {
                activeFilters.clear();
                searchQuery = '';
                searchInput.value = '';
                render();
                updateFilterButtons();
            });
            updateFilterButtons();
            return;
        }

        filtered.forEach(item => {
            if (item.category !== lastCategory) {
                const iconId = getCategoryIcon(item.category);
                const label = getCategoryLabel(item.category);
                if (!firstItem) {
                    html += `<div class="divider-wrapper" data-category="${item.category}">
                                <div class="section-divider">
                                    <hr class="line">
                                    <span class="badge">
                                        <svg viewBox="0 0 24 24"><use href="#${iconId}"/></svg>
                                        ${label}
                                    </span>
                                    <hr class="line">
                                </div>
                             </div>`;
                } else {
                    html += `<div class="divider-wrapper" data-category="${item.category}">
                                <div class="section-divider">
                                    <hr class="line">
                                    <span class="badge">
                                        <svg viewBox="0 0 24 24"><use href="#${iconId}"/></svg>
                                        ${label}
                                    </span>
                                    <hr class="line">
                                </div>
                             </div>`;
                    firstItem = false;
                }
                lastCategory = item.category;
            }

            const priceFormatted = item.price.toLocaleString('fa-IR');
            html += `
                <div class="menu-item" data-category="${item.category}" data-id="${item.id}">
                    <div class="row g-0 align-items-center">
                        <div class="col-12 col-md-5">
                            <div class="hero-img-wrap loading" id="imgWrap-${item.id}">
                                <img src="assets/images/${item.image}" alt="${item.name}" loading="lazy" onload="this.parentElement.classList.remove('loading')" onerror="this.parentElement.classList.remove('loading')">
                                <span class="placeholder">در حال بارگذاری...</span>
                            </div>
                        </div>
                        <div class="col-12 col-md-7">
                            <div class="product-info">
                                <h3 class="product-name">${item.name}</h3>
                                <p class="product-desc">${item.desc}</p>
                                <span class="product-price">${priceFormatted} <span class="currency">تومان</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        productListEl.innerHTML = html;
        updateFilterButtons();

        document.querySelectorAll('.hero-img-wrap img').forEach(img => {
            img.addEventListener('load', function() { this.parentElement.classList.remove('loading'); });
            img.addEventListener('error', function() {
                this.parentElement.classList.remove('loading');
                this.style.display = 'none';
                const placeholder = this.parentElement.querySelector('.placeholder');
                if (placeholder) placeholder.textContent = 'تصویر موجود نیست';
            });
        });
    }

    function updateFilterButtons() {
        const isAllActive = (activeFilters.size === 0);

        const desktopBtns = desktopFilterFixed.querySelectorAll('.filter-btn-icon');
        desktopBtns.forEach(btn => {
            const filter = btn.dataset.filter;
            if (filter === 'all') {
                btn.classList.toggle('active', isAllActive);
                btn.setAttribute('aria-pressed', isAllActive ? 'true' : 'false');
                const tooltip = btn.querySelector('.tooltip-label');
                if (tooltip) tooltip.textContent = 'همه';
            } else {
                const isActive = activeFilters.has(filter);
                btn.classList.toggle('active', isActive);
                btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            }
        });

        const mobileBtns = mobileFilterGrid.querySelectorAll('.sheet-btn');
        mobileBtns.forEach(btn => {
            const filter = btn.dataset.filter;
            if (filter === 'all') {
                btn.classList.toggle('active', isAllActive);
                btn.setAttribute('aria-pressed', isAllActive ? 'true' : 'false');
            } else {
                const isActive = activeFilters.has(filter);
                btn.classList.toggle('active', isActive);
                btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            }
        });
    }

    function toggleFilter(category) {
        if (category === 'all') {
            activeFilters.clear();
        } else {
            if (activeFilters.has(category)) {
                activeFilters.delete(category);
            } else {
                activeFilters.add(category);
            }
        }
        render();
        saveState();
    }

    function handleSearch(e) {
        const value = e.target.value;
        if (searchTimeout) clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = value;
            render();
            saveState();
        }, 300);
    }

    function saveState() {
        try {
            localStorage.setItem('coffeeShopState', JSON.stringify({
                filters: Array.from(activeFilters),
                search: searchQuery
            }));
        } catch (e) {}
    }

    function loadState() {
        try {
            const raw = localStorage.getItem('coffeeShopState');
            if (!raw) return false;
            const state = JSON.parse(raw);
            if (state.filters) activeFilters = new Set(state.filters);
            if (state.search !== undefined) {
                searchQuery = state.search;
                searchInput.value = searchQuery;
            }
            return true;
        } catch (e) { return false; }
    }

    function openSheet() {
        isSheetOpen = true;
        overlay.classList.add('open');
        sheet.classList.add('open');
        document.body.style.overflow = 'hidden';
        const firstBtn = sheet.querySelector('.sheet-btn.active') || sheet.querySelector('.sheet-btn');
        if (firstBtn) setTimeout(() => firstBtn.focus(), 200);
        else setTimeout(() => closeSheetBtn.focus(), 200);
    }

    function closeSheet() {
        isSheetOpen = false;
        overlay.classList.remove('open');
        sheet.classList.remove('open');
        document.body.style.overflow = '';
        fab.focus();
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.currentTarget.click();
        }
    }

    desktopFilterFixed.addEventListener('click', function(e) {
        const btn = e.target.closest('.filter-btn-icon');
        if (!btn) return;
        toggleFilter(btn.dataset.filter);
    });
    desktopFilterFixed.querySelectorAll('.filter-btn-icon').forEach(btn => {
        btn.addEventListener('keydown', handleKeyDown);
    });

    mobileFilterGrid.addEventListener('click', function(e) {
        const btn = e.target.closest('.sheet-btn');
        if (!btn) return;
        toggleFilter(btn.dataset.filter);
    });
    mobileFilterGrid.querySelectorAll('.sheet-btn').forEach(btn => {
        btn.addEventListener('keydown', handleKeyDown);
    });

    searchInput.addEventListener('input', handleSearch);

    fab.addEventListener('click', function(e) {
        e.stopPropagation();
        isSheetOpen ? closeSheet() : openSheet();
    });
    fab.addEventListener('keydown', handleKeyDown);

    overlay.addEventListener('click', closeSheet);
    closeSheetBtn.addEventListener('click', closeSheet);
    closeSheetBtn.addEventListener('keydown', handleKeyDown);

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isSheetOpen) closeSheet();
    });

    const mediaQuery = window.matchMedia('(min-width: 768px)');
    mediaQuery.addEventListener('change', function(e) {
        if (e.matches && isSheetOpen) closeSheet();
    });

    function init() {
        const loaded = loadState();
        if (!loaded) {
            activeFilters.clear();
            searchQuery = '';
            searchInput.value = '';
        }
        render();
    }
    init();

})();