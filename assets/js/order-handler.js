/**
 * ====================================================================
 * إعدادات النظام الأساسية
 * ====================================================================
 */
// ضع رقم الواتساب الخاص بك هنا (مع رمز الدولة وبدون أصفار أو علامة +)
// مثال لسوريا: 9639xxxxxxxx
const WHATSAPP_NUMBER = "963900000000"; 

// بيانات التسعير بالدولار حسب طلبك
const pricingData = {
    "5": { "فضية": 10, "ذهبية": 19, "ماسية": 30 },
    "10": { "فضية": 21, "ذهبية": 41, "ماسية": 61 },
    "15": { "فضية": 32, "ذهبية": 63, "ماسية": 99 },
    "20+": { "فضية": 1.89, "ذهبية": 3.89, "ماسية": 5.89 } // تسعير يومي
};

let currentExchangeRate = 1; // سيتم تحديثه من ملف rate.json

/**
 * ====================================================================
 * جلب سعر الصرف عند تحميل الصفحة
 * ====================================================================
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('rate.json');
        if (response.ok) {
            const data = await response.json();
            currentExchangeRate = data.usd_syp;
        }
    } catch (error) {
        console.error('تعذر جلب سعر الصرف:', error);
    }
});

/**
 * ====================================================================
 * منطق الباقات والتسعير الديناميكي
 * ====================================================================
 */
const durationSelect = document.getElementById('duration');
const packageSelect = document.getElementById('packageType');
const priceDisplay = document.getElementById('priceDisplay');

// عند تغيير عدد الأيام
durationSelect.addEventListener('change', function() {
    const selectedDays = this.value;
    
    // تفريغ قائمة الباقات وتفعيلها
    packageSelect.innerHTML = '<option value="" disabled selected>اختر نوع الباقة...</option>';
    packageSelect.disabled = false;
    priceDisplay.style.display = 'none'; // إخفاء السعر حتى يختار الباقة

    // جلب الباقات الخاصة بعدد الأيام المحدد
    const availablePackages = pricingData[selectedDays];
    
    for (const [pkgName, usdPrice] of Object.entries(availablePackages)) {
        const option = document.createElement('option');
        option.value = pkgName;
        option.dataset.usd = usdPrice; // تخزين السعر بالدولار في العنصر
        
        // تغيير النص إذا كانت الباقة 20 يوم وما فوق
        if (selectedDays === "20+") {
            option.textContent = `الباقة ال${pkgName} (تسعير يومي)`;
        } else {
            option.textContent = `الباقة ال${pkgName}`;
        }
        
        packageSelect.appendChild(option);
    }
});

// عند اختيار نوع الباقة (حساب وعرض السعر)
packageSelect.addEventListener('change', function() {
    const selectedOption = this.options[this.selectedIndex];
    const usdPrice = parseFloat(selectedOption.dataset.usd);
    const selectedDays = durationSelect.value;
    
    // حساب السعر بالليرة السورية وتقريبه
    const sypPrice = Math.round(usdPrice * currentExchangeRate).toLocaleString('en-US');
    
    let priceText = `السعر: ${usdPrice}$ (حوالي ${sypPrice} ل.س)`;
    
    // إضافة كلمة "يومياً" إذا كانت الباقة مخصصة
    if (selectedDays === "20+") {
        priceText += " / يومياً";
    }
    
    priceDisplay.textContent = priceText;
    priceDisplay.style.display = 'block';
});

/**
 * ====================================================================
 * منطق التحكم بالعمر (أزرار + و - والتحقق اليدوي)
 * ====================================================================
 */
const ageMinInput = document.getElementById('ageMin');
const ageMaxInput = document.getElementById('ageMax');

const btnMinMinus = document.getElementById('ageMinMinus');
const btnMinPlus = document.getElementById('ageMinPlus');
const btnMaxMinus = document.getElementById('ageMaxMinus');
const btnMaxPlus = document.getElementById('ageMaxPlus');

// دالة للتحقق من صحة الأعمار وتصحيحها
function validateAges() {
    let min = parseInt(ageMinInput.value) || 18;
    let max = parseInt(ageMaxInput.value) || 65;

    // القيود الأساسية
    if (min < 18) min = 18;
    if (max > 65) max = 65;

    // منع التداخل (يجب أن يكون الحد الأدنى أصغر من الحد الأقصى)
    if (min >= max) {
        if (this === ageMinInput || this === btnMinPlus) {
            max = min + 1; // إذا رفعنا الصغير، نرفع الكبير معه
            if (max > 65) { max = 65; min = 64; }
        } else {
            min = max - 1; // إذا نزلنا الكبير، ننزل الصغير معه
            if (min < 18) { min = 18; max = 19; }
        }
    }

    ageMinInput.value = min;
    ageMaxInput.value = max;
}

