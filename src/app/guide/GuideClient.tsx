'use client';

import InfoPageLayout from '@/components/InfoPageLayout';
import type { Language } from '@/lib/types';

const steps = {
  en: [
    {
      icon: 'fa-sync-alt',
      title: 'Check Live Gold Prices',
      description:
        'When the app opens, it automatically fetches live gold prices from the market. You can see current buy and sell prices for 18K, 21K, and 24K gold, plus the USD/EGP exchange rate. Hit "Refresh Prices" at any time to get the latest rates.',
    },
    {
      icon: 'fa-list-alt',
      title: 'Select a Gold Product',
      description:
        'In the calculator section, open the "Select Product" dropdown. Choose from options such as gold ingots (5g, 10g, 20g, 50g, 100g), the gold ounce, or 21K/24K gold coins. Each product shows its live price next to the name.',
    },
    {
      icon: 'fa-exchange-alt',
      title: 'Choose Calculation Type',
      description:
        'Pick your calculation direction: "Gold → Cash" to find out how much your gold is worth in EGP, or "Cash → Gold" to discover how much gold you can buy with a specific amount of money.',
    },
    {
      icon: 'fa-keyboard',
      title: 'Enter Your Details',
      description:
        'For "Gold → Cash": enter the number of pieces and (optionally) the weight per piece. For "Cash → Gold": enter your budget in EGP and choose whether you want whole pieces or allow fractional grams. Fees are calculated automatically based on the gold type.',
    },
    {
      icon: 'fa-calculator',
      title: 'Calculate',
      description:
        'Tap the "Calculate" button. The app instantly shows you buy price, sell price, total value, fees, and final amounts. For "Cash → Gold" it also shows the optimal breakdown of pieces you can get.',
    },
    {
      icon: 'fa-bookmark',
      title: 'Save & Review History',
      description:
        'Hit "Save" to store the current calculation in your history. Open "History" anytime to review your past calculations. All data is saved locally on your device — no account required.',
    },
    {
      icon: 'fa-share-alt',
      title: 'Share the App',
      description:
        'Use the "Share" button to copy the app link and send it to friends or family who want to check gold prices or do their own calculations.',
    },
  ],
  ar: [
    {
      icon: 'fa-sync-alt',
      title: 'تحقق من أسعار الذهب اللحظية',
      description:
        'عند فتح التطبيق، يجلب الأسعار تلقائياً من السوق. يمكنك رؤية أسعار الشراء والبيع الحالية لعيار ١٨ و٢١ و٢٤، بالإضافة إلى سعر صرف الدولار/الجنيه. اضغط "تحديث الأسعار" في أي وقت للحصول على أحدث الأسعار.',
    },
    {
      icon: 'fa-list-alt',
      title: 'اختر منتج الذهب',
      description:
        'في قسم الحاسبة، افتح قائمة "اختر المنتج". اختر من بين السبائك (٥ جرام، ١٠ جرام، ٢٠ جرام، ٥٠ جرام، ١٠٠ جرام)، أو أونصة الذهب، أو ذهب عيار ٢١/٢٤. يظهر السعر الحالي بجانب كل منتج.',
    },
    {
      icon: 'fa-exchange-alt',
      title: 'اختر نوع العملية الحسابية',
      description:
        'اختر اتجاه العملية: "ذهب ← نقود" لمعرفة قيمة الذهب الذي تملكه بالجنيه المصري، أو "نقود ← ذهب" لمعرفة كمية الذهب التي يمكنك شراؤها بمبلغ معين.',
    },
    {
      icon: 'fa-keyboard',
      title: 'أدخل التفاصيل',
      description:
        'لـ"ذهب ← نقود": أدخل عدد القطع و(اختياريًا) وزن القطعة. لـ"نقود ← ذهب": أدخل ميزانيتك بالجنيه المصري واختر ما إذا كنت تريد قطعًا كاملة أو السماح بالجرامات الكسرية. تُحسب الرسوم تلقائيًا بناءً على نوع الذهب.',
    },
    {
      icon: 'fa-calculator',
      title: 'احسب',
      description:
        'اضغط زر "احسب". يعرض التطبيق فوراً سعر الشراء والبيع والقيمة الإجمالية والرسوم والمبالغ النهائية. في وضع "نقود ← ذهب" يظهر أيضاً التوزيع الأمثل للقطع.',
    },
    {
      icon: 'fa-bookmark',
      title: 'احفظ وراجع السجل',
      description:
        'اضغط "حفظ" لتخزين الحساب الحالي في السجل. افتح "التاريخ" في أي وقت لمراجعة حساباتك السابقة. تُحفظ جميع البيانات محلياً على جهازك — لا يلزم إنشاء حساب.',
    },
    {
      icon: 'fa-share-alt',
      title: 'شارك التطبيق',
      description:
        'استخدم زر "مشاركة" لنسخ رابط التطبيق وإرساله لأصدقائك أو عائلتك ممن يريدون التحقق من أسعار الذهب أو إجراء حساباتهم الخاصة.',
    },
  ],
};

