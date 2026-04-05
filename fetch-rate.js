const fs = require('fs');

async function fetchRate() {
    try {
        // الاتصال بـ API الليرة السورية لجلب سعر الدولار فقط
        const response = await fetch('https://lirascope.syria-cloud.sy/api/v1/rates/latest?currencies=USD');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // استخراج السعر الفعال (effectiveRates) أو سعر السوق (marketRates)
        const rates = data.effectiveRates || data.marketRates;
        
        if (!rates) {
            throw new Error('لم يتم العثور على مصفوفة الأسعار في الاستجابة.');
        }

        const usdRateObj = rates.find(r => r.currency === 'USD');
        
        if (usdRateObj && usdRateObj.sell) {
            // تجهيز البيانات التي سيتم حفظها
            const rateData = {
                usd_syp: usdRateObj.sell, // نعتمد سعر المبيع
                last_updated: new Date().toISOString()
            };

            // حفظ البيانات في ملف rate.json في نفس المجلد
            fs.writeFileSync('rate.json', JSON.stringify(rateData, null, 2));
            console.log('تم تحديث السعر بنجاح وحفظه في rate.json. السعر الحالي:', rateData.usd_syp);
        } else {
            throw new Error('لم يتم العثور على سعر الدولار (USD) في الاستجابة.');
        }
    } catch (error) {
        console.error('حدث خطأ أثناء جلب السعر:', error.message);
        process.exit(1); // إيقاف السكربت بخطأ لكي يسجله GitHub Actions كفشل إذا حدث
    }
}

fetchRate();
