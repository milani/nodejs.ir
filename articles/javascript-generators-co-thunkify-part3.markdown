Title: کاربردِ co و thunkify برای کنترلِ روند با آزانگر (Generator) در جاوا اسکریپت - بخشِ سه
Author: بهرنگ نوروزی نیا
Date: 2014-07-02 12:35:00 GMT+0430 (IRDT)
Categories: javascript,generator,generators,nodejs,ecmascript,ecmascript6,es6,harmony,co,thunk,thunkify

پیش از خواندنِ این نوشته، [بخشِ یکم](/blog/javascript-generators-part1) و [بخشِ دومِ](/blog/javascript-generators-part2) آن را بخوانید.

در بخشِ پیش دیدیم که چگونه می توانیم اجرای تابعِ آزانگر را کنترل کنیم. تابعی به نامِ `run` نوشتیم که می توانست تابع های آزانگر را اجرا کند. می توانستیم آن را توسعه دهیم ولی چندین کتابخانه ی دیگر از پیش نوشته شده اند که کاری همانندِ آن انجام می دهند. یکی از آن ها [کتابخانه ای به نامِ co](https://github.com/visionmedia/co) است که در اینجا با آن و یک کتابخانه ی دیگر به نامِ [thunkify](https://github.com/visionmedia/node-thunkify) آشنا می شویم.

## کنترلِ روندِ موازی

در بخشِ پیش یک نمونه کدِ ساده را دیدیم. در برنامه هایی که روزانه می نویسیم، برای افزایشِ کارایی، می کوشیم تا کار ها را همزمان با هم و موازی انجام دهیم. بیایید نمونه کدِ بخشِ پیش را کمی پیشرفته تر کنیم. می خواهیم تابعِ `readFiles` داشته باشیم که به جای دو مسیرِ پرونده، یک آرایه از آن ها را می گیرد. کدِ زیر را ببینید.

<!--more-->

    var fs = require('fs')

    function readFile(path, done) {
      fs.readFile(path, 'utf-8', done)
    }

    function readFiles(paths, done) {
      var count = paths.length
        , result = new Array(count)
        , doneCalled = false

      paths.map(function (path, i) {
        readFile(path, function (err, data) {
          if (doneCalled) return
          if (err) {
            doneCalled = true
            done(err)
            return
          }

          result[i] = data

          count -= 1
          if (count === 0)
            done(null, result)
        })
      })
    }

    readFiles(['md/file1.md', 'md/file2.md', 'md/file3.md'], function (err, res) {
      if (err) return console.error(err.message)
      res.map(function (data) {
        console.log(data)
      })
    })

همان گونه که می بینید، کار کمی پیچیده تر شده است. تابعِ `map` که روی آرایه ها تعریف شده، تابعی که به آن فرستاده می شود را روی همه ی داده های آرایه اجرا می کند. از آنجایی که پاسخِ خواندنِ پرونده ها به ترتیب نخواهد بود، برای هر پاسخ یکی از `count` کم می کنیم تا به صفر برسد. سپس اگر صفر شد، `done` را فرا می خوانیم. پاسخ های باز گشته را هم در آرایه ی `result` در سر جای خود گذاشته ایم.

کنترلِ خطا خیلی پیچیده تر شده است. اگر خطایی در زمانِ خواندنِ هر یک از پرونده ها پیش آید، دیگر نیازی به ادامه نیست و همان جا باید خطا را باز گردانیم. `doneCalled` برای این گذاشته شده که اگر پیش تر خطایی رخ داده و `done` فراخوانده شده، دیگر فراخوانده نشود. اگر این کار را نکنیم، `callback` شاید بیش از یک بار اجرا شود که درست نیست.

همین کارِ ساده، خیلی برنامه ی ساده ی ما را پیچیده کرده و دیگر به سادگی خوانده و فهمیده نمی شود.

## به کار گیریِ `co`

[co](https://github.com/visionmedia/co) یکی از کتابخانه های توانمندِ کنترلِ روندِ اجرا است که بدست [TJ Holowaychuk](https://github.com/visionmedia) نوشته شده است. این کتابخانه یک تابع به نامِ `co` دارد که کاری همانند `run` در بخشِ پیش انجام می دهد ولی بسیار پیشرفته تر شده است و کار های موازی را هم انجام می دهد. بهتر است نمونه کدِ بالا را با آن بنویسیم تا ببینیم که برای ما چه می کند.

    var fs = require('fs')
      , co = require('co')

    function readFile(path) {
      return function (done) {
        fs.readFile(path, 'utf-8', done)
      }
    }

    function readFiles(paths, done) {
      co(function* () {

        return yield paths.map(readFile)

      })(done)
    }

    readFiles(['md/file1.md', 'md/file2.md', 'md/file3.md'], function (err, res) {
      if (err) return console.error(err.message)
      res.map(function (data) {
        console.log(data)
      })
    })

کد بسیار ساده شده است. در اینجا `paths.map(readFile)` تابعِ `readFile` را روی تک تکِ اندیس های آرایه فرا می خواند که این تابع خود یک تابع دیگر باز می گرداند و `paths.map` همه ی آن ها را در یک آرایه ی دیگر می ریزد و باز می گرداند. پس با اجرای آن، به یک آرایه از تابع ها می رسیم که این تابع ها از `readFile` باز گشته اند.

سپس این آرایه به `yield` می رسد که آن هم این آرایه را می آزاند و `co` آن را می گیرد. `co` هر گاه که به یک آرایه یا یک `object` از تابع ها برسد، آن ها را موازی اجرا می کند و در پایانِ اجرای همه ی آن ها، نتیجه را به درونِ تابعِ آزانگر باز می گرداند و جایگزینِ `yield` می کند یا اگر خطایی رخ دهد، همان خطا را در جای `yield` پرتاب می کند. پس اگر خطایی رخ ندهد، به یک آرایه از داده های درونِ پرونده ها می رسیم. سپس `return` نیز آن را باز می گرداند. `co` این آرایه ی باز گشته را می گیرد و آن را به تابعِ `done` که به آن فرستاده شده می فرستد. اگر خطایی رخ دهد که `catch` نشده باشد، `done` را با آن فرا می خواند.

می بینید که کار با `co` خیلی ساده است و چه اندازه کد را ساده تر کرده است. می توانید بگویید که کتابخانه های دیگری هم هستند که کدِ نمونه ی نخست را ساده تر می کنند (مانند [async](https://github.com/caolan/async)) ولی باز در کنترلِ خطا به `co` نمی رسند.

تابعِ آزانگری که به `co` فرستاده می شود، می تواند چند چیز را بیازاند. می تواند یک تابعِ آزانگرِ دیگر باشد یا اینکه یک آزانگر باشد. آرایه را هم که در نمونه کدِ بالا دیدیم. اگر `object` باشد هم باز کار را موازی پیش می برد. همچنین می توانید یک `promise` را به آن بفرستید. یا بهتر از آن، می توانید یک `thunk` را به آن بفرستید.

## `thunk` چیست؟

به تابعی که بیشتر خودکار ساخته می شود تا به فراخوانیِ یک تابعِ دیگر کمک کند، `thunk` می گویند. بیشتر برای این به کار می روند که کمی فراخوانیِ تابعِ دیگر را ساده تر کنند.

یک نمونه از آن را کمی بالا تر دیدیم. در اینجا دوباره آورده شده است.

    function readFile(path) {
      return function (done) {
        fs.readFile(path, 'utf-8', done)
      }
    }

در اینجا `readFile` یک `thunk` است که تنها فراخوانیِ `fs.readFile` را برای ما ساده کرده است. بیشتر تابع ها در `Node.js` یک `callback` می گیرند که اگر فراخوانده شود، دو پارامتر دارد: `(error, response)`. ولی `co` برای اینکه بتواند کار کند، نیاز دارد تا تابعی برای آن آزانده شود که تنها یک `callback` می گیرد که همین دو پارامتر را می گیرد و نه چیزِ دیگری. برای همین `readFile` را نوشتیم تا بتوانیم آن را به جای `fs.readFile` به `co` بفرستیم.

## با `thunkify` آشنا شوید

[thunkify](https://github.com/visionmedia/node-thunkify) یک کتابخانه یِ دیگر است که آن هم بدستِ TJ Holowaychuk نوشته شده و کارِ بسیار ساده ای می کند. با آن می توانید به سادگی `thunk` برای تابع های `Node.js` که `callback` می گیرند بسازید. با به کار گیری آن، دیگر نیازی به نوشتنِ تابعِ کدِ پیش نیست.

    var readFile = thunkify(fs.readFile)

این همان کارِ کدِ پیش را می کند.

## برنامه ی نمونه

بیایید یک نمونه کدِ پیشرفته تر را ببینیم. بیایید بگوییم می خواهیم همه ی پرونده های با غالبِ [`markdown`](http://en.wikipedia.org/wiki/Markdown) را که در پوشه ی `md/` هستند به `html` تبدیل کنیم و آن ها را در پوشه ی `html/` بریزیم. کدِ زیر این کار را با `callback` ها انجام می دهد.

    var fs = require('fs')
      , marked = require('marked')

    function convert(inDir, outDir, done) {
      fs.readdir(inDir, function (err, files) {
        if (err) return done(err)

        var count = files.length
          , doneCalled = false
          , htmlData = new Array(count)

        files.map(function (file, i) {
          fs.readFile(inDir + file, 'utf-8', function (err, data) {
            if (doneCalled) return
            if (err) {
              doneCalled = true
              done(err)
              return
            }

            htmlData[i] = marked(data)
            fs.writeFile(outDir + file + '.html', htmlData[i], function (err) {
              if (doneCalled) return
              if (err) {
                doneCalled = true
                done(err)
                return
              }

              count -= 1
              if (count === 0) done(null, htmlData)
            })
          })
        })
      })
    }

    convert('md/', 'html/', function (err, res) {
      if (err) return console.error(err.message)
      console.log('%d files converted', res.length)
    })

در اینجا `marked` کارِ تبدیلِ `markdown` به `html` را انجام می دهد. با `fs.readdir` پرونده های درونِ پوشه ی `md/` را خوانده ایم. سپس همانندِ پیش برای آن که بتوانیم پرونده ها را موازی بخوانیم، چند متغیر گرفته ایم. پرونده ها را با `fs.readFile` خوانده ایم. کنترلِ خطا کرده ایم. سپس هر پرونده را به `html` تبدیل کرده ایم و پس از آن هم آن ها را در پوشه ی `html/` ذخیره کرده ایم و باز هم در پایان کنترلِ خطا کرده ایم و سر انجام `done` را فراخوانده ایم.

اکنون همین کار را با `co` و `thunkify` انجام می دهیم.

    var fs = require('fs')
      , marked = require('marked')
      , co = require('co')
      , thunkify = require('thunkify')
      , readDir = thunkify(fs.readdir)
      , readFile = thunkify(fs.readFile)
      , writeFile = thunkify(fs.writeFile)

    function convert(inDir, outDir, done) {
      co(function* () {
        var files, filesData, htmlData

        files = yield readDir(inDir)

        filesData = yield files.map(function (file) {
          return readFile(inDir + file, 'utf-8')
        })

        htmlData = filesData.map(function (data) { return marked(data)})

        yield files.map(function (file, i) {
          return writeFile(outDir + file + '.html', htmlData[i])
        })

        return htmlData

      })(done)
    }

    convert('md/', 'html/', function (err, res) {
      if (err) return console.error(err.message)
      console.log('%d files converted', res.length)
    })

می بینید که در آغاز `thunk` های `readDir` و `readFile` و `writeFile` را ساخته ایم. سپس در تابعِ آزانگری که به `co` فرستاده شده، نخست فهرست پرونده های درونِ پوشه ی `md/` را خوانده ایم. سپس داده های پرونده ها را به دست آورده ایم. سپس همه را به `html` تبدیل کرده ایم و پس از آن همه را در پوشه ی `html/` ذخیره کرده ایم. سرانجام هم `html` ها را باز گردانده ایم که `co` آن را به `done` می دهد. اگر خطایی هم رخ دهد، آن را به `done` می دهد.

این دو نمونه ی بالا را با هم مقایسه کنید. نمونه کدِ با `callback` خیلی زود نا خوانا می شود و کنترلِ خطا هم در آن خیلی دشوار تر است و شاید خیلی ساده چیزی را در آن میان فراموش کنید. دیگر کاری که برنامه می کند به سادگی فهمیده نمی شود.

کدی که با آزانگر نوشته شده، خیلی سر راست تر، ساده تر و فهمیدنی تر است - اگر آزانگر ها را بدانید. روندِ برنامه مشخص است و کنترلِ خطا هم ساده است. اگر بخواهید می توانید درونِ همین تابعِ آزانگر `try/catch` بگذارید و خطاهایی که درونِ هر یک از `thunk` ها رخ دهد را بگیرید و کاری برای آن بکنید.

## سر انجام

امیدوارم تا اینجا آزانگر ها را آموخته باشید. آزانگر ها که تواناییِ نگه داشتنِ تابع در میانه ی اجرای آن را می دهند، کنترلِ روند را بسیار ساده می کنند. به کار گیریِ `Node.js` را هم خیلی ساده تر می کنند. در بخش های آینده با چند ابزارِ دیگر هم آشنا خواهید شد.
