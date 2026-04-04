// =========================================
// إدارة القائمة الجانبية (Sidebar)
// =========================================
const menuBtn = document.getElementById('menuBtn');
const closeBtn = document.getElementById('closeBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

// دالة لفتح القائمة
if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // منع التمرير في الصفحة بالخلفية
    });
}

// دالة لإغلاق القائمة
function closeSidebar() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto'; // إعادة تفعيل التمرير
}

if (closeBtn) {
    closeBtn.addEventListener('click', closeSidebar);
}

if (overlay) {
    overlay.addEventListener('click', closeSidebar);
}

// =========================================
// إدارة الأسئلة الشائعة (Accordion)
// =========================================
const accordionHeaders = document.querySelectorAll('.accordion-header');

accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const accordionItem = header.parentElement;
        const accordionContent = header.nextElementSibling;

        // التحقق مما إذا كان العنصر الحالي مفتوحاً
        const isActive = accordionItem.classList.contains('active');

        // إغلاق جميع العناصر الأخرى أولاً (للحفاظ على الترتيب)
        document.querySelectorAll('.accordion-item').forEach(item => {
            item.classList.remove('active');
            item.querySelector('.accordion-content').style.maxHeight = null;
        });

        // إذا لم يكن العنصر مفتوحاً، قم بفتحه وتحديد ارتفاعه ديناميكياً
        if (!isActive) {
            accordionItem.classList.add('active');
            accordionContent.style.maxHeight = accordionContent.scrollHeight + "px";
        }
    });
});

// =========================================
// حركات الظهور عند التمرير (Scroll Animations)
// =========================================
// إعدادات المراقب (يتم التفعيل عندما يظهر 15% من العنصر في الشاشة)
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
};

// إنشاء المراقب
const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        // إذا دخل العنصر في مجال الرؤية
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // إيقاف مراقبة العنصر بعد ظهوره (لكي تحدث الحركة مرة واحدة فقط)
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// تطبيق المراقب على جميع العناصر التي تحمل كلاس animate-on-scroll
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => {
        scrollObserver.observe(el);
    });
});

// =========================================
// تأثير الكتابة التلقائية (Typing Effect)
// =========================================
const typingTextElement = document.getElementById('typing-text');
if (typingTextElement) {
    const words = ["بسرعة", "بأمان", "بسهولة"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeEffect() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            // مسح الحروف
            typingTextElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
        } else {
            // كتابة الحروف
            typingTextElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
        }

        // سرعة الكتابة والمسح
        let typeSpeed = isDeleting ? 50 : 100;

        // إذا اكتملت الكلمة
        if (!isDeleting && charIndex === currentWord.length) {
            typeSpeed = 2000; // التوقف قليلاً بعد كتابة الكلمة كاملة
            isDeleting = true;
        } 
        // إذا تم مسح الكلمة بالكامل
        else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length; // الانتقال للكلمة التالية
            typeSpeed = 500; // التوقف قليلاً قبل البدء بالكلمة الجديدة
        }

        setTimeout(typeEffect, typeSpeed);
    }

    // بدء التأثير بعد ثانية من تحميل الصفحة
    setTimeout(typeEffect, 1000);
}

// =========================================
// تأثير تتبع الماوس 3D (3D Tilt Effect)
// =========================================
const tiltWrapper = document.getElementById('tilt-wrapper');
const tiltElement = document.getElementById('tilt-element');

if (tiltWrapper && tiltElement) {
    tiltWrapper.addEventListener('mousemove', (e) => {
        // تفعيل التأثير فقط على شاشات اللابتوب (أكبر من 768px)
        if (window.innerWidth > 768) {
            const rect = tiltWrapper.getBoundingClientRect();
            const x = e.clientX - rect.left; // موقع الماوس X داخل العنصر
            const y = e.clientY - rect.top;  // موقع الماوس Y داخل العنصر
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // حساب زاوية الدوران (أقصى زاوية 15 درجة)
            const rotateX = ((y - centerY) / centerY) * -15; 
            const rotateY = ((x - centerX) / centerX) * 15;

            tiltElement.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        }
    });

    // إعادة الصورة لوضعها الطبيعي عند خروج الماوس
    tiltWrapper.addEventListener('mouseleave', () => {
        if (window.innerWidth > 768) {
            tiltElement.style.transition = 'transform 0.5s ease-out';
            tiltElement.style.transform = `rotateX(0deg) rotateY(0deg)`;
            
            // إعادة سرعة الاستجابة بعد انتهاء حركة العودة
            setTimeout(() => {
                tiltElement.style.transition = 'transform 0.1s ease-out';
            }, 500);
        }
    });

    // تهيئة سرعة الاستجابة عند دخول الماوس
    tiltWrapper.addEventListener('mouseenter', () => {
        if (window.innerWidth > 768) {
            tiltElement.style.transition = 'transform 0.1s ease-out';
        }
    });
}