const faqs = {
  en: [
    {
      q: 'How accurate are the gold prices?',
      a: 'Prices are fetched live from market APIs. In rare cases when the primary source is unavailable, the app uses a backup source and shows a warning. Always verify with an official dealer before making transactions.',
    },
    {
      q: 'What is the "Auto Fee"?',
      a: 'Gold dealers charge a fabrication or workmanship fee per gram on top of the raw gold price. The app automatically applies realistic fee rates based on gold type (e.g., higher fees for smaller ingots). You can also set a custom fee for 18K gold.',
    },
    {
      q: 'What does "Gold → Cash" mean?',
      a: 'This mode calculates the total value of gold you own. Enter the product, quantity, and the app shows you how much you would receive if you sell it (bid price) and how much it would cost to buy more (ask price).',
    },
    {
      q: 'What does "Cash → Gold" mean?',
      a: 'This mode calculates how much gold you can purchase with a given budget. The app shows the maximum whole pieces (e.g., ingots) you can buy and any remaining money, or the equivalent in grams if you select fractional mode.',
    },
    {
      q: 'Is my data stored online?',
      a: 'No. All calculations and history are stored locally on your device using the browser\'s localStorage. Nothing is sent to any server.',
    },
    {
      q: 'Does the app work offline?',
      a: 'The app works offline for calculations using the last cached prices. You need an internet connection to refresh live prices.',
    },
  ],
  ar: [
    {
      q: 'ما مدى دقة أسعار الذهب؟',
      a: 'تُجلب الأسعار مباشرةً من واجهات برمجة السوق. في حالات نادرة عند تعذّر الوصول للمصدر الرئيسي، يستخدم التطبيق مصدراً احتياطياً مع تنبيه. تحقق دائماً من تاجر رسمي قبل إجراء أي معاملة.',
    },
    {
      q: 'ما هي "الرسوم التلقائية"؟',
      a: 'يتقاضى تجار الذهب رسوم مصنعية أو صناعة لكل جرام إضافةً لسعر الذهب الخام. يطبّق التطبيق تلقائياً معدلات رسوم واقعية بناءً على نوع الذهب (مثل رسوم أعلى للسبائك الأصغر). يمكنك أيضاً تحديد رسوم مخصصة لعيار ١٨.',
    },
    {
      q: 'ماذا يعني "ذهب ← نقود"؟',
      a: 'هذا الوضع يحسب القيمة الإجمالية للذهب الذي تملكه. أدخل المنتج والكمية، وسيوضح التطبيق المبلغ الذي ستحصل عليه عند البيع (سعر البيع) وتكلفة شراء المزيد (سعر الشراء).',
    },
    {
      q: 'ماذا يعني "نقود ← ذهب"؟',
      a: 'هذا الوضع يحسب كمية الذهب التي يمكن شراؤها بميزانية محددة. يعرض التطبيق أقصى عدد من القطع الكاملة (مثل السبائك) التي يمكن شراؤها والمبلغ المتبقي، أو المعادل بالجرامات في وضع الجرامات الكسرية.',
    },
    {
      q: 'هل تُحفظ بياناتي عبر الإنترنت؟',
      a: 'لا. تُخزَّن جميع الحسابات والسجل محلياً على جهازك باستخدام localStorage في المتصفح. لا يُرسَل شيء إلى أي خادم.',
    },
    {
      q: 'هل يعمل التطبيق بدون إنترنت؟',
      a: 'يعمل التطبيق بدون إنترنت للحسابات باستخدام آخر أسعار مخزّنة. تحتاج إلى اتصال بالإنترنت لتحديث الأسعار اللحظية.',
    },
  ],
};

function GuideContent({ lang }: { lang: Language }) {
  const ar = lang === 'ar';
  const stepList = ar ? steps.ar : steps.en;
  const faqList = ar ? faqs.ar : faqs.en;

  return (
    <>
      <article className="info-article">
        <header className="info-article-header">
          <h2>
            {ar
              ? 'دليل استخدام حاسبة الذهب BTC خطوة بخطوة'
              : 'Step-by-Step Guide to the BTC Gold Calculator'}
          </h2>
          <p className="info-article-intro">
            {ar
              ? 'حاسبة الذهب BTC أداة مجانية لحساب أسعار الذهب اللحظية في مصر. سواء كنت تريد معرفة قيمة ذهبك أو تخطط لشراء سبائك ذهبية، هذا الدليل يشرح لك كل خطوة.'
              : 'The BTC Gold Calculator is a free tool for live gold price calculations in Egypt. Whether you want to value your gold or plan a purchase, this guide walks you through every step.'}
          </p>
        </header>

        <ol className="guide-steps">
          {stepList.map((step, i) => (
            <li key={i} className="guide-step">
              <div className="guide-step-icon" aria-hidden="true">
                <i className={`fas ${step.icon}`} />
              </div>
              <div className="guide-step-content">
                <h3>
                  <span className="guide-step-num">{i + 1}.</span>
                  {' '}{step.title}
                </h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </article>

      <article className="info-article">
        <header className="info-article-header">
          <h2>{ar ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}</h2>
        </header>
        <dl className="faq-list">
          {faqList.map((item, i) => (
            <div key={i} className="faq-item">
              <dt className="faq-question">
                <i className="fas fa-question-circle" aria-hidden="true" />
                {item.q}
              </dt>
              <dd className="faq-answer">{item.a}</dd>
            </div>
          ))}
        </dl>
      </article>

      <article className="info-article info-article-cta">
        <div className="cta-content">
          <h2>{ar ? 'ابدأ الآن' : 'Start Calculating'}</h2>
          <p>
            {ar
              ? 'جرّب الحاسبة الآن واكتشف قيمة ذهبك أو خطّط لمدخراتك بسهولة.'
              : 'Try the calculator now and instantly find out your gold\'s value or plan your next purchase.'}
          </p>
          <a href="/" className="cta-btn">
            <i className="fas fa-calculator" aria-hidden="true" />
            {ar ? 'افتح الحاسبة' : 'Open Calculator'}
          </a>
        </div>
      </article>
    </>
  );
}

export default function GuideClient() {
  return (
    <InfoPageLayout titleEn="How to Use Guide" titleAr="دليل الاستخدام">
      {(lang) => <GuideContent lang={lang} />}
    </InfoPageLayout>
  );
}
