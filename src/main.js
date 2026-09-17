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

    // ロゴの起動演出は使用せず、本文をすぐに表示する
    const foucPrevention = document.getElementById('fouc-prevention');
    if (foucPrevention) foucPrevention.remove();
    document.body.style.overflow = '';

    const heroBg = document.getElementById('hero-bg');
    if (heroBg) {
        heroBg.style.transform = 'scale(1)';
    }

    if (targetHash) {
        // 他ページ（/oem/, /stonework/ など）から #contact 等のハッシュ付きで
        // 遷移してきた場合、該当セクションへスクロールする
        const targetElement = document.querySelector(targetHash);
        if (targetElement) {
            window.scrollTo(0, 0);
            setTimeout(() => {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            window.scrollTo(0, 0);
        }
    } else {
        window.scrollTo(0, 0);
    }

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
       Navigation
       ========================================= */
    const homeView = document.getElementById('home-view');

    function navigateTo(view) {
        if (view === 'stonework' || view === 'services') {
            window.location.href = '/stonework/';
            return;
        }

        if (homeView) {
            homeView.style.display = 'block';
        }

        if (typeof gtag === 'function') {
            gtag('event', 'page_view', {
                page_path: '/',
                page_title: '有限会社 やまなみ銘石'
            });
        }
    }

    document.querySelectorAll('[data-route]').forEach(link => {
        link.addEventListener('click', (e) => {
            const route = link.getAttribute('data-route');
            if (route === 'stonework' || route === 'services') {
                e.preventDefault();
                navigateTo('stonework');
                return;
            }

            navigateTo('home');
            const target = link.getAttribute('href');
            if (target && target.startsWith('#')) {
                e.preventDefault();
                setTimeout(() => {
                    const element = document.querySelector(target);
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                }, 50);
            } else if (route === 'home-top') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
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
       Contact Form (real submission)
       ========================================= */
    const contactForm = document.getElementById('contact-form');
    const contactSubmitBtn = document.getElementById('contact-submit-btn');
    const contactSubmitLabel = document.getElementById('contact-submit-label');
    const contactResult = document.getElementById('contact-result');
    const photosInput = document.getElementById('input-photos');
    const photosError = document.getElementById('photos-error');

    const MAX_FILES = 3;
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const MAX_TOTAL_SIZE = 15 * 1024 * 1024;

    if (photosInput) {
        photosInput.addEventListener('change', () => {
            const files = Array.from(photosInput.files || []);
            let error = '';
            if (files.length > MAX_FILES) {
                error = `写真は${MAX_FILES}枚までにしてください。`;
            } else {
                const totalSize = files.reduce((sum, f) => sum + f.size, 0);
                const tooLarge = files.find((f) => f.size > MAX_FILE_SIZE);
                if (tooLarge) {
                    error = `「${tooLarge.name}」のサイズが大きすぎます（1枚5MBまで）。`;
                } else if (totalSize > MAX_TOTAL_SIZE) {
                    error = '添付ファイルの合計サイズが大きすぎます（15MBまで）。';
                }
            }
            if (photosError) {
                photosError.textContent = error;
                photosError.classList.toggle('hidden', !error);
            }
            if (error) photosInput.value = '';
        });
    }

    window.submitContactForm = async () => {
        if (!contactForm) return;
        if (!contactForm.reportValidity()) return;
        if (photosError && !photosError.classList.contains('hidden')) return;

        contactSubmitBtn.disabled = true;
        if (contactSubmitLabel) contactSubmitLabel.textContent = '送信中...';
        if (contactResult) {
            contactResult.textContent = '';
            contactResult.classList.remove('text-red-600', 'text-green-600');
        }

        try {
            const formData = new FormData(contactForm);
            const response = await fetch('/api/contact', { method: 'POST', body: formData });
            const data = await response.json();

            if (data.ok) {
                if (contactSubmitLabel) contactSubmitLabel.textContent = '送信済み';
                if (contactResult) {
                    contactResult.textContent = 'お問い合わせありがとうございます。担当より折り返しご連絡いたします。';
                    contactResult.classList.add('text-green-600');
                }
                contactForm.reset();
            } else {
                throw new Error(data.error || '送信に失敗しました。');
            }
        } catch (error) {
            contactSubmitBtn.disabled = false;
            if (contactSubmitLabel) contactSubmitLabel.textContent = '送信する';
            if (contactResult) {
                contactResult.textContent = error.message || '送信に失敗しました。時間をおいて再度お試しください。';
                contactResult.classList.add('text-red-600');
            }
        }
    };

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

});
