Title: کاربردِ آزانگر (Generator) در جاوا اسکریپت برای کنترلِ روندِ اجرا - بخشِ دو
Author: بهرنگ نوروزی نیا
Date: 2014-06-28 13:15:00 GMT+0430 (IRDT)
Categories: javascript,generator,generators,nodejs,ecmascript,ecmascript6,es6,harmony

پیش از خواندنِ این نوشته، [بخشِ نخستِ آن را بخوانید]({% post_url 2014-06-21-javascript-generators-part1 %}).

همان گونه که در بخشِ نخست دیدید، آزانگر ها به شما تواناییِ نگه داشتنِ اجرای تابع و سپس ادامه ی آن را می دهند. در اینجا می کوشم تا چگونگیِ کاربردِ آن ها برای کنترلِ روندِ اجرای برنامه را نشان دهم.

## کنترلِ روندِ اجرا چیست؟

نمونه کدِ زیر را ببینید.

    var fs = require('fs')

    function readFile(path, done) {
      fs.readFile(path, 'utf-8', done)
    }

    function readTwoFiles(file1, file2, done) {
      readFile(file1, function (err, data1) {
        readFile(file2, function (err, data2) {
          done(null, [data1, data2])
        })
      })
    }

    readTwoFiles('md/file1.md', 'md/file2.md', function (err, res) {
      console.log(res[0])
      console.log(res[1])
    })

در اینجا می خواهیم در تابعِ `readTwoFiles` دو پرونده را بخوانیم. ولی می خواهیم نخست پرونده ی یک را بخوانیم و سپس پرونده ی دو را بخوانیم. این کار را با خواندنِ پرونده ی دوم درونِ `callback` ِ پرونده ی یک انجام داده ایم. کنترلِ روندِ اجرا به همین گفته می شود. گاهی می خواهید کار ها پشتِ سرِ هم انجام شوند، گاهی می خواهید همزمان با هم انجام شوند و گاهی به روش های دیگر.

کنترلِ روندِ اجرا در جاوا اسکریپت، تا کنون با `callback` ها انجام می شده است. اگر چه برنامه نویسان جاوا اسکریپت به آن ها خو گرفته اند و برنامه ها را می فهمند، ولی با آزانگر ها می توان کار ها را خیلی ساده تر کرد و کدِ ساده تر و فهمیدنی تری داشت.

## به کار گیریِ آزانگر

<!--more-->

اگر بخواهیم کدِ بالا را با آزانگر ها بنویسیم چه کار باید بکنیم؟ باید بتوانیم در زمانِ خواندنِ پرونده ی یک، اجرا را نگه داریم و داده های درونِ پرونده ی یک را به دست آوریم و سپس همین کار را برای پرونده ی دو انجام دهیم. ولی چگونه می توانیم داده های پرونده ی یک را به دست آوریم؟

در بخشِ نخستِ این نوشته دیدید که با فراخوانیِ `gen.next()` می توانیم اجرا را ادامه دهیم. چیزی که در آنجا نگفتم این بود که می توانید چیزی را به `next(...)` بفرستید و `yield` با آن چیز جایگزین می شود. پس، اگر پس از نگه داشتنِ اجرای برنامه، داده ها را به دست آوریم، می توانیم آن را به درونِ تابع باز گردانیم.

اکنون می توانیم بخشی از کد را بنویسیم.

        ...
        var data1 = yield readFile(file1)
        var data2 = yield readFile(file2)
        done(null, [data1, data2])
        ...

در اینجا نخست اجرای تابع نگه داشته شده تا داده های پرونده ی یک را به دست آوریم. سپس همین کار را برای پرونده ی دو انجام داده ایم. و سپس `done` را فراخوانده ایم. چیزِ دیگری که دگرگون شده، `readFile` است که این بار دیگر `callback` نگرفته است. به آن خواهیم پرداخت. اگر به یاد داشته باشید، `yield` را نمی توان درونِ تابع ها نوشت. باید درونِ آزانگر باشد. کدِ کامل را ببینید.

    var fs = require('fs')
      , run = require('./run')

    function readFile(path) {
      return function (done) {
        fs.readFile(path, 'utf-8', done)
      }
    }

    function readTwoFiles(file1, file2, done) {
      run(function* () {
        var data1 = yield readFile(file1)
        var data2 = yield readFile(file2)
        done(null, [data1, data2])
      })
    }

    readTwoFiles('md/file1.md', 'md/file2.md', function (err, res) {
      console.log(res[0])
      console.log(res[1])
    })

`readFile` دیگر `callback` نمی گیرد و تابعی را باز می گرداند که هر بار که این تابعِ بازگشتی فراخوانده شود، `callback` را با داده های درونِ پرونده فرا می خواند. تابعِ `run` کارِ کنترلِ روندِ اجرا را انجام می دهد. آزانگری که به آن فرستاده شود را اجرا می کند. کدِ زیر چگونگیِ نوشتنِ یک کنترل کننده ی روندِ اجرا را نشان می دهد.

    module.exports = run

    function run(fn) {
      var gen = fn()

      function next(err, res) {
        var ret = gen.next(res)
        if (ret.done) return
        ret.value(next)
      }

      next()
    }

