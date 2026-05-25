# 🚀 دليل الإعداد — Subshed

## قبل البدء: تثبيت Node.js

1. اذهب إلى: https://nodejs.org
2. حمّل: LTS version
3. نصّبه على جهازك
4. تأكد بفتح CMD وكتابة: node --version

---

## الخطوة 1 — أضف مفاتيح API في ملف .env.local

افتح ملف .env.local الموجود في هذا المجلد وأضف:

### أ) Google OAuth
- اذهب: https://console.cloud.google.com
- New Project → اسمه subshed
- APIs & Services → Library → Gmail API → Enable
- Credentials → Create → OAuth 2.0 Client ID → Web Application
- Authorized redirect URIs أضف:
  http://localhost:3000/api/auth/callback/google
- OAuth Consent Screen → External → أضف بريدك Test User
- انسخ Client ID و Secret في .env.local

### ب) Supabase (قاعدة البيانات)
- اذهب: https://supabase.com
- New Project → اختر اسم + كلمة سر
- Settings → Database → Connection String → انسخه
- ضعه في DATABASE_URL (استبدل [YOUR-PASSWORD] بكلمة السر)

### ج) Lemon Squeezy (الدفع)
- اذهب: https://app.lemonsqueezy.com
- Products → Add Product → Subshed Pro
- Add Variant → $4.99 Monthly Recurring
- Settings → API Keys → انسخ
- ضع كل القيم في .env.local

---

## الخطوة 2 — شغّل التطبيق

### Windows:
انقر مرتين على: 1-SETUP.bat (مرة واحدة فقط)
ثم انقر مرتين على: 2-START.bat

### Mac/Linux:
```bash
./1-setup.sh
./2-start.sh
```

### يدوياً (Terminal):
```bash
npm install
npx prisma db push
npm run dev
```

افتح: http://localhost:3000

---

## مشاكل شائعة وحلولها

| المشكلة | الحل |
|---------|------|
| Cannot find module | شغّل npm install مجدداً |
| Prisma error | شغّل npx prisma generate |
| OAuthCallback error | تأكد Redirect URI في Google Console |
| Database error | تأكد DATABASE_URL صحيح |
| Port 3000 in use | أغلق أي تطبيق آخر على port 3000 |

---

## نشر التطبيق على الإنترنت

1. أنشئ حساب: github.com
2. ارفع المشروع:
```bash
git init
git add .
git commit -m "Subshed v1"
```
3. أنشئ Repo على GitHub وارفع
4. اذهب: vercel.com → Import GitHub project
5. أضف كل متغيرات .env.local في Vercel
6. غيّر NEXTAUTH_URL لرابط Vercel
7. Deploy!