// ربط الأزرار
btnMinMinus.addEventListener('click', () => { ageMinInput.value = parseInt(ageMinInput.value) - 1; validateAges.call(btnMinMinus); });
btnMinPlus.addEventListener('click', () => { ageMinInput.value = parseInt(ageMinInput.value) + 1; validateAges.call(btnMinPlus); });
btnMaxMinus.addEventListener('click', () => { ageMaxInput.value = parseInt(ageMaxInput.value) - 1; validateAges.call(btnMaxMinus); });
btnMaxPlus.addEventListener('click', () => { ageMaxInput.value = parseInt(ageMaxInput.value) + 1; validateAges.call(btnMaxPlus); });

// ربط الإدخال اليدوي
ageMinInput.addEventListener('blur', validateAges);
ageMaxInput.addEventListener('blur', validateAges);

/**
 * ====================================================================
 * منطق المواقع (كل سوريا مقابل المحافظات)
 * ====================================================================
 */
const allSyriaCheckbox = document.getElementById('allSyria');
const cityCheckboxes = document.querySelectorAll('.city-cb input[type="checkbox"]');

allSyriaCheckbox.addEventListener('change', function() {
    const isChecked = this.checked;
    
    cityCheckboxes.forEach(cb => {
        cb.disabled = isChecked; // قفل أو فتح المحافظات
        if (isChecked) cb.checked = false; // إزالة التحديد إذا تم اختيار كل سوريا
        
        // إضافة/إزالة كلاس الشفافية للتصميم
        cb.parentElement.classList.toggle('disabled', isChecked);
    });
});

/**
 * ====================================================================
 * عرض اسم ملف إثبات الدفع
 * ====================================================================
 */
const fileInput = document.getElementById('paymentProof');
const fileNameDisplay = document.getElementById('file-name-display');

fileInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
        fileNameDisplay.textContent = `تم إرفاق: ${this.files[0].name}`;
        fileNameDisplay.style.color = "var(--secondary-color)";
    } else {
        fileNameDisplay.textContent = '';
    }
});

/**
 * ====================================================================
 * تجميع البيانات وإرسالها عبر واتساب
 * ====================================================================
 */
const orderForm = document.getElementById('orderForm');

orderForm.addEventListener('submit', function(e) {
    e.preventDefault(); // منع إعادة تحميل الصفحة

    // 1. التحقق من اختيار موقع واحد على الأقل (إذا لم يتم اختيار كل سوريا)
    if (!allSyriaCheckbox.checked) {
        const checkedCities = Array.from(cityCheckboxes).filter(cb => cb.checked);
        if (checkedCities.length === 0) {
            alert("يرجى اختيار محافظة واحدة على الأقل، أو تحديد خيار 'كل سوريا'.");
            return;
        }
    }

    // 2. جمع البيانات من النموذج
    const duration = durationSelect.value;
    const packageType = packageSelect.value;
    const pageLink = document.getElementById('pageLink').value;
    const postLink = document.getElementById('postLink').value;
    const adminId = document.getElementById('adminId').value;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    const ageMin = ageMinInput.value;
    const ageMax = ageMaxInput.value;
    const gender = document.querySelector('input[name="gender"]:checked').value;
    
    // جمع المواقع
    let locations = "";
    if (allSyriaCheckbox.checked) {
        locations = "كل سوريا";
    } else {
        const checkedCities = Array.from(cityCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
        locations = checkedCities.join('، ');
    }

    // 3. تنسيق رسالة الواتساب
    const message = `
مرحباً Aura Media، أود تقديم طلب تمويل جديد 🚀

📦 *تفاصيل الباقة:*
- المدة: ${duration === '20+' ? '20 يوم وما فوق (مخصص)' : duration + ' أيام'}
- نوع الباقة: ${packageType}

🔗 *الروابط والمعرفات:*
- رابط الصفحة: ${pageLink}
- رابط المنشور: ${postLink}
- معرف المشرف المضاف: ${adminId}

🎯 *الاستهداف:*
- العمر: من ${ageMin} إلى ${ageMax}
- الجنس: ${gender}
- الموقع: ${locations}

💳 *الدفع:*
- طريقة الدفع: ${paymentMethod}
- إثبات الدفع: (سأقوم بإرفاق الصورة في هذه المحادثة الآن)
    `.trim();

    // 4. تنبيه المستخدم بضرورة إرفاق الصورة يدوياً
    alert("تم تجهيز طلبك بنجاح!\n\nملاحظة هامة جداً: سيتم تحويلك الآن إلى واتساب، يرجى عدم نسيان إرفاق (صورة إثبات الدفع) في المحادثة قبل الضغط على إرسال.");

    // 5. فتح رابط واتساب
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
});
