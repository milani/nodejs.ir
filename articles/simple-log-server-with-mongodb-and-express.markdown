Title: یک لاگ سرور ساده با nodejs، express و mongodb
Author: افشین مهربانی
Date: December 5, 2011 8:06:09 PM GMT+03:30
Categories: fundamentals, javascript, mongodb, express, mongoose

در این مقاله کوچک قصد دارم یک نمونه کد و نحوه کار با چند ماژول بسیار پر کاربرد نود جی‌اس را آموزش بدهم.

این کد یک برنامه کوچک برای ثبت log (خطا، اخطار و اطلاع‌رسانی) است.

مزیت این log server در نوع ثبت و نگهداری اطلاعات logها می‌باشد که در آن از یک نوع بانک‌ اطلاعاتی غیر رابطه‌ای (Document oriented) استفاده شده است.
<!--more-->
آدرس دریافت کد:

<p dir="ltr">http://afshinm.github.com/nodejs-log-server/</p>

ماژول‌های مد نظر ما در این آموزش عبارتند از mongoose و express. شما به راحتی توسط این دو ماژول می‌توانید یک وبلاگ یا یک سایت کوچک راه‌اندازی کنید!

ابتدا من هر ماژول را توضیح می‌دهم و در انتها به بررسی اجمالی کد مورد نظر می‌پردازیم.

mongoose: یکی از بهترین کتابخانه‌های موجود برای ارتباط به بانک اطلاعات mongo از طریق نود می‌باشد. mongo یک بانک اطلاعاتی بر پایه سند و بدون ساختار است.

آدرس:

<p dir="ltr">http://blog.learnboost.com/blog/mongoose/</p>

express: یک وب فریم‌ورک خوب و راحت برای نود جی‌اس. توسط express شما می‌توانید صفحات داخلی سایت یا برنامه‌تان را ایجاد کنید و بصورت اختصاصی برای هر کدام route مخصوص به خودش را بنویسید (برای مثال صفحه لیست مطالب وبلاگ شما می‌شود `/list` و صفحه جزئیات هر کدام از مطالب بصورت `/blog/id/1` در خواهد آمد).

آدرس:

<p dir="ltr">http://expressjs.com/</p>

در ادامه به بررسی کد می‌پردازیم.

در ابتدای کد دو ماژول مورد نظر را در برنامه فراخوانی می‌کنیم:

    var app = require('express').createServer(),

    mongoose = require('mongoose'),

برای راحتی ایجاد یک schema، تابع constructor مربوط به آن را داخل متغیر schema ریخته‌ام:

    Schema = mongoose.Schema,

و سپس دو آرایه برای نگهداری مقادیر ثابت برنامه ایجاد کرده‌ام:

    priority = ['low', 'normal', 'high', 'critical'],
    logtype = ['information', 'warning' ,'error'];

آرایه اول اهمیت لاگ ثبت شده را نشان می‌دهد و آرایه دوم نوع لاگ.

اکنون زمان اتصال به بانک‌اطلاعات و ایجاد schema مربوطه است:

    mongoose.connect('mongodb://localhost/logs');

    logItem = new Schema({
        priority  : Number,
        logtype   : Number,
        datetime  : Date,
        msg       : String
    });

همان‌طور که می‌بینید به دیتابیس logs متصل شده‌ام و سپس schema مورد نظر خودم را ایجاد کرده‌ام.

schema ایجاد شده حاوی پنج فیلد است که اولین آن اهمیت لاگ، دومی نوع لاگ، سومین فیلد تاریخ درج لاگ و آخرین فیلد هم وظیفه نگهداری متن لاگ را دارد.

سپس در خط بعدی مدل خودم را به بانک اطلاعات معرفی کرده‌ام:

    mongoose.model('logItem', logItem);

نام مدل من logItem است.

در خط بعدی یک route برای ماژول express نوشته‌ام و به ماژول گفته‌ام که هر کس که وارد شاخه اصلی من شد کار‌هایی که من می‌خواهم را انجام بده:

    app.get('/', function(req, res){

تابعی که callback می‌شود حاوی دو parameter است که اولی آن متغیر حاوی اطلاعات request است و دومی متغیر مربوط به response

توسط این دو متغیر می‌توان کارهایی بر روی request یا response فرد انجام داد.

من توسط دستور زیر یک متن را بر روی مانیتور فرد بازدید کننده چاپ می‌کنم:

    res.send("Log saved on " + Date());

و سپس بر روی console برنامه:

    console.log("Log saved on " + Date());

console.log یک تابع ساده برای چاپ یک متن بر روی console برنامه است (چاپ بر روی stdout).

console.log یک پارامتر دریافت می‌کند که آن پارامتر، متن مورد نظر شما برای چاپ شدن بر روی صفحه است.

console.log کاری مشابه در JavaScript و Firebug  انجام می‌دهد، برای مثال وقتی شما از console.log در کد JavaScript بر روی client استفاده می‌کنید، می‌توانید متن چاپ شده را در console مربوط به Firebug مشاهده کنید.

هدف از اینکار مطلع شدن از روند کار و فعالیت برنامه است. فقط همین!

در خط بعدی یک متغیر ایجاد کرده‌ام و تمامی parameterهایی که به برنامه من ارسال شده است را دریافت می‌کنم:

    var reqQuery = req.query;

این متغیر در حقیقت یک object حاوی تمامی paramterهای ارسال شده به برنامه است (این نمونه را در نظر بگیرید: http://localhost/?boo=1&foo=2 )

در خط بعدی مدل خودم را از بانک‌اطلاعات دریافت کرده‌ام:

    var logItem = mongoose.model('logItem');

این کار را انجام می‌دهم تا بتوانم در بانک‌اطلاعات بنویسم، پاک کنم و آپدیت انجام دهم.

در دو خط بعدی توسط parameterهای ارسال شده، نوع و اهمیت لاگ را تشخیص می‌دهم:

    var pr = priority.indexOf(reqQuery["priority"]);
    var type = logtype.indexOf(reqQuery["type"]);

به این روش مطمئن هستیم که اطلاعات لاگ ثبت شده خارج از محدوده و حالت‌های مد نظر ما نیست.

و در نهایت در خط بعدی یک object جدید ایجاد کرده‌ام و تمامی متغیرهای مورد نظرم را به object داده‌ام:

    new logItem({
      datetime: Date(),
      priority: (pr >= 0 ? pr : 0), 
      logtype: (type >= 0 ? type : 0), 
      msg: reqQuery["msg"]
    }).save();

فراخوانی تابع save در آخر خط به معنی ذخیره object در بانک اطلاعات است.

پس از اتمام کد، بر روی پورت 3000 برنامه را اجرا کرده‌ام:


    app.listen(3000);

حال شما به راحتی می‌توانید بعد از اجرای برنامه با فراخوانی آدرس زیر یک لاگ در بانک اطلاعاتتان ثبت کنید:

<p dir="ltr">http://localhost:3000/?msg=logtext&priority=high&type=errortext&priority=high&type=error</p>
