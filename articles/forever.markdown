Title: معرفی forever
Author: مرتضی میلانی
Date: Jan 22 2012 11:00:00 GMT+0330 (IRDT)
Categories: forever, nohup, crash

فرض کنید برنامه ای با node نوشته‌اید و آن را به سرور خود منتقل کرده و از طریق ssh با دستور ` node myscript.js` آن را اجرا کرده‌اید. بعد از چند دقیقه برنامه شما از کار می‌افتد در صورتی که مطمئن هستید خطایی در آن نیست. این مشکل اول!

وقتی که به زبان PHP یا Ruby یا زبان‌هایی از این دست برنامه‌ای می نویسیم، برای اجرای آن از وب سرورهایی نظیر apache یا nginx استفاده می کنیم: با هر درخواست، وب سرور اسکریپت برنامه را اجرا می کند و پاسخ را به کاربر می فرستد. اما در node برنامه ها مستقل عمل می کنند. به عنوان مثال وقتی در node از ماژول http استفاده می کنیم هیچ نیازی به وب سرور نداریم. حال فرض کنید برنامه در حال پاسخ به یک درخواست به خطای شکار نشده ( یعنی همون catch نشده :دی ) برخورد کند.

در حالتی که از وب سرورها برای اجرای اسکریپتها استفاده می‌شود ( مثل PHP ) تنها کاربری که با خطا مواجه می‌شود آن کسی است که درخواست را ارسال نموده و دیگر کاربران چون به این حالت خطا نرسیده اند بدون مشکل با برنامه در تعامل خواهند بود. اما در حالتی که از node استفاده کنیم بروز یک خطای catch نشده کل process را از کار می اندازد و به عبارتی برنامه crash می کند. بنابراین تا زمانی که برنامه دوباره راه اندازی نشود کسی قادر به استفاده از آن نیست. این هم مشکل دوم!
<!--more-->

# اجرا در background

برای رفع مشکل اول باید برنامه را در background به صورت daemon اجرا کرد تا منقضی شدن session باعث terminate شدن برنامه نشود. یک راه حل استفاده از `nohup` است:

    $ nohup node myscript.js > output.log &
    1 46234
    
این دستور برنامه ما را در background اجرا می کند و خروجی های برنامه را در فایل output.log ذخیره می کند. این راه حل برای رفع مشکل اول به تنهایی مناسب است. اما برای رفع مشکل دوم نارساست : در صورتی که برنامه crash کند nohup قادر به اجرای دوباره آن نیست.

# رفع هر دو مشکل با Forever

Forever برنامه ای است که به ما امکان می‌دهد دیگر اسکریپت های خود را بدون نگرانی از دو مشکل بالا اجرا کنیم. به منظور انجام اینکار Forever برای اجرای هر اسکریپت یک child process ایجاد می کند و وضعیت آن را کنترل می نماید تا از بروز مشکلات بالا جلوگیری کند.

برای نصب Forever از npm استفاده می کنیم:

    $ npm install forever
    
حال اسکریپت خود را به این صورت اجرا می کنیم:

    $ forever start myscript.js
      info:   Forever processing file: myscript.js

با دستور list، تمام اسکریپت‌هایی که در حال اجرا هستند لیست می‌شوند:

    $ forever list
      info:   Forever processes running
      data:       uid  command script      forever pid  logfile                         uptime
      data:   [0] dUFa node    myscript.js 5539    5540 ~/.forever/dUFa.log 0:0:0:35.141 

دستورات دیگری نظیر stop، restart و ... هم وجود دارند. لیست کامل دستورات با استفاده از `forever --help` قابل مشاهده است.

استفاده از forever در برنامه هم امکان پذیر است:

    var forever = require('forever');

    var child = new (forever.Monitor)('your-filename.js', {
      max: 3,         // Sets the maximum number of times a given script should run
      silent: true,   // Silences the output from stdout and stderr in the parent process
      options: []     // Additional arguments to pass to the script
    });

    child.on('exit', yourcallback);
    child.start();
    
برای مطالعه بیشتر در رابطه با forever می توانید به مخزن آن به آدرس https://github.com/nodejitsu/forever مراجعه کنید.
