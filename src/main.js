import './index.css';

document.addEventListener('DOMContentLoaded', () => {
    let targetHash = window.location.hash;

    // Clear hash on reload to prevent jumping to sections immediately
    if (targetHash) {
        window.history.replaceState('', document.title, window.location.pathname + window.location.search);
    }

    // ページロード時の初期スクロール位置固定
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    
    document.body.style.overflow = 'hidden';

    const foucPrevention = document.getElementById('fouc-prevention');

    /* =========================================
       Loader
       ========================================= */
    const loader = document.getElementById('loader');
    const loaderContent = document.getElementById('loader-content');
    const loaderCircle = document.querySelector('.loader-circle');
    const loaderText = document.querySelector('.loader-text');
    
    // Initial entrance anim
    setTimeout(() => {
        loaderContent.style.opacity = '1';
        loaderContent.style.transform = 'scale(1)';
        loaderContent.style.transition = 'transform 1.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease-in-out';
        loaderText.style.opacity = '1';
        loaderText.style.transition = 'opacity 1s ease-in-out 0.5s';
    }, 50);

    // Hide loader
    setTimeout(() => {
        if (foucPrevention) foucPrevention.remove();
        loader.style.opacity = '0';
        
        // 起動時のズームアウト (Hero Background)
        const heroBg = document.getElementById('hero-bg');
        if (heroBg) {
            heroBg.style.transition = 'transform 2.5s cubic-bezier(0.16, 1, 0.3, 1)';
            heroBg.style.transform = 'scale(1)';
        }

        setTimeout(() => {
            document.body.style.overflow = '';
            
            // Immediately force to top as soon as overflow is restored
            if (!targetHash) {
                window.scrollTo(0, 0);
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
            }
            
            loader.style.display = 'none';
            // One last enforcement
            if (!targetHash) {
                window.scrollTo(0, 0);
            } else if (targetHash === '#services') {
                navigateTo('services');
            } else {
                const target = document.querySelector(targetHash);
                if (target) {
                    setTimeout(() => {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                }
            }
        }, 800);
    }, 3200);

    /* =========================================
       Intersection Observer for Fade-In
       ========================================= */
    const fadeElements = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    fadeElements.forEach(el => observer.observe(el));

    /* =========================================
       Navigation & Views (Home vs Services)
       ========================================= */
    const homeView = document.getElementById('home-view');
    const servicesView = document.getElementById('services-view');
    
    function navigateTo(view) {
        if (view === 'services') {
            homeView.style.display = 'none';
            servicesView.style.display = 'block';
            window.scrollTo(0, 0);
            if (typeof gtag === 'function') {
                gtag('event', 'page_view', {
                    page_path: '/services',
                    page_title: '加工詳細'
                });
            }
        } else {
            servicesView.style.display = 'none';
            homeView.style.display = 'block';
            if (typeof gtag === 'function') {
                gtag('event', 'page_view', {
                    page_path: '/',
                    page_title: '有限会社 やまなみ銘石'
                });
            }
        }
    }

    document.querySelectorAll('[data-route]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const route = link.getAttribute('data-route');
            if (route === 'services') {
                navigateTo('services');
            } else {
                navigateTo('home');
                const target = link.getAttribute('href');
                if (target && target.startsWith('#')) {
                    setTimeout(() => {
                        const el = document.querySelector(target);
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                } else if (route === 'home-top') {
                    window.scrollTo(0, 0);
                }
            }
        });
    });

    /* =========================================
       Mobile Menu
       ========================================= */
    const menuBtn = document.getElementById('menu-btn');
    const menuCloseBtn = document.getElementById('menu-close');
    const mobileMenu = document.getElementById('mobile-menu');
    
    function toggleMenu(show) {
        if (show) {
            mobileMenu.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                mobileMenu.style.opacity = '1';
                mobileMenu.style.transform = 'translateY(0)';
            }, 10);
        } else {
            mobileMenu.style.opacity = '0';
            mobileMenu.style.transform = 'translateY(-20px)';
            document.body.style.overflow = '';
            setTimeout(() => {
                mobileMenu.style.display = 'none';
            }, 500);
        }
    }

    menuBtn.addEventListener('click', () => toggleMenu(true));
    menuCloseBtn.addEventListener('click', () => toggleMenu(false));
    
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => toggleMenu(false));
    });

    /* =========================================
       Copy Address
       ========================================= */
    document.querySelectorAll('[data-copy]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const text = btn.getAttribute('data-copy');
            navigator.clipboard.writeText(text);
        });
    });

    /* =========================================
       Accordion
       ========================================= */
    document.querySelectorAll('.accordion-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const content = btn.nextElementSibling;
            const icon = btn.querySelector('.vertical-line');
            content.classList.toggle('open');
            if (content.classList.contains('open')) {
                icon.style.transform = 'rotate(90deg) scale(0)';
            } else {
                icon.style.transform = '';
            }
        });
    });

    /* =========================================
       Contact Form
       ========================================= */
    const form = document.getElementById('contact-form');
    const nameInput = form.querySelector('[name="name"]');
    const emailInput = form.querySelector('[name="email"]');
    const categorySelect = form.querySelector('[name="category"]');
    const messageInput = form.querySelector('[name="message"]');
    const submitBtn = document.getElementById('submit-btn');

    function validateForm() {
        if (nameInput.value.trim() && emailInput.value.trim() && categorySelect.value && messageInput.value.trim()) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('text-stone-300', 'border-stone-300', 'cursor-not-allowed');
            submitBtn.classList.add('text-[#1B2A47]', 'border-[#1B2A47]', 'hover:bg-[#1B2A47]', 'hover:text-white', 'cursor-pointer');
        } else {
            submitBtn.disabled = true;
            submitBtn.classList.add('text-stone-300', 'border-stone-300', 'cursor-not-allowed');
            submitBtn.classList.remove('text-[#1B2A47]', 'border-[#1B2A47]', 'hover:bg-[#1B2A47]', 'hover:text-white', 'cursor-pointer');
        }
    }

    [nameInput, emailInput, categorySelect, messageInput].forEach(el => {
        el.addEventListener('input', validateForm);
    });

    categorySelect.addEventListener('change', () => {
        categorySelect.classList.remove('text-stone-400');
        categorySelect.classList.add('text-stone-600');
        validateForm();
    });

    submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!submitBtn.disabled) {
            const mailto = `mailto:info@ishiya-san.com?subject=${encodeURIComponent(categorySelect.value)}&body=${encodeURIComponent(`お名前: ${nameInput.value}\nメールアドレス: ${emailInput.value}\n\nお問い合わせ内容:\n${messageInput.value}\n\n※画像を添付される場合は、そのままこのメールに画像を添付して送信をお願いいたします。`)}`;
            window.location.href = mailto;
        }
    });

    /* =========================================
       Image Modal
       ========================================= */
    const imageModal = document.getElementById('image-modal');
    const imageModalImg = document.getElementById('image-modal-img');
    
    document.querySelectorAll('.gallery-image').forEach(galleryItem => {
        galleryItem.addEventListener('click', (e) => {
            // Check if dragging occurred on marquee
            if (window.isDraggingGallery) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            const imgSrc = galleryItem.querySelector('img').getAttribute('src');
            imageModalImg.setAttribute('src', imgSrc);
            imageModal.style.pointerEvents = 'auto';
            imageModal.style.opacity = '1';
            imageModalImg.classList.remove('scale-90');
            imageModalImg.classList.add('scale-100');
        });
    });

    imageModal.addEventListener('click', () => {
        imageModal.style.opacity = '0';
        imageModal.style.pointerEvents = 'none';
        imageModalImg.classList.remove('scale-100');
        imageModalImg.classList.add('scale-90');
    });

    const openReiImg = document.getElementById('open-rei-img');
    const attachmentModal = document.getElementById('attachment-modal');
    const attachmentModalClose = document.getElementById('attachment-modal-close');
    const attachmentModalContent = document.getElementById('attachment-modal-content');

    if (openReiImg && attachmentModal) {
        openReiImg.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            attachmentModal.style.pointerEvents = 'auto';
            attachmentModal.style.opacity = '1';
            attachmentModalContent.classList.remove('scale-95');
            attachmentModalContent.classList.add('scale-100');
        });

        attachmentModalClose.addEventListener('click', () => {
            attachmentModal.style.opacity = '0';
            attachmentModal.style.pointerEvents = 'none';
            attachmentModalContent.classList.remove('scale-100');
            attachmentModalContent.classList.add('scale-95');
        });

        attachmentModal.addEventListener('click', (e) => {
            if (e.target === attachmentModal) {
                attachmentModal.style.opacity = '0';
                attachmentModal.style.pointerEvents = 'none';
                attachmentModalContent.classList.remove('scale-100');
                attachmentModalContent.classList.add('scale-95');
            }
        });
    }

    /* =========================================
       Header Scroll
       ========================================= */
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('shadow-sm');
        } else {
            header.classList.remove('shadow-sm');
        }
    });

    /* =========================================
       Marquee Auto-Scroll
       ========================================= */
    const wrappers = document.querySelectorAll('.marquee-scroll-wrapper');
    wrappers.forEach(wrapper => {
        const marqueeContainer = wrapper.querySelector('.marquee-container');
        if (!marqueeContainer) return;
        
        let isTouching = false;
        let isMouseDown = false;
        let startX;
        let scrollLeft;
        
        const speed = 1.0; 
        let exactScrollLeft = 0;
        let isInitialized = false;
        
        // Disable scrollbar explicitly if css didn't catch 
        wrapper.style.msOverflowStyle = 'none';
        wrapper.style.scrollbarWidth = 'none';
        
        wrapper.addEventListener('mouseleave', () => {
            isMouseDown = false;
            wrapper.style.cursor = '';
        });

        function animateMarquee() {
            const firstChild = marqueeContainer.children[0];
            const maxScroll = firstChild.offsetWidth + 16; // 16px is the gap-4
            
            if (!isInitialized && maxScroll > 16) {
                exactScrollLeft = maxScroll;
                wrapper.scrollLeft = exactScrollLeft;
                isInitialized = true;
            }

            if (!isTouching && !isMouseDown) {
                // Scroll left (content moves right)
                exactScrollLeft -= speed;
                
                if (exactScrollLeft <= 0) {
                    exactScrollLeft += maxScroll;
                }
                wrapper.scrollLeft = exactScrollLeft;
            } else {
                // Keep exactScrollLeft in sync when user drags
                exactScrollLeft = wrapper.scrollLeft;
                if (exactScrollLeft <= 0) {
                    exactScrollLeft += maxScroll;
                    wrapper.scrollLeft = exactScrollLeft;
                } else if (exactScrollLeft >= maxScroll * 2) {
                    exactScrollLeft -= maxScroll;
                    wrapper.scrollLeft = exactScrollLeft;
                }
            }

            requestAnimationFrame(animateMarquee);
        }

        animateMarquee();

        // Mouse Drag Logic
        wrapper.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            window.isDraggingGallery = false;
            startX = e.pageX - wrapper.offsetLeft;
            scrollLeft = wrapper.scrollLeft;
            wrapper.style.cursor = 'grabbing';
            e.preventDefault(); // preventing image drag
        });
        
        wrapper.addEventListener('mouseup', () => {
            isMouseDown = false;
            wrapper.style.cursor = '';
            setTimeout(() => { window.isDraggingGallery = false; }, 50);
        });
        
        wrapper.addEventListener('mousemove', (e) => {
            if (!isMouseDown) return;
            e.preventDefault();
            const x = e.pageX - wrapper.offsetLeft;
            const walk = (x - startX) * 1.5;
            if (Math.abs(walk) > 5) {
                window.isDraggingGallery = true;
            }
            wrapper.scrollLeft = scrollLeft - walk;
        });

        // Touch Interaction Flags (allow native scroll but pause auto scroll)
        wrapper.addEventListener('touchstart', () => { isTouching = true; window.isDraggingGallery = false; }, {passive: true});
        wrapper.addEventListener('touchend', () => { isTouching = false; setTimeout(() => { window.isDraggingGallery = false; }, 50); }, {passive: true});
        wrapper.addEventListener('touchcancel', () => { isTouching = false; setTimeout(() => { window.isDraggingGallery = false; }, 50); }, {passive: true});
        wrapper.addEventListener('touchmove', () => { window.isDraggingGallery = true; }, {passive: true});
    });

    /* =========================================
       Works Detail Sliders
       ========================================= */
    const sliderComponents = document.querySelectorAll('.slider-component');
    sliderComponents.forEach(slider => {
        const container = slider.querySelector('.slides-container');
        const dots = slider.querySelectorAll('.slider-dot');
        if (!container || dots.length === 0) return;

        // Clone first slide for infinite loop
        const firstSlide = container.children[0];
        const clone = firstSlide.cloneNode(true);
        container.appendChild(clone);

        let originalCount = dots.length;
        let currentIndex = 0;
        let autoSlideInterval;

        const updateDots = (index) => {
            const dotIndex = Math.abs(index) % originalCount;
            dots.forEach((dot, idx) => {
                if (idx === dotIndex) {
                    dot.classList.remove('opacity-40');
                    dot.classList.add('opacity-100');
                } else {
                    dot.classList.remove('opacity-100');
                    dot.classList.add('opacity-40');
                }
            });
        };

        const gotoSlide = (index, animate = true) => {
            if (animate) {
                container.style.transition = 'transform 1.2s cubic-bezier(0.25, 1, 0.5, 1)';
            } else {
                container.style.transition = 'none';
            }
            // Use 100% since container's flex-children are each 100% width
            container.style.transform = `translate3d(-${index * 100}%, 0, 0)`;
            updateDots(index);
        };

        const nextSlide = () => {
            currentIndex++;
            gotoSlide(currentIndex, true);
            
            if (currentIndex >= originalCount) {
                setTimeout(() => {
                    currentIndex = 0;
                    gotoSlide(currentIndex, false);
                    container.offsetHeight; 
                }, 1200);
            }
        };

        const startAutoSlide = () => {
            clearInterval(autoSlideInterval);
            autoSlideInterval = setInterval(() => {
                if (currentIndex >= originalCount) return; 
                nextSlide();
            }, 4000); 
        };

        // Touch / Swipe handling
        let isDragging = false;
        let startPos = 0;
        let currentTranslate = 0;

        slider.addEventListener('contextmenu', e => e.preventDefault());

        const getPositionX = (e) => e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        const getPositionY = (e) => e.type.includes('mouse') ? e.pageY : e.touches[0].clientY;

        const touchStart = (e) => {
            isDragging = true;
            startPos = getPositionX(e);
            clearInterval(autoSlideInterval);
            if(e.type.includes('touch')) {
                slider.dataset.touchStartY = getPositionY(e);
                slider.dataset.isScrolling = '';
            }
            container.style.transition = 'none';
        };

        const touchMove = (e) => {
            if (!isDragging) return;
            const currentPosition = getPositionX(e);
            
            if(e.type.includes('touch')) {
               const y = Math.abs(getPositionY(e) - parseFloat(slider.dataset.touchStartY));
               const x = Math.abs(currentPosition - startPos);
               if(!slider.dataset.isScrolling) {
                  slider.dataset.isScrolling = y > x ? '1' : '0';
               }
               if(slider.dataset.isScrolling === '1') {
                  isDragging = false;
                  return;
               }
               if (e.cancelable) e.preventDefault(); 
            } else {
               e.preventDefault();
            }

            const diff = currentPosition - startPos;
            currentTranslate = -(currentIndex * 100) + (diff / slider.clientWidth * 100);
            container.style.transform = `translate3d(${currentTranslate}%, 0, 0)`;
        };

        const touchEnd = () => {
            if(!isDragging) return;
            isDragging = false;
            const diff = currentTranslate - (-(currentIndex * 100));
            if (diff < -15) {
               nextSlide();
            } else if (diff > 15) {
               if (currentIndex > 0) {
                   currentIndex--;
                   gotoSlide(currentIndex, true);
               } else {
                   gotoSlide(currentIndex, true);
               }
            } else {
               gotoSlide(currentIndex, true);
            }
            startAutoSlide();
        };

        slider.addEventListener('touchstart', touchStart, { passive: true });
        slider.addEventListener('touchmove', touchMove, { passive: false });
        slider.addEventListener('touchend', touchEnd);
        slider.addEventListener('mousedown', touchStart);
        slider.addEventListener('mousemove', touchMove);
        slider.addEventListener('mouseup', touchEnd);
        slider.addEventListener('mouseleave', () => { if(isDragging) touchEnd() });

        // Reset state nicely when clicking around pages
        document.querySelectorAll('[data-route]').forEach(link => {
             link.addEventListener('click', () => {
                 // optionally reset timers here to keep them fresh
                 startAutoSlide();
             })
        });

        startAutoSlide();

        // Dots click handling
        dots.forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                clearInterval(autoSlideInterval);
                currentIndex = idx;
                gotoSlide(currentIndex, true);
                startAutoSlide();
            });
        });
    });

    /* =========================================
       Footer Legal Toggles
       ========================================= */
    const legalBtns = document.querySelectorAll('.legal-btn');
    legalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const targetEl = document.getElementById(targetId);
            
            // If already visible, hide it
            if (!targetEl.classList.contains('hidden')) {
                targetEl.classList.add('hidden');
                return;
            }
            
            // Hide all legal contents first
            document.getElementById('legal-tokusho').classList.add('hidden');
            document.getElementById('legal-privacy').classList.add('hidden');
            
            // Show target
            targetEl.classList.remove('hidden');
            
            // Smooth scroll to it if not fully visible
            setTimeout(() => {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 50);
        });
    });

    /* =========================================
       MicroCMS Blog Integration
       ========================================= */
    const loadBlogPosts = async () => {
        const blogContainer = document.getElementById('blog-container');
        if (!blogContainer) return;

        const apiKey = import.meta.env.VITE_MICROCMS_API_KEY;
        if (!apiKey) {
            blogContainer.innerHTML = '<p class="text-stone-400 text-sm text-center">APIキーが設定されていません</p>';
            return;
        }

        try {
            // Fetch more items to show in works and past blogs
            const response = await fetch('https://yamanami.microcms.io/api/v1/blogs?limit=50', {
                headers: {
                    'X-MICROCMS-API-KEY': apiKey,
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch blog posts');
            }

            const data = await response.json();
            
            if (data.contents.length === 0) {
                blogContainer.innerHTML = '<p class="text-stone-400 text-sm text-center py-8">現在お知らせはありません</p>';
                return;
            }

            window.blogPostsCache = data.contents.reduce((acc, post) => {
                acc[post.id] = post;
                return acc;
            }, {});

            const renderBlogItem = (post) => {
                const date = new Date(post.publishedAt || post.createdAt).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }).replace(/\//g, '.');

                let description = '';
                if (post.content) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = post.content;
                    description = tempDiv.textContent || tempDiv.innerText || '';
                } else if (post.description) {
                    description = post.description;
                }
                const truncated = description.length > 70 ? description.substring(0, 70) + '...' : description;

                let imageHtml = '';
                if (post.eyecatch && post.eyecatch.url) {
                    imageHtml = `
                    <div class="hidden md:block w-48 h-32 flex-shrink-0 overflow-hidden rounded-sm bg-stone-100">
                        <img src="${post.eyecatch.url}?w=600" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="">
                    </div>`;
                }

                // Default layout for Blog section
                return `
                    <div class="blog-item flex flex-col ${imageHtml ? 'md:flex-row md:items-center' : ''} gap-6 border border-stone-200 p-6 md:p-8 rounded-sm hover:-translate-y-1 transition-transform duration-300 bg-stone-50 cursor-pointer shadow-sm group" data-id="${post.id}">
                        ${imageHtml}
                        <div class="flex-1">
                            <div class="flex items-center gap-4 mb-3">
                                <span class="text-[11px] font-sans text-stone-400 tracking-wider">${date}</span>
                            </div>
                            <h3 class="text-base md:text-lg font-serif tracking-widest text-[#1B2A47] mb-3">${post.title}</h3>
                            <p class="text-[13px] font-light text-stone-500 leading-relaxed">${truncated}</p>
                        </div>
                    </div>
                `;
            };

            // 1. Render News/Blog
            const latestPosts = data.contents.slice(0, 3);
            blogContainer.innerHTML = latestPosts.map(post => renderBlogItem(post)).join('');

            const allBlogsContainer = document.getElementById('all-blogs-container');
            const viewAllBlogsBtn = document.getElementById('view-all-blogs-btn');
            
            if (data.contents.length > 3 && allBlogsContainer && viewAllBlogsBtn) {
                viewAllBlogsBtn.classList.remove('hidden');
                allBlogsContainer.innerHTML = data.contents.slice(3).map(post => renderBlogItem(post)).join('');
                
                viewAllBlogsBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    allBlogsContainer.classList.remove('hidden');
                    viewAllBlogsBtn.classList.add('hidden');
                    attachBlogEvents(); // Reattach events to newly revealed items
                });
            }

            const blogModal = document.getElementById('blog-modal');
            const blogModalBody = document.getElementById('blog-modal-body');
            const blogModalContentContainer = document.getElementById('blog-modal-content-container');
            const blogModalClose = document.getElementById('blog-modal-close');

            const openBlogModal = (post) => {
                const date = new Date(post.publishedAt || post.createdAt).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }).replace(/\//g, '.');
                
                blogModalBody.innerHTML = `
                    <div class="mb-8">
                        <span class="text-[12px] font-sans text-stone-400 tracking-wider block mb-4">${date}</span>
                        <h2 class="text-2xl md:text-3xl font-serif tracking-widest text-[#1B2A47] mb-6 leading-relaxed">${post.title}</h2>
                        <hr class="border-stone-200">
                    </div>
                    <div class="blog-content">
                        ${post.content || ''}
                    </div>
                `;
                
                blogModal.style.opacity = '1';
                blogModal.style.pointerEvents = 'auto';
                blogModalContentContainer.classList.remove('scale-95');
                blogModalContentContainer.classList.add('scale-100');
                document.body.style.overflow = 'hidden';
            };

            const closeBlogModal = () => {
                blogModal.style.opacity = '0';
                blogModal.style.pointerEvents = 'none';
                blogModalContentContainer.classList.remove('scale-100');
                blogModalContentContainer.classList.add('scale-95');
                document.body.style.overflow = '';
                setTimeout(() => {
                    blogModalBody.innerHTML = '';
                }, 300);
            };

            const attachBlogEvents = () => {
                document.querySelectorAll('.blog-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const postId = item.getAttribute('data-id');
                        const post = window.blogPostsCache[postId];
                        if (post) {
                            openBlogModal(post);
                        }
                    });
                });
            };

            attachBlogEvents();

            blogModalClose.addEventListener('click', closeBlogModal);
            
            blogModal.addEventListener('click', (e) => {
                if (e.target === blogModal) {
                    closeBlogModal();
                }
            });

        } catch (error) {
            console.error('Error fetching blogs:', error);
            blogContainer.innerHTML = '<p class="text-stone-400 text-sm text-center py-8">お知らせの読み込みに失敗しました。</p>';
        }
    };

    // Load blogs on start
    loadBlogPosts();

    /* =========================================
       MicroCMS Works Integration
       ========================================= */
    const setupWorksModal = () => {
        const openWorksBtn = document.getElementById('open-works-modal-btn');
        const openWorksBtnServices = document.getElementById('open-works-modal-btn-services');
        const worksModal = document.getElementById('works-modal');
        const worksModalClose = document.getElementById('works-modal-close');
        const worksModalBody = document.getElementById('works-modal-body');
        const worksModalContainer = document.getElementById('works-modal-content-container');
        
        if (!worksModal) return;

        let worksLoaded = false;

        const openModal = async () => {
            worksModal.style.opacity = '1';
            worksModal.style.pointerEvents = 'auto';
            worksModalContainer.classList.remove('scale-95');
            worksModalContainer.classList.add('scale-100');
            document.body.style.overflow = 'hidden';

            if (worksLoaded) return;

            const apiKey = import.meta.env.VITE_MICROCMS_API_KEY;
            if (!apiKey) {
                worksModalBody.innerHTML = '<div class="text-center text-sm text-stone-400 py-8">APIキーが設定されていません</div>';
                return;
            }

            try {
                const response = await fetch('https://yamanami.microcms.io/api/v1/works?limit=50', {
                    headers: {
                        'X-MICROCMS-API-KEY': apiKey,
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch works');
                }

                const data = await response.json();
                
                if (data.contents.length === 0) {
                    worksModalBody.innerHTML = '<div class="text-center text-sm text-stone-400 py-8">過去の加工事例はまだありません</div>';
                    worksLoaded = true;
                    return;
                }

                const html = data.contents.map(post => {
                    const dateRaw = post.date || post.publishedAt || post.createdAt;
                    const date = new Date(dateRaw).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    }).replace(/\//g, '.');

                    let imagesHtml = '';
                    if (post.image_before || post.image_after) {
                        imagesHtml = `
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-6">
                                ${post.image_before ? `
                                <div class="flex flex-col gap-2">
                                    <span class="text-[10px] tracking-widest text-stone-400 bg-stone-100 self-start px-2 py-1 rounded-sm">BEFORE</span>
                                    <img src="${post.image_before.url}?w=800" class="w-full h-auto rounded-sm object-cover aspect-video bg-stone-100" loading="lazy" alt="Before">
                                </div>
                                ` : '<div></div>'}
                                ${post.image_after ? `
                                <div class="flex flex-col gap-2">
                                    <span class="text-[10px] tracking-widest text-[#1B2A47] bg-[#1B2A47]/10 self-start px-2 py-1 rounded-sm">AFTER</span>
                                    <img src="${post.image_after.url}?w=800" class="w-full h-auto rounded-sm object-cover aspect-video bg-stone-100" loading="lazy" alt="After">
                                </div>
                                ` : '<div></div>'}
                            </div>
                        `;
                    }

                    return `
                        <div class="border-b border-stone-200 pb-12 mb-12 last:border-0 last:pb-0 last:mb-0">
                            <span class="text-[11px] font-sans text-stone-400 tracking-wider mb-2 block">${date}</span>
                            <h3 class="text-xl font-serif tracking-widest text-[#1B2A47] mb-6 pb-4 border-b border-stone-100 block w-full max-w-md">${post.stone_type || '加工実績'}</h3>
                            ${imagesHtml}
                            ${post.content ? `
                                <div class="prose prose-stone text-[14px] leading-loose text-stone-600 max-w-none mt-6">
                                    ${post.content}
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('');

                worksModalBody.innerHTML = html;
                worksLoaded = true;

            } catch (error) {
                console.error('Error fetching works:', error);
                worksModalBody.innerHTML = '<div class="text-center text-sm text-stone-400 py-8">事例の読み込みに失敗しました。</div>';
            }
        };

        const closeModal = () => {
            worksModal.style.opacity = '0';
            worksModal.style.pointerEvents = 'none';
            worksModalContainer.classList.remove('scale-100');
            worksModalContainer.classList.add('scale-95');
            document.body.style.overflow = '';
        };

        if (openWorksBtn) {
            openWorksBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });
        }
        
        if (openWorksBtnServices) {
            openWorksBtnServices.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });
        }

        worksModalClose.addEventListener('click', closeModal);
        worksModal.addEventListener('click', (e) => {
            if (e.target === worksModal) closeModal();
        });
    };

    setupWorksModal();

});
