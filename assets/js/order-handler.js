/**
 * ====================================================================
 * إعدادات النظام الأساسية
 * ====================================================================
 */
// ضع رقم الواتساب الخاص بك هنا (مع رمز الدولة وبدون أصفار أو علامة +)
// مثال لسوريا: 9639xxxxxxxx
const WHATSAPP_NUMBER = "963900000000"; 

// بيانات التسعير بالدولار
const pricingData = {
    "5": { "فضية": 10, "ذهبية": 19, "ماسية": 30 },
    "10": { "فضية": 21, "ذهبية": 41, "ماسية": 61 },
    "15": { "فضية": 32, "ذهبية": 63, "ماسية": 99 },
    "20+": { "فضية": 1.89, "ذهبية": 3.89, "ماسية": 5.89 } // تسعير يومي
};

let currentExchangeRate = 1; // سيتم تحديثه من ملف rate.json

/**
 * ====================================================================
 * عناصر DOM الأساسية
 * ====================================================================
 */
const durationSelect = document.getElementById('duration');
const packageSelect = document.getElementById('packageType');
const priceDisplay = document.getElementById('priceDisplay');
const customDaysContainer = document.getElementById('customDaysContainer');
const customDaysInput = document.getElementById('customDays');

/**
 * ====================================================================
 * التهيئة عند تحميل الصفحة (جلب السعر + قراءة الرابط الذكي)
 * ====================================================================
 */
document.addEventListener('DOMContentLoaded', async () => {
    // 1. جلب سعر الصرف
    try {
        const response = await fetch('rate.json');
        if (response.ok) {
            const data = await response.json();
            currentExchangeRate = data.usd_syp;
        }
    } catch (error) {
        console.error('تعذر جلب سعر الصرف:', error);
    }

    // 2. قراءة البيانات من الرابط (إذا جاء الزبون من صفحة التسعير)
    const urlParams = new URLSearchParams(window.location.search);
    const urlDuration = urlParams.get('duration');
    const urlPackage = urlParams.get('package');

    if (urlDuration) {
        // اختيار عدد الأيام
        durationSelect.value = urlDuration;
        // تشغيل حدث التغيير لتعبئة قائمة الباقات
        durationSelect.dispatchEvent(new Event('change'));

        // اختيار نوع الباقة إذا كانت موجودة في الرابط
        if (urlPackage) {
            // ننتظر قليلاً لضمان تعبئة القائمة
            setTimeout(() => {
                packageSelect.value = urlPackage;
                packageSelect.dispatchEvent(new Event('change'));
            }, 50);
        }
    }
});

/**
 * ====================================================================
 * منطق الباقات والتسعير الديناميكي
 * ====================================================================
 */

// دالة حساب وعرض السعر
function calculateAndDisplayPrice() {
    if (!packageSelect.value) return;

    const selectedOption = packageSelect.options[packageSelect.selectedIndex];
    const usdPrice = parseFloat(selectedOption.dataset.usd);
    const selectedDays = durationSelect.value;
    
    if (selectedDays === "20+") {
        // حساب السعر الإجمالي للأيام المخصصة
        let days = parseInt(customDaysInput.value);
        if (isNaN(days) || days < 20) days = 20; // الحد الأدنى 20
        
        const totalUsd = usdPrice * days;
        const sypPrice = Math.round(totalUsd * currentExchangeRate).toLocaleString('en-US');
        
        priceDisplay.textContent = `السعر الإجمالي لـ ${days} يوم: ${totalUsd.toFixed(2)}$ (حوالي ${sypPrice} ل.س)`;
    } else {
        // حساب السعر للباقات الثابتة
        const sypPrice = Math.round(usdPrice * currentExchangeRate).toLocaleString('en-US');
        priceDisplay.textContent = `السعر: ${usdPrice}$ (حوالي ${sypPrice} ل.س)`;
    }
    
    priceDisplay.style.display = 'block';
}

// عند تغيير عدد الأيام
durationSelect.addEventListener('change', function() {
    const selectedDays = this.value;
    
    // إظهار أو إخفاء حقل الأيام المخصصة
    if (selectedDays === "20+") {
        customDaysContainer.style.display = 'block';
        customDaysInput.setAttribute('required', 'required');
        if (!customDaysInput.value) customDaysInput.value = 20; // قيمة افتراضية
    } else {
        customDaysContainer.style.display = 'none';
        customDaysInput.removeAttribute('required');
    }

    // تفريغ قائمة الباقات وتفعيلها
    packageSelect.innerHTML = '<option value="" disabled selected>اختر نوع الباقة...</option>';
    packageSelect.disabled = false;
    priceDisplay.style.display = 'none';

    // جلب الباقات الخاصة بعدد الأيام المحدد
    const availablePackages = pricingData[selectedDays];
    
    for (const [pkgName, usdPrice] of Object.entries(availablePackages)) {
        const option = document.createElement('option');
        option.value = pkgName;
        option.dataset.usd = usdPrice;
        
        if (selectedDays === "20+") {
            option.textContent = `الباقة ال${pkgName} (${usdPrice}$ يومياً)`;
        } else {
            option.textContent = `الباقة ال${pkgName}`;
        }
        
        packageSelect.appendChild(option);
    }
});

// عند اختيار نوع الباقة
packageSelect.addEventListener('change', calculateAndDisplayPrice);

