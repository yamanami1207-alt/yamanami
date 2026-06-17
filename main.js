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
        } else {
            servicesView.style.display = 'none';
            homeView.style.display = 'block';
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
            
            // Loop wrap check after transition
            if (currentIndex >= originalCount) {
                setTimeout(() => {
                    currentIndex = 0;
                    gotoSlide(currentIndex, false);
                    // Force a reflow so the browser applies 'none' instantly before next transition
                    container.offsetHeight; 
                }, 1200); // Wait for the transition to finish
            }
        };

        const startAutoSlide = () => {
            clearInterval(autoSlideInterval);
            autoSlideInterval = setInterval(() => {
                // Skip tick if currently waiting on the reset gap
                if (currentIndex >= originalCount) return; 
                nextSlide();
            }, 4000); 
        };

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
