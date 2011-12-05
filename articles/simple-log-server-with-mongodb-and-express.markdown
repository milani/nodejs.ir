Title: یک لاگ سرور ساده با nodejs، express و mongodb
Author: افشین مهربانی
Date: December 5, 2011 8:06:09 PM GMT+03:30
Categories: fundamentals, javascript, mongodb, express, mongoose

<div style="font-family: tahoma; font-size: 12px; direction: rtl;">
<p align="right">در این مقاله کوچک قصد دارم یک نمونه کد و نحوه کار با چند ماژول بسیار پر کاربرد نود جی‌اس را آموزش بدهم.</p>
<p align="right">این کد یک برنامه کوچک برای ثبت log (خطا، اخطار و اطلاع‌رسانی) است.</p>
<p align="right">مزیت این log server در نوع ثبت و نگهداری اطلاعات logها می‌باشد که در آن از یک نوع بانک‌اطلاعاتی غیر رابطه‌ای (Document oriented) استفاده شده است.</p>
<p align="right">آدرس دریافت کد:</p>
<a href="http://afshinm.github.com/nodejs-log-server/">http://afshinm.github.com/nodejs-log-server/</a>
<p align="right">ماژول‌های مد نظر ما در این آموزش عبارتند از mongoose و express</p>
<p align="right">شما به راحتی توسط این دو ماژول می‌توانید یک وبلاگ یا یک سایت کوچک راه‌اندازی کنید!</p>
<p align="right">ابتدا من هر ماژول را توضیح می‌دهم و در انتها به بررسی اجمالی کد مورد نظر می‌پردازیم.</p>
<p align="right">mongoose: یکی از بهترین کتابخانه‌های موجود برای ارتباط به بانک اطلاعات mongo از طریق نود می‌باشد. mongo یک بانک اطلاعاتی بر پایه سند و بدون ساختار است.</p>
<p align="right">آدرس:</p>
<a href="http://blog.learnboost.com/blog/mongoose/">http://blog.learnboost.com/blog/mongoose/</a>
<p align="right">express: یک وب فریم‌ورک خوب و راحت برای نود جی‌اس. توسط express شما می‌توانید صفحات داخلی سایت یا برنامه‌تان را ایجاد کنید و بصورت اختصاصی برای هر کدام route مخصوص به خودش را بنویسید (برای مثال صفحه لیست مطالب وبلاگ شما می‌شود /list و صفحه جزئیات هر کدام از مطالب بصورت /blog/id/1 در خواهد آمد)</p>
<p align="right">آدرس:</p>
<a href="http://expressjs.com/">http://expressjs.com/</a>
<p align="right">در ادامه به بررسی کد می‌پردازیم.</p>
<p align="right">در ابتدای کد دو ماژول مورد نظر را در برنامه فراخوانی می‌کنیم:</p>

<pre style="direction: ltr;">var app = require('express').createServer(),

mongoose = require('mongoose'),</pre>
<p align="right">برای راحتی ایجاد یک schema، تابع constructor مربوط به آن را داخل متغیر schema ریخته‌ام:</p>

<pre style="direction: ltr;">Schema = mongoose.Schema,</pre>
<p align="right">و سپس دو آرایه برای نگهداری مقادیر ثابت برنامه ایجاد کرده‌ام:</p>

<pre style="direction: ltr;">priority = ['low', 'normal', 'high', 'critical'],
logtype = ['information', 'warning' ,'error'];</pre>
<p align="right">آرایه اول اهمیت لاگ ثبت شده را نشان می‌دهد و آرایه دوم نوع لاگ.</p>
<p align="right">اکنون زمان اتصال به بانک‌اطلاعات و ایجاد schema مربوطه است:</p>

<pre style="direction: ltr;">mongoose.connect('mongodb://localhost/logs');

logItem = new Schema({
priority  : Number,
logtype   : Number,
datetime  : Date,
msg       : String
});</pre>
<p align="right">همان‌طور که می‌بینید به دیتابیس logs متصل شده‌ام و سپس schema مورد نظر خودم را ایجاد کرده‌ام.</p>
<p align="right">schema ایجاد شده حاوی پنج فیلد است که اولین آن اهمیت لاگ، دومی نوع لاگ، سومین فیلد تاریخ درج لاگ و آخرین فیلد هم وظیفه نگهداری متن لاگ را دارد.</p>
<p align="right">سپس در خط بعدی مدل خودم را به بانک اطلاعات معرفی کرده‌ام:</p>

