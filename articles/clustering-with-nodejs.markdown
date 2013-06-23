Title: استفاده از تمام ظرفیت CPU با Clustering

Author: حمیدرضا سلیمانی

Date: Fri 21 Jun 2013 12:37:17 PM (IRST)
 
Categories: clustering, cpu, single-thread, forever, monit, upstart

معماری Nodejs به صورت Single-Threaded است، یعنی تک-رشته ای. اگر بخواهیم این رشته یا همان [Thread](http://simple.wikipedia.org/wiki/Thread_(computer_science)) را مختصرا تعریف کنیم، میتوان گفت Thread به بخشی از یک Process گفته میشود که به منابع آن Process دسترسی دارد. ضمنا هر Process میتواند Thread های مختلفی داشته باشد. اما همانطور که گفتیم ما در Nodejs تنها یک Thread داریم که مسئول اجرای برنامه نوشته شده با Nodejs می‌باشد. این تک-رشته‌ای بودن در Nodejs محاسن بسیاری دارد که در این مقاله به آنها نمیپردازیم و به جای آن تلاش میکنیم به این سوال مهم پاسخ دهیم که: اگر CPU سرور ما چندین هسته داشته باشد، تک-رشته ای بودن Nodejs باعث میشود تنها از یک هسته ی آن استفاده شود! پس راه حل چیست؟

<!--more-->

# راه حل استفاده از ماژول cluster است

بهتر است بگوییم یکی از بهترین راه حل های موجود استفاده از ماژول [cluster](http://nodejs.org/api/cluster.html) است. cluster به معنی خوشه است و با آن شما میتوانید برنامه نوشته شده ی خود را به یک Master Process و چندین Worker Process به صورت خوشه ای تقسیم کنید و سپس اجرا کنید تا از تمام ظرفیت CPU استفاده شود. و البته یکی دیگر از فواید استفاده از clustering پایین آمدن احتمال downtime سرور شما است که در ادامه مقاله به آنها میپردازیم.

# تفاوت Worker Process و Master Process


برای بیان تفاوت این دو بیاید تا به سراغ کدها برویم:

	// Declare variables
	var cluster = require('cluster');
	var http = require('http');
	var numCPUs = require('os').cpus().length;

	if (cluster.isMaster) {
	
		// Fork workers
		for (var i = 0; i < numCPUs; i++) {
			cluster.fork();
		}
	
	} else {
	
		// Run server for each worker
		http.createServer(function(req, res) {
			res.writeHead(200);
			res.end("Hello World\n");
		}).listen(8000);
		
	}
در خط دوم و سوم ماژول های cluster و http را وارد اسکریپتمان میکنیم تا از آنها استفاده کنیم. در خط چهارم با استفاده از ماژول os که توانایی ارتباط به اطلاعات سیستم عامل سرور را دارد تعداد هسته های CPU سرور را به دست می آوریم. چرا؟ چون با استفاده از آن میتوانیم بفهمیم برای داشتن بهترین کارایی سرور چند Worker Process باید ایجاد کنیم. در خط ششم به قسمت جالب اسکریپت میرسیم. در این خط اسکریپت میپرسد که «آیا در حال حاضر این Process ای که مسئول اجرای من است Master Process است؟» و خب از انجایی که هنوز هیچ Worker Process ای اجرا نشده، جواب مثبت است. پس داخل بلوک شرط میشویم. داخل این بلوک با استفاده از دستور For به تعداد هسته های CPU سرور ما Worker Process ایجاد میکنیم. به این عمل اصطلاحا Fork کردن یک Process میگوییم. یعنی یک کپی از Process حاضر گرفته میشود و به فرزندی آن Process پذیرفته می شود. با فرض اینکه CPU سرور ما ۴ هسته‌ای باشد، در این حلقه‌ی For بایست به تعداد چهار Child Process ایجاد یا همان Fork شود. ضمنا به این Child Processهای جدید در اینجا Worker Process نیز میگوییم زیرا Master Process ما آنها را استخدام کرده تا مثل کارگرها برایش کار کنند.
پس از اینکه تک تک این Worker Processها Fork شدند، آنها نیز حق حیات دارند پس شروع میکنند از خط اول اسکریپت را تفسیر کنند. اما اینبار فرق بزرگی وجود دارد، این Worker Process ها وقتی به خط شش میرسند در جواب سوال «آیا در حال حاظر این Processای که مسئول اجرای من است Master Process است؟» میگویند خیر! و به بلوک Else میروند تا سرور را اجرا کنند.
حالا اگر به کنسول لینوکس بروید و دستور زیر را بزنید میبیند که یک Master Process دارید و چهار Worker Process که بچه‌ي آن هستند:
	
	ps -faux | grep node
	
# پایین آوردن زمان Downtime سرور با Clustering

به خاطر Event-Driven بودن Nodejs ما در هر لحظه میتوانیم از اتفاقاتی که برای شی cluster می‌افتد با خبر شویم. اتفاقاتی مانند:

	cluster.on('fork', forkCallback);
	cluster.on('online', onlineCallback);
	cluster.on('listening', listenCallback);
	cluster.on('exit', exitCallback);

از بین این Event ها exit بسیار مفید است. با استفاده از آن میتوانید به Nodejs دستور دهید که به محض اینکه یک Worker Process از بین رفت، یک Worker Process جدید درست کن. و با این کار همیشه Master Process ما در حال نظارت کارگرهایی هست که استخدام کرده و به محض اینکه یکی از آنها مرد، یکی جدید را به جای او استخدام میکند تا غم مرگ او با استخدام یک کارگر جدید از بین برود! حالا بیاید اسکریپت خود را کامل کنیم:

	if (cluster.isMaster) {
		
		// Fork workers
		for (var i = 0; i < numCPUs; i++) {
			cluster.fork();
		}
			
		// Exiting event of workers
		cluster.on('exit', function(worker, code, signal) {
			// Now fork a new worker
			cluster.fork();
		});
		
	} else {
		
		// Run server for each worker
		http.createServer(function(req, res) {
			res.writeHead(200);
			res.end("Hello World\n");
		}).listen(8000);
		
	}
البته شاید بپرسید بعد از مرگ Master Process چه کار کنیم؟ جای نگرانی نیست، شما میتوانیم با استفاده از ماژول [Forever](https://github.com/nodejitsu/forever) که آقای میلانی در یکی از مقالات همین وبلاگ توضیح دادند Master Process خود را جاودان کنید. البته گزینه های دیگری نیز برای این کار وجود دارند مانند [Monit](http://mmonit.com/) یا [Upstart](http://upstart.ubuntu.com/) که نه تنها برای Nodejs بلکه برای برنامه های نوشته شده به زبان های دیگر نیز کارایی دارند.
