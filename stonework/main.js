import '../src/index.css';

const worksList = document.getElementById('works-list');
const worksMoreButton = document.getElementById('works-more');
const apiKey = import.meta.env.VITE_MICROCMS_API_KEY;
const initialWorksCount = 5;
const worksPerLoad = 10;
let allWorks = [];
let visibleWorksCount = initialWorksCount;

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\//g, '.');
};

const imageMarkup = (image, label, stoneType) => {
  if (!image?.url) return '';
  const alt = `${stoneType || '天然石'}の${label}写真｜過去の加工一覧`;
  return `<figure class="flex flex-col gap-2">
    <figcaption class="text-[10px] tracking-widest text-stone-400 bg-stone-100 self-start px-2 py-1 rounded-sm">${label}</figcaption>
    <img src="${escapeHtml(image.url)}?w=1200" class="w-full h-auto rounded-sm object-cover bg-stone-100" loading="lazy" alt="${escapeHtml(alt)}">
  </figure>`;
};

const renderWork = (work) => {
  const dateValue = work.date || work.publishedAt || work.createdAt;
  const date = formatDate(dateValue);
  const stoneType = escapeHtml(work.stone_type || work.title || '加工実績');
  const processingType = escapeHtml(work.processing_type || '天然石加工');
  const imageItems = [
    imageMarkup(work.image_before, 'BEFORE', stoneType),
    imageMarkup(work.image_after, 'AFTER', stoneType),
  ].filter(Boolean);
  const images = imageItems.length
    ? `<div class="grid grid-cols-1 ${imageItems.length > 1 ? 'md:grid-cols-2' : ''} gap-4 md:gap-8 mb-6 mt-8">${imageItems.join('')}</div>`
    : '';
  const content = work.content
    ? `<div class="blog-content text-[14px] leading-loose text-stone-600 max-w-none mt-6">${work.content}</div>`
    : '';

  return `<article class="border-b border-stone-200 pb-12 mb-12 last:border-0 last:pb-0 last:mb-0">
    <div class="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
      <time class="text-[11px] font-sans text-stone-400 tracking-wider" datetime="${escapeHtml(dateValue || '')}">${date}</time>
      <span class="text-[10px] tracking-widest text-[#1B2A47] bg-stone-50 px-2 py-1">${processingType}</span>
    </div>
    <h3 class="text-xl font-serif tracking-widest text-[#1B2A47] mb-6 pb-4 border-b border-stone-100 block w-full max-w-md">${stoneType}</h3>
    ${images}
    ${content}
  </article>`;
};

const updateMoreButton = () => {
  if (!worksMoreButton) return;
  const remaining = allWorks.length - visibleWorksCount;
  if (remaining <= 0) {
    worksMoreButton.classList.add('hidden');
    return;
  }
  worksMoreButton.classList.remove('hidden');
  worksMoreButton.textContent = 'もっと見る';
};

const renderWorks = () => {
  if (!worksList) return;
  worksList.innerHTML = allWorks.slice(0, visibleWorksCount).map(renderWork).join('');
  updateMoreButton();
};

const loadWorks = async () => {
  if (!worksList) return;
  if (!apiKey) {
    worksList.innerHTML = '<p class="text-center text-sm text-stone-400 py-8">加工事例を表示する準備中です。</p>';
    return;
  }

  try {
    const response = await fetch('https://yamanami.microcms.io/api/v1/works?limit=100&orders=-publishedAt', {
      headers: { 'X-MICROCMS-API-KEY': apiKey },
    });
    if (!response.ok) throw new Error('Failed to fetch works');

    const data = await response.json();
    allWorks = Array.isArray(data.contents) ? data.contents : [];
    if (!allWorks.length) {
      worksList.innerHTML = '<p class="text-center text-sm text-stone-400 py-8">現在、公開中の加工事例はありません。</p>';
      return;
    }

    renderWorks();
  } catch (error) {
    console.error('Error fetching works:', error);
    worksList.innerHTML = '<p class="text-center text-sm text-stone-400 py-8">加工事例の読み込みに失敗しました。</p>';
  }
};

if (worksMoreButton) {
  worksMoreButton.addEventListener('click', () => {
    visibleWorksCount += worksPerLoad;
    renderWorks();
  });
}

const revealDetailContent = () => {
  // STONEWORKは独立ページのため、トップページのスクロール監視に依存せず加工詳細を必ず表示します。
  document.querySelectorAll('.fade-in').forEach((element) => element.classList.add('visible'));
};

const setupSliders = () => {
  document.querySelectorAll('.slider-component').forEach((slider) => {
    const container = slider.querySelector('.slides-container');
    const dots = slider.querySelectorAll('.slider-dot');
    if (!container || dots.length === 0 || container.dataset.ready) return;
    container.dataset.ready = 'true';

    const originalCount = dots.length;
    const firstSlide = container.children[0];
    if (!firstSlide) return;
    container.appendChild(firstSlide.cloneNode(true));

    let currentIndex = 0;
    let timer;
    const update = (index, animate = true) => {
      container.style.transition = animate ? 'transform 1.2s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
      container.style.transform = `translate3d(-${index * 100}%, 0, 0)`;
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('opacity-100', dotIndex === (index % originalCount));
        dot.classList.toggle('opacity-40', dotIndex !== (index % originalCount));
      });
    };
    const next = () => {
      currentIndex += 1;
      update(currentIndex);
      if (currentIndex >= originalCount) {
        window.setTimeout(() => {
          currentIndex = 0;
          update(currentIndex, false);
        }, 1200);
      }
    };
    const start = () => {
      window.clearInterval(timer);
      timer = window.setInterval(next, 4000);
    };
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        currentIndex = index;
        update(currentIndex);
        start();
      });
    });
    slider.addEventListener('mouseenter', () => window.clearInterval(timer));
    slider.addEventListener('mouseleave', start);
    start();
  });
};

const setupStoneworkMenu = () => {
  const menuButton = document.getElementById('stonework-menu-btn');
  const menu = document.getElementById('stonework-menu');
  const closeButton = document.getElementById('stonework-menu-close');
  if (!menuButton || !menu || !closeButton) return;

  const closeMenu = () => {
    menu.classList.add('opacity-0', '-translate-y-5');
    menu.classList.remove('opacity-100', 'translate-y-0');
    menuButton.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    window.setTimeout(() => menu.classList.add('hidden'), 300);
  };

  const openMenu = () => {
    menu.classList.remove('hidden');
    window.requestAnimationFrame(() => {
      menu.classList.remove('opacity-0', '-translate-y-5');
      menu.classList.add('opacity-100', 'translate-y-0');
    });
    menuButton.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
  };

  menuButton.addEventListener('click', openMenu);
  closeButton.addEventListener('click', closeMenu);
  menu.querySelectorAll('.stonework-menu-link').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu();
  });
};

revealDetailContent();
setupSliders();
setupStoneworkMenu();
loadWorks();