<pre style="direction: ltr;">mongoose.model('logItem', logItem);</pre>
<p align="right">نام مدل من logItem است.</p>
<p align="right">در خط بعدی یک route برای ماژول express نوشته‌ام و به ماژول گفته‌ام که هر کس که وارد شاخه اصلی من شد کار‌هایی که من می‌خواهم را انجام بده:</p>

<pre style="direction: ltr;">app.get('/', function(req, res){</pre>
<p align="right">تابعی که callback می‌شود حاوی دو parameter است که اولی آن متغیر حاوی اطلاعات request است و دومی متغیر مربوط به response</p>
<p align="right">توسط این دو متغیر می‌توان کارهایی بر روی request یا response فرد انجام داد.</p>
<p align="right">من توسط دستور زیر یک متن را بر روی مانیتور فرد بازدید کننده چاپ می‌کنم:</p>

<pre style="direction: ltr;">res.send("Log saved on " + Date());</pre>
<p align="right">و سپس بر روی console برنامه:</p>

<pre style="direction: ltr;">console.log("Log saved on " + Date());</pre>
<p align="right">console.log یک تابع ساده برای چاپ یک متن بر روی console برنامه است (چاپ بر روی stdout)</p>
<p align="right">console.log یک پارامتر دریافت می‌کند که آن پارامتر، متن مورد نظر شما برای چاپ شدن بر روی صفحه است.</p>
<p align="right">console.log کاری مشابه در JavaScript و Firebug  انجام می‌دهد، برای مثال وقتی شما از console.log در کد JavaScript بر روی client استفاده می‌کنید، می‌توانید متن چاپ شده را در console مربوط به Firebug مشاهده کنید.</p>
<p align="right">هدف از اینکار مطلع شدن از روند کار و فعالیت برنامه است. فقط همین!</p>
<p align="right">در خط بعدی یک متغیر ایجاد کرده‌ام و تمامی parameterهایی که به برنامه من ارسال شده است را دریافت می‌کنم:</p>

<pre style="direction: ltr;">var reqQuery = req.query;</pre>
<p align="right">این متغیر در حقیقت یک object حاوی تمامی paramterهای ارسال شده به برنامه است (این نمونه را در نظر بگیرید: <a href="http://localhost/?boo=1&amp;foo=2">http://localhost/?boo=1&amp;foo=2</a>)</p>
<p align="right">در خط بعدی مدل خودم را از بانک‌اطلاعات دریافت کرده‌ام:</p>

<pre style="direction: ltr;">var logItem = mongoose.model('logItem');</pre>
<p align="right">این کار را انجام می‌دهم تا بتوانم در بانک‌اطلاعات بنویسم، پاک کنم و آپدیت انجام دهم.</p>
<p align="right">در دو خط بعدی توسط parameterهای ارسال شده، نوع و اهمیت لاگ را تشخیص می‌دهم:</p>

<pre style="direction: ltr;">var pr = priority.indexOf(reqQuery["priority"])
var type = logtype.indexOf(reqQuery["type"]);</pre>
<p align="right">به این روش مطمئن هستیم که اطلاعات لاگ ثبت شده خارج از محدوده و حالت‌های مد نظر ما نیست.</p>
<p align="right">و در نهایت در خط بعدی یک object جدید ایجاد کرده‌ام و تمامی متغیرهای مورد نظرم را به object داده‌ام:</p>

<pre style="direction: ltr;">new logItem({datetime: Date(), priority: (pr &gt;= 0 ? pr : 0), logtype: (type &gt;= 0 ? type : 0), msg: reqQuery["msg"]}).save();</pre>
<p align="right">فراخوانی تابع save در آخر خط به معنی ذخیره object در بانک اطلاعات است.</p>
<p align="right">پس از اتمام کد، بر روی پورت 3000 برنامه را اجرا کرده‌ام:</p>

<pre style="direction: ltr;">});

app.listen(3000);</pre>
<p align="right">حال شما به راحتی می‌توانید بعد از اجرای برنامه با فراخوانی آدرس زیر یک لاگ در بانک اطلاعاتتان ثبت کنید:</p>
<a href="http://localhost:3000/?msg=log%C2%A0text&amp;priority=high&amp;type=error">http://localhost:3000/?msg=log text&amp;priority=high&amp;type=error text&amp;priority=high&amp;type=error
</a>

</div>