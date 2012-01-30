Title: ساخت یک برنامه Realtime با NowJS
Author: مرتضی میلانی
Date: Jan 30 2012 19:00:00 GMT+0330 (IRDT)
Categories: nowjs, socket.io, realtime

NowJS یک ماژول Nodejs است که برای ساخت برنامه های بلادرنگ یا Realtime استفاده می‌شود. نحوه کار این ماژول در سه مرحله زیر خلاصه می ‌شود:

* این ماژول یک namespace به نام `now` ایجاد می کند که هم در سمت client و هم در سمت server در دسترس است.
* توابع و متغیرهایی که به این namespace اضافه می‌شوند بین سرور و کلاینت sync می‌شوند.
* در این حالت سرور می‌تواند توابع تعریف شده در سمت کلاینت را صدا بزند و همچنین کلاینت می‌تواند توابع مربوط به سرور را اجرا کند.

به عنوان مثال دو اسکریپت زیر را در نظر بگیرید. اسکریپت اول در سمت سرور:

    // On server
    
    var nowjs      = require('now');
    var httpServer = require('http').createServer();
    var everyone   = nowjs.initialize(httpServer);
    
    var serverInfo = {
      db: 'mongodb',
      version: '0.2.2'
    }

    everyone.now.getServerInfo = function(callback) {
      callback(serverInfo);
    }
    
    httpServer.listen(3000);
    
و دیگری در سمت کلاینت:

    // On client
    
    <script>
      now.getServerInfo(function(data){
        console.log(data.version);
      });
    </script>

با اجرای این برنامه، مرورگر ورژن 0.2.2 را بر روی console چاپ می کند!

## ایده برنامه Awesome

می خواهیم برنامه ای بنویسیم که کاربران آن بتوانند لینک های جالب را با دیگران به اشتراک بگذارند. با استفاده از NowJS این امکان وجود دارد که برنامه، اشتراک هر لینک را به صورت Realtime به همه کاربران اطلاع دهد.

کد این برنامه در مخزن گیتهاب به آدرس https://github.com/milani/awesome قرار داده شده است.

مخزن را clone کنید و با دستور `npm install -d‍` ماژول‌های مورد نیاز را نصب کنید. سپس با اجرای دستور `node awesome.js‍‍` برنامه بر روی پورت 9002 آماده به کار است. با باز کردن برنامه در چند مرورگر می‌توانید کارکرد Realtime آن را مشاهده کنید.

## پایگاه داده

