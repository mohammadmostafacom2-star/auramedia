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