به همین سادگی و کوتاهی. تابعِ `run` یک تابعِ آزانگر می گیرد. آزانگرِ آن را می سازد. یک تابعِ درونی به نامِ `next` تعریف می کند که کارِ اجرا را انجام می دهد. سپس آن را فرا می خواند. در درونِ `next` آزانگر اجرا می شود. اگر کارِ آزانگر پایان یافته باشد که هیچ. اگر نه، باید یک تابع را آزانیده باشد (`value` باید یک تابع باشد). آن را فرا می خواند و خود را `callback` ِ آن می کند. این کار را ادامه می دهد و هر بار که به `callback` چیزی باز گشته باشد (`res`)، آن را به آزانگر می دهد تا کار را ادامه دهد.

## کنترلِ خطا

شاید با خود بگویید که خیلی پیچیده شد و کد چندان هم بهتر نشده. نمونه های بالا خیلی ساده شده بودند تا بتوانم کنترلِ روند را توضیح بدهم. ولی در کد هایی که در برنامه ها می نویسیم، کار به این سادگی نیست. چیزِ مهمی که در این جا ندیدیم، گرفتنِ خطا ها بود. گرفتنِ خطا ها در جاوا اسکریپت و برنامه های `Node.js` کارِ بسیار دشواری است. در کدِ زیر، خطاهای نمونه کدِ با `callback` کنترل شده اند.

    var fs = require('fs')

    function readFile(path, done) {
      fs.readFile(path, 'utf-8', done)
    }

    function readTwoFiles(file1, file2, done) {
      readFile(file1, function (err, data1) {
        if (err) return done(err)
        readFile(file2, function(err, data2) {
          if (err) return done(err)
          done(null, [data1, data2])
        })
      })
    }

    readTwoFiles('md/file1.md', 'md/file2.md', function (err, res) {
      if (err) return console.error(err.message)
      console.log(res[0])
      console.log(res[1])
    })

می بینید که درونِ هر `callback` یک بار بررسی کرده ایم که آیا خطایی پیش آمده و یا نه. اگر خطا پیش آمده، `done` را با آن فرا می خوانیم. این کار را خیلی دشوار می کند. برنامه هایی که می نویسیم، همیشه خیلی پیچیده تر از این نمونه کدِ ساده هستند. زبان های برنامه نویسی، `try/catch` را برای ساده سازیِ همین مشکل آورده اند ولی در `callback` های جاوا اسکریپت، نمی توانیم آن ها را به کار بریم. چون کتاب خانه های درونیِ `Node.js` و دیگر کتاب خانه ها، تابعِ `callback` را درونِ یک `try/catch` فرا نمی خوانند.

اکنون بیایید کنترلِ خطا ها را با آزانگر ها انجام دهیم. چیزِ دیگری که در بخشِ نخست نگفتم، این است که به جای فراخوانیِ `next()` می توانید `throw()` را فرا بخوانید تا یک خطا در جایی از کد که `yield` بوده، `throw` شود. کدِ زیر را ببینید.

    var fs = require('fs')
      , run = require('./run')

    function readFile(path) {
      return function (done) {
        fs.readFile(path, 'utf-8', done)
      }
    }

    function readTwoFiles(file1, file2, done) {
      run(function* () {
        try {
          var data1 = yield readFile(file1)
          var data2 = yield readFile(file2)
          done(null, [data1, data2])
        } catch (err) {
          done(err)
        }
      })
    }

    readTwoFiles('md/file1.md', 'md/file2.md', function (err, res) {
      if (err) return console.error(err.message)
      console.log(res[0])
      console.log(res[1])
    })

در اینجا خیلی ساده یک `try/catch` گذاشته ایم تا خطا ها را بگیریم. خیلی ساده تر از کدِ نخست است. کدِ `run` را هم ببینید.

    module.exports = run

    function run(fn) {
      var gen = fn()

      function next(err, res) {
        if (err) return gen.throw(err)
        var ret = gen.next(res)
        if (ret.done) return
        ret.value(next)
      }

      next()
    }

تنها یک خط افزوده شده که اگر خطایی رخ داده باشد، `throw(err)` خطا را در درونِ آزانگر `throw` می کند.

## چه به دست آوردیم؟

تا اینجا دیدید که آزانگر ها در کنترلِ روندِ اجرا به ما خیلی کمک می کنند. این که می توانیم در میانه ی اجرا تابع را نگه داریم، کاری را انجام دهیم، سپس کار را از همان جا ادامه دهیم یا اینکه خطایی به جای آن `throw` کنیم، بسیار بسیار ویژگیِ توانمندی است.

کدی که با آزانگر ها نوشته شود می تواند هم ساده تر باشد، هم روندِ برنامه را بهتر نشان دهد، هم کنترلِ خطای خیلی بهتری داشته باشد. در بخش آینده، با یک ابزار بسیار پیشرفته برای کنترلِ روندِ اجرا آشنا خواهید شد.
