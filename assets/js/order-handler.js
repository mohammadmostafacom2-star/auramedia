/**
 * ====================================================================
 * إعدادات النظام الأساسية
 * ====================================================================
 */
// ضع رقم الواتساب الخاص بك هنا (مع رمز الدولة وبدون أصفار أو علامة +)
const WHATSAPP_NUMBER = "963900000000"; 

// إعدادات Cloudinary
const CLOUDINARY_CLOUD_NAME = "ddoumoqfo";
const CLOUDINARY_UPLOAD_PRESET = "rst619";

// بيانات التسعير بالدولار
const pricingData = {
    "5": { "فضية": 10, "ذهبية": 19, "ماسية": 30 },
    "10": { "فضية": 21, "ذهبية": 41, "ماسية": 61 },
    "15": { "فضية": 32, "ذهبية": 63, "ماسية": 99 },
    "20+": { "فضية": 1.89, "ذهبية": 3.89, "ماسية": 5.89 }
};

let currentExchangeRate = 1;
let uploadedImageUrl = null; // لتخزين رابط الصورة المرفوعة

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
const orderForm = document.getElementById('orderForm');
const submitBtn = orderForm.querySelector('.submit-btn');

/**
 * ====================================================================
 * التهيئة عند تحميل الصفحة
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

    const urlParams = new URLSearchParams(window.location.search);
    const urlDuration = urlParams.get('duration');
    const urlPackage = urlParams.get('package');

    if (urlDuration) {
        durationSelect.value = urlDuration;
        durationSelect.dispatchEvent(new Event('change'));
        if (urlPackage) {
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
function calculateAndDisplayPrice() {
    if (!packageSelect.value) return;
    const selectedOption = packageSelect.options[packageSelect.selectedIndex];
    const usdPrice = parseFloat(selectedOption.dataset.usd);
    const selectedDays = durationSelect.value;
    
    if (selectedDays === "20+") {
        let days = parseInt(customDaysInput.value) || 20;
        if (days < 20) days = 20;
        const totalUsd = usdPrice * days;
        const sypPrice = Math.round(totalUsd * currentExchangeRate).toLocaleString('en-US');
        priceDisplay.textContent = `الإجمالي لـ ${days} يوم: ${totalUsd.toFixed(2)}$ (حوالي ${sypPrice} ل.س)`;
    } else {
        const sypPrice = Math.round(usdPrice * currentExchangeRate).toLocaleString('en-US');
        priceDisplay.textContent = `السعر: ${usdPrice}$ (حوالي ${sypPrice} ل.س)`;
    }
    priceDisplay.style.display = 'block';
}

durationSelect.addEventListener('change', function() {
    const selectedDays = this.value;
    customDaysContainer.style.display = selectedDays === "20+" ? 'block' : 'none';
    customDaysInput.required = selectedDays === "20+";
    if (selectedDays === "20+" && !customDaysInput.value) customDaysInput.value = 20;

    packageSelect.innerHTML = '<option value="" disabled selected>اختر نوع الباقة...</option>';
    packageSelect.disabled = false;
    priceDisplay.style.display = 'none';

    const availablePackages = pricingData[selectedDays];
    for (const [pkgName, usdPrice] of Object.entries(availablePackages)) {
        const option = document.createElement('option');
        option.value = pkgName;
        option.dataset.usd = usdPrice;
        option.textContent = selectedDays === "20+" ? `الباقة ال${pkgName} (${usdPrice}$ يومياً)` : `الباقة ال${pkgName}`;
        packageSelect.appendChild(option);
    }
});

packageSelect.addEventListener('change', calculateAndDisplayPrice);
customDaysInput.addEventListener('input', calculateAndDisplayPrice);
customDaysInput.addEventListener('blur', function() {
    if (this.value !== "" && parseInt(this.value) < 20) {
        this.value = 20;
        calculateAndDisplayPrice();
    }
});

/**
 * ====================================================================
 * منطق ضغط ورفع الصور الذكي
 * ====================================================================
 */
const fileInput = document.getElementById('paymentProof');
const fileDisplayContainer = document.getElementById('file-display-container');
const fileNameDisplay = document.getElementById('file-name-display');
const removeFileBtn = document.getElementById('remove-file-btn');
const fileUploadText = document.querySelector('.file-upload-text');

