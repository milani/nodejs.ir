Title: کاربرد koa برای نوشتن وب سرور ها با آزانگر (Generator) در جاوا اسکریپت - بخش چهار
Author: بهرنگ نوروزی نیا
Date: 2014-08-04 15:00:00 GMT+0430 (IRDT)
Categories: javascript,generator,generators,nodejs,ecmascript,ecmascript6,es6,harmony,koa,express

پیش از خواندن این نوشته، [بخش یکم](/blog/javascript-generators-part1)، [بخش دوم](/blog/javascript-generators-part2) و [بخش سوم](/blog/javascript-generators-co-thunkify-part3) آن را بخوانید.

در بخش پیش با [co](https://github.com/visionmedia/co) و [thunkify](https://github.com/visionmedia/node-thunkify) آشنا شدیم و دیدیم که چگونه با به کار گیری آزانگر در کنترل روند به ما کمک می کنند. در این جا با ابزاری به نام [koa](https://github.com/koajs/koa) آشنا می شویم که برای نوشتن وب سرور ها با به کار گیری آزانگر ها به کار می رود و می تواند جایگزینی برای ابزار پر کاربرد [express](https://github.com/strongloop/express) باشد.

## یک برنامه ی نمونه با `express`

بیایید نخست یک برنامه ی نمونه که با `express` نوشته شده را ببینیم و سپس بکوشیم آن را با `koa` بنویسیم. برنامه ی نمونه ی ما خیلی ساده است. کاری که می کند این است که اگر به ریشه (`/`) برویم، فهرستی از پرونده های `markdown` که در پوشه ی `md/` هستند را نشان می دهد و اگر روی هر کدام از آن ها کلیک کنیم، آن پرونده ی `markdown` را به `html` تبدیل کرده و نمایش می دهد. کد آن را در زیر ببینید.

<!--more-->

    var fs = require('fs')
      , marked = require('marked')
      , express = require('express')
      , app = express()
      , port = 3000

    app.get('/', list)
    app.get('/:filename', show)

    app.listen(port, function () {
      console.log('listening on port %s', port)
    })

    function list(req, res, next) {
      fs.readdir('md/', function (err, files) {
        if (err) return next(err)
        res.send(renderList(files))
      })
    }

    function show(req, res, next) {
      var filename = req.params.filename
      fs.readFile('md/' + filename, 'utf-8', function (err, content) {
        if (err) return next(err)
        res.send(marked(content))
      })
    }

    function renderList(filenames) {
      var links = filenames.map(function (filename) {
                    return '* [' + filename + '](' + filename + ')'
                  })
      return marked('#Markdown files\n' + links.join('\n'))
    }

برنامه ی بسیار ساده ای است. `app` یک برنامه ی `express` است که به درگاه `3000` گوش می کند. اگر به `/` برویم، تابع `list` فراخوانی می شود که فهرست پرونده های پوشه ی `md` را به دست می آورد و سپس نتیجه ی `renderList` را نشان می دهد. `renderList` فهرست پرونده ها را تبدیل به یک پرونده ی `markdown` می کند که پیوند هایی به هر پرونده دارد و سپس آن را تبدیل به `html` می کند.

اگر به `/:filename` برویم (که `filename` در اینجا نام هر پرونده ی پوشه ی `md` خواهد بود)، تابع `show` فراخوانی می شود که پرونده را خوانده و آن را تبدیل به `html` می کند و نمایش می دهد.

## `koa` چیست؟
سازنده ی `express` همان `TJ Holowaychuk` است که پس از نوشتن `co` و `thunkify` برای به کار گیری آزانگر ها در نوشتن وب سرور ها، [koa](https://github.com/koajs/koa) را ساخت. `koa` به سادگی `express` است ولی با داشتن خوبی های آزانگر ها.

## برنامه ی نمونه با `koa`

اکنون همان برنامه را با `koa` می نویسیم. فراموش نکنید که برای اجرای آن به نسخه ی `v0.11.x` از `node` نیاز دارید و باید `--harmony` را به آن بفرستید. کد زیر را ببینید.

    var fs = require('fs')
      , marked = require('marked')
      , koa = require('koa')
      , app = koa()
      , port = 3000
      , route = require('koa-route')
      , thunkify = require('thunkify')
      , readDir = thunkify(fs.readdir)
      , readFile = thunkify(fs.readFile)

    app.use(route.get('/', list))
    app.use(route.get('/:filename', show))

    app.listen(port, function () {
      console.log('listening on port %s', port)
    })

    function* list() {
      var files = yield readDir('md/')
      this.body = renderList(files)
    }

    function* show(filename) {
      var content = yield readFile('md/' + filename, 'utf-8')
      this.body = marked(content)
    }

    function renderList(filenames) {
      var links = filenames.map(function (filename) {
                    return '* [' + filename + '](' + filename + ')'
                  })
      return marked('#Markdown files\n' + links.join('\n'))
    }

به جای `express` در اینجا `koa` را آورده ایم. [koa-route](https://github.com/koajs/route) کاری همانند `route` ها در `express` می کند که در `koa` نیست و باید آن را جداگانه بیاوریم. `marked` و `thunkify` و `readDir` و `readFile` هم در بخش پیش گفته شدند.

‍تابع `renderList` همانند پیش است. `route` ها اندکی تغییر کرده اند ولی مشخص است که چه می کنند. بیشترین تغییر را `list` و `show` دارند. این دو دیگر تابع نیستند، تابع آزانگر هستند.

`list` یک تابع آزانگر است که نخست فهرست پرونده های پوشه ی `md` را به دست می آورد. سپس آن ها را به `renderList` می دهد و نتیجه را در `this.body` می گذارد. در `koa` دیگر از پارامتر های `req` و `res` و `next` خبری نیست. برای دسترسی به `request` و `response` باید با `context` کار کنید که برای دسترسی به آن `this` را به کار می برید. در اینجا برای نوشتن نتیجه تنها باید آن را در `this.body` بگذاریم. با این کار `koa` نتیجه را به درخواست کننده باز می گرداند.

`show` هم یک تابع آزانگر شده که یک پارامتر به نام `filename` می گیرد. `koa-route` این پارامتر را از نشانی درخواست گرفته و به `show` می فرستد. هر بار که اجرا شود، پرونده را می خواند و آن را تبدیل به `html` می کند و سپس نتیجه را در `this.body` می گذارد که `koa` آن را به درخواست کننده باز می گرداند.

## چه به دست آوردیم؟

نمونه کدی که با `koa` نوشته شده دو ویژگی خیلی مهم در برابر `express` دارد. ویژگی نخست گرفتن خطا ها است. همان گونه که در بخش های پیش گفته شد، گرفتن خطا در اینجا خیلی ساده است و با `try/catch` به سادگی می توان خطا را کنترل کرد.

ویژگی دوم هم این است که کد خیلی خوانا تر شده. `list` یا `show` را که کار اصلی برنامه را انجام می دهند در هر دو نمونه کد با هم مقایسه کنید. در نمونه کد دوم روند برنامه مشخص است و با یک نگاه خوانده می شود. ولی در نمونه کد یک خیلی پیچیده تر است. توجه کنید که این یک نمونه کد خیلی ساده است و در برنامه های کاربردی، کد ها خیلی تو در تو تر از این هستند، که خوانایی برنامه را کمتر و کمتر می کند.

## دیدگاه شما چیست؟

آیا آزانگر ها و `koa` پیچیده هستند؟ آیا `callback` ها و `express` ناخوانا تر هستند؟