// عند تغيير عدد الأيام المخصصة (تحديث السعر فوراً)
customDaysInput.addEventListener('input', calculateAndDisplayPrice);
customDaysInput.addEventListener('blur', function() {
    if (this.value !== "" && parseInt(this.value) < 20) {
        this.value = 20;
        calculateAndDisplayPrice();
    }
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

function validateAges() {
    let min = parseInt(ageMinInput.value) || 18;
    let max = parseInt(ageMaxInput.value) || 65;

    if (min < 18) min = 18;
    if (max > 65) max = 65;

    if (min >= max) {
        if (this === ageMinInput || this === btnMinPlus) {
            max = min + 1;
            if (max > 65) { max = 65; min = 64; }
        } else {
            min = max - 1;
            if (min < 18) { min = 18; max = 19; }
        }
    }

    ageMinInput.value = min;
    ageMaxInput.value = max;
}

btnMinMinus.addEventListener('click', () => { ageMinInput.value = parseInt(ageMinInput.value) - 1; validateAges.call(btnMinMinus); });
btnMinPlus.addEventListener('click', () => { ageMinInput.value = parseInt(ageMinInput.value) + 1; validateAges.call(btnMinPlus); });
btnMaxMinus.addEventListener('click', () => { ageMaxInput.value = parseInt(ageMaxInput.value) - 1; validateAges.call(btnMaxMinus); });
btnMaxPlus.addEventListener('click', () => { ageMaxInput.value = parseInt(ageMaxInput.value) + 1; validateAges.call(btnMaxPlus); });

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
        cb.disabled = isChecked;
        if (isChecked) cb.checked = false;
        cb.parentElement.classList.toggle('disabled', isChecked);
    });
});

/**
 * ====================================================================
 * إدارة رفع وحذف إثبات الدفع
 * ====================================================================
 */
const fileInput = document.getElementById('paymentProof');
const fileDisplayContainer = document.getElementById('file-display-container');
const fileNameDisplay = document.getElementById('file-name-display');
const removeFileBtn = document.getElementById('remove-file-btn');

// عند اختيار ملف
fileInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
        fileNameDisplay.textContent = this.files[0].name;
        fileDisplayContainer.style.display = 'flex'; // إظهار الحاوية
    } else {
        fileDisplayContainer.style.display = 'none';
    }
});

// عند الضغط على زر الحذف
removeFileBtn.addEventListener('click', function() {
    fileInput.value = ''; // تفريغ حقل الملف
    fileDisplayContainer.style.display = 'none'; // إخفاء الحاوية
    fileNameDisplay.textContent = '';
});

/**
 * ====================================================================
 * تجميع البيانات وإرسالها عبر واتساب
 * ====================================================================
 */
const orderForm = document.getElementById('orderForm');

orderForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // 1. التحقق من المواقع
    if (!allSyriaCheckbox.checked) {
        const checkedCities = Array.from(cityCheckboxes).filter(cb => cb.checked);
        if (checkedCities.length === 0) {
            alert("يرجى اختيار محافظة واحدة على الأقل، أو تحديد خيار 'كل سوريا'.");
            return;
        }
    }

    // 2. التحقق من الأيام المخصصة
    const duration = durationSelect.value;
    let finalDurationText = "";
    if (duration === "20+") {
        const customDays = parseInt(customDaysInput.value);
        if (isNaN(customDays) || customDays < 20) {
            alert("يرجى إدخال عدد أيام صحيح (20 يوم أو أكثر).");
            customDaysInput.focus();
            return;
        }
        finalDurationText = `${customDays} يوم (مخصص)`;
    } else {
        finalDurationText = `${duration} أيام`;
    }

    // 3. جمع باقي البيانات
    const packageType = packageSelect.value;
    const pageLink = document.getElementById('pageLink').value;
    const postLink = document.getElementById('postLink').value;
    
    // جلب اسم المشرف والمعرف من الخيار المحدد
    const adminSelect = document.getElementById('adminId');
    const adminText = adminSelect.options[adminSelect.selectedIndex].text;
    
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const ageMin = ageMinInput.value;
    const ageMax = ageMaxInput.value;
    const gender = document.querySelector('input[name="gender"]:checked').value;
    
    let locations = "";
    if (allSyriaCheckbox.checked) {
        locations = "كل سوريا";
    } else {
        const checkedCities = Array.from(cityCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
        locations = checkedCities.join('، ');
    }

    // 4. تنسيق رسالة الواتساب
    const message = `
مرحباً Aura Media، أود تقديم طلب تمويل جديد 🚀

📦 *تفاصيل الباقة:*
- المدة: ${finalDurationText}
- نوع الباقة: ${packageType}

🔗 *الروابط والمعرفات:*
- رابط الصفحة: ${pageLink}
- رابط المنشور: ${postLink}
- المشرف المضاف: ${adminText}

🎯 *الاستهداف:*
- العمر: من ${ageMin} إلى ${ageMax}
- الجنس: ${gender}
- الموقع: ${locations}

💳 *الدفع:*
- طريقة الدفع: ${paymentMethod}
- إثبات الدفع: (سأقوم بإرفاق الصورة في هذه المحادثة الآن)
    `.trim();

    // 5. التنبيه والتحويل
    alert("تم تجهيز طلبك بنجاح!\n\nملاحظة هامة جداً: سيتم تحويلك الآن إلى واتساب، يرجى عدم نسيان إرفاق (صورة إثبات الدفع) في المحادثة قبل الضغط على إرسال.");

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
});
