const { v2: cloudinary } = require('cloudinary');

// إعدادات الاتصال بـ Cloudinary باستخدام الأسرار من GitHub
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function cleanupOldImages() {
  try {
    console.log('بدء عملية البحث عن الصور القديمة...');

    // جلب جميع الصور من حساب Cloudinary
    const { resources } = await cloudinary.search
      .expression('resource_type:image')
      .sort_by('created_at', 'asc')
      .max_results(500) // جلب أقدم 500 صورة
      .execute();

    if (resources.length === 0) {
      console.log('لا توجد صور لحذفها. انتهاء العملية.');
      return;
    }

    console.log(`تم العثور على ${resources.length} صورة. بدء الفحص...`);

    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    // تحديد الصور التي يجب حذفها
    const idsToDelete = resources
      .filter(resource => new Date(resource.created_at) < tenDaysAgo)
      .map(resource => resource.public_id);

    if (idsToDelete.length === 0) {
      console.log('لا توجد صور أقدم من 10 أيام. انتهاء العملية.');
      return;
    }

    console.log(`تم تحديد ${idsToDelete.length} صورة للحذف. بدء عملية الحذف...`);

    // حذف الصور دفعة واحدة (أكثر كفاءة)
    await cloudinary.api.delete_resources(idsToDelete);

    console.log(`✅ تم حذف ${idsToDelete.length} صورة بنجاح.`);

  } catch (error) {
    console.error('❌ حدث خطأ أثناء عملية التنظيف:', error.message);
    process.exit(1); // إيقاف السكربت بخطأ لكي يسجله GitHub كفشل
  }
}

cleanupOldImages();