fileInput.addEventListener('change', async function() {
    const file = this.files[0];
    if (!file) return;

    // 1. التحقق من الحماية (20 صورة/ساعة)
    if (isUploadLimitExceeded()) {
        alert("لقد تجاوزت الحد المسموح للرفع (20 صورة في الساعة). يرجى المحاولة لاحقاً.");
        this.value = ''; // مسح الملف المختار
        return;
    }

    // 2. التحقق من الحجم والنوع
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        alert("صيغة الملف غير مدعومة. يرجى رفع صورة من نوع JPG, PNG, أو WebP.");
        this.value = '';
        return;
    }
    if (file.size > 26214400) { // 25 MB
        alert("حجم الصورة كبير جداً (أكبر من 25 ميجابايت).");
        this.value = '';
        return;
    }

    // 3. الضغط والرفع
    try {
        fileUploadText.textContent = '⏳ جاري ضغط الصورة...';
        submitBtn.disabled = true;

        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: 'image/webp'
        };
        const compressedFile = await imageCompression(file, options);

        fileUploadText.textContent = '☁️ جاري رفع الصورة للسحابة...';
        const imageUrl = await uploadToCloudinary(compressedFile);
        uploadedImageUrl = imageUrl; // حفظ الرابط

        // تحديث الواجهة
        fileNameDisplay.textContent = `تم الرفع بنجاح: ${file.name}`;
        fileDisplayContainer.style.display = 'flex';
        fileUploadText.textContent = 'اضغط لرفع صورة الإشعار';
        submitBtn.disabled = false;
        recordUploadTimestamp(); // تسجيل وقت الرفع الناجح

    } catch (error) {
        console.error('خطأ في الضغط أو الرفع:', error);
        alert('حدث خطأ أثناء معالجة الصورة. يرجى المحاولة مرة أخرى.');
        fileUploadText.textContent = 'اضغط لرفع صورة الإشعار';
        submitBtn.disabled = false;
        this.value = '';
    }
});

removeFileBtn.addEventListener('click', function() {
    fileInput.value = '';
    uploadedImageUrl = null;
    fileDisplayContainer.style.display = 'none';
    fileNameDisplay.textContent = '';
});

async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error('فشل الرفع إلى Cloudinary');
    }

    const data = await response.json();
    return data.secure_url;
}

/**
 * ====================================================================
 * نظام الحماية من الرفع المتكرر
 * ====================================================================
 */
function recordUploadTimestamp() {
    const now = Date.now();
    let timestamps = JSON.parse(localStorage.getItem('uploadTimestamps')) || [];
    timestamps.push(now);
    localStorage.setItem('uploadTimestamps', JSON.stringify(timestamps));
}

function isUploadLimitExceeded() {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    let timestamps = JSON.parse(localStorage.getItem('uploadTimestamps')) || [];
    
    // فلترة الأوقات القديمة
    timestamps = timestamps.filter(ts => ts > oneHourAgo);
    localStorage.setItem('uploadTimestamps', JSON.stringify(timestamps));

    return timestamps.length >= 20;
}

/**
 * ====================================================================
 * تجميع البيانات وإرسالها عبر واتساب
 * ====================================================================
 */
orderForm.addEventListener('submit', function(e) {
    e.preventDefault();

    if (!uploadedImageUrl) {
        alert("يرجى رفع صورة إثبات الدفع أولاً.");
        return;
    }

    // جمع البيانات
    const duration = durationSelect.value;
    let finalDurationText = duration === "20+" ? `${customDaysInput.value} يوم (مخصص)` : `${duration} أيام`;
    
    const packageType = packageSelect.value;
    const pageLink = document.getElementById('pageLink').value;
    const postLink = document.getElementById('postLink').value;
    const adminText = document.getElementById('adminId').options[document.getElementById('adminId').selectedIndex].text;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const ageMin = document.getElementById('ageMin').value;
    const ageMax = document.getElementById('ageMax').value;
    const gender = document.querySelector('input[name="gender"]:checked').value;
    
    let locations = "";
    if (document.getElementById('allSyria').checked) {
        locations = "كل سوريا";
    } else {
        const checkedCities = Array.from(document.querySelectorAll('.city-cb input:checked')).map(cb => cb.value);
        if (checkedCities.length === 0) {
            alert("يرجى اختيار محافظة واحدة على الأقل، أو تحديد 'كل سوريا'.");
            return;
        }
        locations = checkedCities.join('، ');
    }

    // تنسيق الرسالة مع رابط الصورة
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
- رابط إثبات الدفع: ${uploadedImageUrl}
    `.trim();

    // فتح رابط واتساب
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
});

// باقي الدوال (التحكم بالعمر والمواقع) تبقى كما هي
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
