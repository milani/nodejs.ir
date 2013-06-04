Title: ساخت سیستم ورود Real-time با استفاده از socket.io و ماژول mysql
Author: مهدی دیبایی
Date: 2013-5-10 14:25:00 GMT+0330 (IRDT)
Categories: nodejs, realtime, socket.io, mysql

با استفاده از ماژول ‍`mysql` میتونید به راحتی با پایگاه های داده ارتباط برقرار کنید، با استفاده از این ماژول همراه با `socket.io` میتونید به صورت Real-time سیستم ورود و ثبت نام بسازید.

<b>مقدمات</b>

مطمئن بشید که ورژن `node` شما بالاتر از ۶ است، ورژن های قبلی تست نشدن.
اول ماژول `mysql` رو با استفاده از `npm` نصب کنید:
	npm install mysql

برای این تمرین، ۲ فایل آماده کنید:

	..
	  index.html
	  application.js

<b>کُٰد!</b>

اوّل باید با یک سری تابع های ماژول `mysql` آشنا بشید، پیشنهاد می کنم به صفحه ی ماژول در گیتهاب برید و بیشتر آشنا شید: [node-mysql](https://github.com/felixge/node-mysql)

به کد یه نگاهی بندازید: ( application.js )

	var app   = require('http').createServer(handler),
	    io    = require('socket.io').listen(app),
	    mysql = require('mysql'),
	    fs    = require('fs');
	
	function handler( request, response ) {
	
	  fs.readFileSync( __dirname + '/index.html', function( error, data ) {
	    
	    if( error ) throw error;
	    response.writeHead(200);
	    response.end( data );
	  
	  });
	};
	
	app.listen( 1377 )
	
	var connection = mysql.createConnection({
	  host: 'localhost',
	  user: 'root',
	  password: 'root',
	  database: 'node'
	});
	
تا اینجا تنها مورد جدیدی که با `mysql` مربوطه، ۶ خط آخر هست، برای ساختن یه کانکشن `mysql` از تابع `createConnection` استفاده می کنیم‌ که یه آبجکت که اطلاعات کانکشن رو داره رو قبول می کنه، مثل `PHP` اون رو به یه مقدار می دیم چون بعدا از اون استفاده می کنیم. مرحله بعد `socket.io` رو راه میندازیم و هماهنگ می کنیم. ( application.js )

	io.sockets.on( 'connection', function( socket ) {
	  socket.on( 'loginRequest', function( data ) {
	    login( data );
	  }
	}

از `socket.io` میخوایم که وقتی درخواست برای ورود اومد، تابع `login` رو اجرا کنه. برای سمت کاربر هم: ( index.html )

	<!DOCTYPE html>
	  <html>
	    <head>
	      <script src='/socket.io/socket.io.js'> </script>
	      <script>
	        var socket = io.connect();
		socket.on( 'loginAnswer', function( data ) {
	          login( data, socket);
	        });
	      </script>
	    </head>
	    <body>
	      <form onsubmit='requestLogin()'>
	        <input id='username' type='text'>
	        <input id='password' type='password'>
	        <input type='submit'>
	      </form>
            </body>
	  </html>

اصل قضیه سادس، کاربر اطلاعات رو وارد می کنه، بعد از ثبت تابع `requestLogin` اجرا میشه که بعدا تعریف می کنیم، اطلاعات برای سرور ارسال میشه، در سمت سرور تابع `login‍` اجرا میشه که در اون اطلاعات تطابق داده میشن، بعد جواب ورود برای کاربر ارسال میشه و تصمیم گرفته میشه که نسبت به پاسخ چه عملی انجام بشه.

تابع `login` سمت سرور: ( application.js )

	function login( data, socket) {
	  var query = 'SELECT * FROM node_users';
	  connection.query( query, function( error, rows, fields ) {
	    if( error ) throw error;
	    if( rows[i].username == data.username && rows[i].password == data.password ) {
	      return socket.emit('loginAnswer', true)
	    return socket.emit('loginAnswer', false)
	  });
	});
	
	
تا اینجا، وقتی اطلاعات به سرور میاد، اطلاعات با پایگاه داده تطابق داده میشن و دو حالت دارن، اگر کابر اطلاعاتش درست باشه، پاسخ مثبت فرستاده میشه به کاربر و اگر نه پاسخ منفی.
تابع `login` و `requestLogin` سمت کاربر: ( index.html )
	
	function requestLogin() {
	  var username = document.getElementById('username').value,
	      password = document.getElementById('password').value;
	  socket.emit('loginRequest', { 'username' : username, 'password' : password } )
	  return false;
	}

	function login( data ) {
	  if( data ) {
	    alert('You\'ve succesfully logged in!');
	  }
	  else {
	    alert('Login failed :(');
	  }
	}
	

به همین سادگی بود، با یکم تمرین میتونید کار های خیلی بزرگتری کنید. امیدوارم موفق باشید!
اگر مشکلی در آموزش میبینید یا انتقادی دارید خوشحال میشم اگر به کمک شما حل بشه.
	