در این برنامه از پایگاه داده mongodb و ماژول mongoose برای ذخیره لینک‌های اشتراکی استفاده شده است. در مطلب [یک لاگ سرور ساده با استفاده از mongodb](http://nodejs.ir/blog/simple-log-server-with-mongodb-and-express) آقای مهربانی به خوبی نحوه کار با پایگاه داده mongodb از طریق این ماژول را شرح داده اند.

در پوشه lib، در فایل db.js یک Schema به نام item با مشخصات زیر برای ذخیره کردن لینک‌ها تعریف شده است:

* msg: توضیحی است که کاربر هنگام اشتراک مطلب می نویسد.
* link: لینک یا URL ای است که کاربر می خواهد به اشتراک گذارد.
* title: عنوان صفحه ای است که url به آن اشاره دارد. این فیلد توسط برنامه تکمیل می‌شود.
* desc: چنانچه صفحه share شده دارای description meta tag باشد، توضیحات داخل این تگ در این فیلد قرار می گیرد.
* date: تاریخ اشتراک گذاری.

توابع تعریف شده در این فایل واضح هستند. تنها یک توضیح کوچک مربوط به خط زیر ضروری است:

    Item.find().skip(start).limit(limit).sort('date',1).run(cb);

اگر start برابر ۱۰ و limit برابر ۲۰ باشد، این تابع مجموعه‌ای ۲۰ تایی از لینک های share شده با شروع از لینک دهم را برمی‌گرداند.

## فایل های استاتیک

در برنامه Awesome از ماژول Express برای سرور کردن فایل های استاتیک مربوط به تم برنامه مثل CSS ،HTML ،jQuery و ... استفاده شده است. این فایل ها در پوشه Public قرار گرفته اند. البته ماژول های ساده‌تری هم برای اینکار وجود دارد اما استفاده از Express به ما امکان می‌دهد تا در آینده به سهولت بیشتری برنامه را گسترش دهیم (مثلاً خواهیم توانست از ماژول های Express استفاده کنیم و برای برنامه Authentication بگذاریم).

در فایل awesome.js پس از ایجاد یک سرور، مسیر فایل‌های استاتیک را مشخص می کنیم:

    var server = express.createServer();

    server.use(server.router);
    server.use(express.static(__dirname + '/public'));

    server.listen(9002,function() {
      console.log('Listening on 9002');
    });

حال کاربر می تواند صفحه اصلی برنامه ( index.html )‌ را در مرورگر مشاهده کند.


## بکارگیری NowJS

همانطور که در مثال ابتدای این مطلب مشاهده کردید، برای شروع کار با NowJS ابتدا باید یک instance از httpServer را توسط تابع nowjs.initialize به این ماژول بدهیم تا بتواند router مربوط به لود کردن فایل now.js سمت کلاینت را ایجاد کند و توابع مربوط به socket.io را مقدار دهی اولیه کند.

یک نکته مهم این است که socket.io به طور پیش فرض از پروتکل websocket برای برقراری ارتباط realtime استفاده می کند. معمولاٌ پورت مورد استفاده websocket توسط firewall ها block می‌شود. بنابراین بهتر است پروتکل پیش فرض socket.io را به xhr-polling تغییر دهیم. به همین منظور می توانیم از این دستور استفاده کنیم:

    var everyone = nowjs.initialize(server,{socketio: {transports: ['xhr-polling','jsonp-polling','websocket']}});


در این برنامه بطور کلی سه اتفاق ممکن است رخ دهد: کاربر لینکی را به اشتراک گذارد، لینکی توسط کاربر حذف شود و یا برنامه بخواهد لینک‌های اشتراکی را load نماید. متناسب با این سه کارکرد، باید سه تابع تعریف کنیم که از سمت کلاینت قابل فراخوانی باشند.

همانطور که از نام everyone پیداست، هر متدی و یا متغیری که به این شیء نسبت دهیم توسط تمام کلاینت ها قابل دستیابی است. در فایل awesome.js این متدها تعریف شده اند. در اینجا می‌خواهیم در مورد متد share بیشتر توضیح دهیم:


    everyone.now.share = function(data,cb){

      var self = this;
      
      if(!isUrl(data.link)){
        return cb("Provided Link is not valid.");
      }

      request(data.link, function(err,resp,body){

        if( err || resp.statusCode != 200 ){
          return cb(err);
        }

        var title = body.match(/<title>([^<]*)<\/title>/);
        var desc = body.match(/<meta name="description" content="([^"]*)">/);
        
        if(title){
          data.title = title[1];
        }else{
          data.title = resp.request.host;
        }

        if(desc){
          data.desc = desc[1];
        }else{
          data.desc = '';
        }

        db.create(data,function(err,item){

          cb(err);

          if(!err){
            everyone.now.onItem([item]);
          }

        });

      });

    }

در این متد از ماژول request استفاده شده است. در ساده ترین حالت، این ماژول به ما امکان می‌دهد که مانند یک browser، صفحات را لود کنیم. متد share لینکی که کاربر به برنامه ارسال کرده است را باز می کند و عنوان صفحه و توضیحات آن صفحه را استخراج کرده و سپس شیء‌ data را با این اطلاعات کامل می کند و برای ذخیره به پایگاه داده می فرستد. در صورتی که ذخیره اطلاعات موفقیت آمیز بود، با فراخوانی متد onItem که برای کلاینت ها تعریف شده است، آنها را در جریان لینک جدید قرار می‌دهد.

در سمت کلاینت (فایل public/js/main.js)، دو متد now.onItem و now.onRemove وظیفه sync کردن کاربران را بر عهده دارند. چنانچه لینکی حذف شود و یا لینکی اضافه شود، این توابع توسط سرور فراخوانی می‌شوند و عملیات مرتبط با حذف و اضافه انجام می‌شود.

در پایان امیدوارم این برنامه دید جدیدی از برنامه نویسی Realtime بدست دهد و بتوانید برنامه‌های بزرگ و تجاری خود را با این روش پیاده سازی کنید.

