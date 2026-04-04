--- START OF FILE assets/js/main.js ---

document.addEventListener('DOMContentLoaded', function() {

code
Code
download
content_copy
expand_less
/* =========================================
   1. إدارة القائمة الجانبية (Sidebar)
   ========================================= */
const sidebar = document.getElementById('sidebar');
const openSidebarBtn = document.getElementById('openSidebar');
const closeSidebarBtn = document.getElementById('closeSidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

// دالة فتح القائمة
function openMenu() {
    if (sidebar && sidebarOverlay) {
        sidebar.classList.add('active');
        sidebarOverlay.classList.add('active');
        // منع التمرير في الخلفية عند فتح القائمة
        document.body.style.overflow = 'hidden'; 
    }
}

// دالة إغلاق القائمة
function closeMenu() {
    if (sidebar && sidebarOverlay) {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        // إعادة تفعيل التمرير في الخلفية
        document.body.style.overflow = ''; 
    }
}

// ربط الأحداث بالأزرار (إذا كانت موجودة في الصفحة)
if (openSidebarBtn) {
    openSidebarBtn.addEventListener('click', openMenu);
}

if (closeSidebarBtn) {
    closeSidebarBtn.addEventListener('click', closeMenu);
}

// إغلاق القائمة عند الضغط على المساحة المعتمة (الخلفية)
if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeMenu);
}

// إغلاق القائمة تلقائياً عند الضغط على أي رابط بداخلها (مفيد لروابط التمرير الداخلي)
const sidebarLinks = document.querySelectorAll('.sidebar-links a');
sidebarLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
});


/* =========================================
   2. إدارة الأسئلة الشائعة (FAQ Accordion)
   ========================================= */
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const answerDiv = item.querySelector('.faq-answer');

    if (questionBtn && answerDiv) {
        questionBtn.addEventListener('click', () => {
            // التحقق مما إذا كان السؤال الحالي مفتوحاً بالفعل
            const isActive = item.classList.contains('active');

            // إغلاق جميع الأسئلة الأخرى أولاً (للحفاظ على الترتيب وعدم تشتت المستخدم)
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                const otherAnswer = otherItem.querySelector('.faq-answer');
                if (otherAnswer) {
                    otherAnswer.style.maxHeight = null;
                }
            });

            // إذا لم يكن مفتوحاً، قم بفتحه
            if (!isActive) {
                item.classList.add('active');
                // استخدام scrollHeight لمعرفة الارتفاع الحقيقي للمحتوى وتطبيقه بسلاسة
                answerDiv.style.maxHeight = answerDiv.scrollHeight + "px";
            }
        });
    }
});

});

--- END OF FILE assets/js/main.js ---
