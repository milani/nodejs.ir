Title: اسم مقاله شما

Author: نام و نام خانوادگی شما

Date: 2011-01-01 01:01:01 GMT+0330 (IRDT)

Categories: expressjs,pug,nodejs

خیلی تخصصی و حرفه ای نیست . چند مورد کوچیک و جالب رو دیدم و گفتم به اشتراک بزارم .
آخر همین پست به صفحه github من برید و پروژه رو از اونجا دریافت کنین . 
 با دوتا جستجو معمولی به همه این چیزایی که مینویسم میرسید . 
میخوام یک صفحه لاگین و یک صفحه خوشامد در صورت لاگین موفقیت آمیز با داده های استاتیک ، داخل express Js  و  موتور قالب قدرمتند و جذاب pug بنویسیم . 
اول از همه ترمینال رو باز کنین و دستور زیر رو بزنید تا express generator  رو نصب کنیم . 
```
npm install express-generator -g
```
حالا باید برنامه رو ایجاد کنیم
```
cd /var/www/html
mkdir expressLogin
cd expressLogin
npm init
```
چند تا سوال میپرسه و جواب بدید و در آخر yes . 
حالا express  رو ایجاد کنیم .
```
express --view=pug expressLogin
```
این دستور عالیه . براتون روتر و ویو یک سری چیز های باحال رو میسازه و میریم جلو. 
حالا بریم داخل bin/www و فایل رو ویرایش کنین . 
پورت 3000 رو میتونین اینجا تغییر بدید به 8080 یا هر چیز دیگه . 
حالا بریم bootstrap  رو نصب کنیم روی pug  . 
فایل view/layout.pug  رو باز کنین و به این شکل تغییر بدید . 
```
doctype html
html
  head
    title= title
    link(rel='stylesheet', href='https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css')
    link(rel='stylesheet', href='../stylesheets/style.css')
  body
    block content

  script(src='https://code.jquery.com/jquery-3.3.1.slim.min.js')
  script(src='https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js')
  script(src='https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js')
  ```
حالا بریم صفحه لاگین و صفحه خوشامد رو بسازیم

برای اینکه استایلمون کامل بشه ، به public/stylesheets/style.css  برید . 
کل فایل رو به زیر تغییر بدید . 
```
html,
body {
  height: 100%;
}

body {
  padding-top: 40px;
  padding-bottom: 40px;
  background-color: #f5f5f5;
}

.form-signin {
  width: 100%;
  max-width: 330px;
  padding: 15px;
  margin: auto;
}
.form-signin .checkbox {
  font-weight: 400;
}
.form-signin .form-control {
  position: relative;
  box-sizing: border-box;
  height: auto;
  padding: 10px;
  font-size: 16px;
}
.form-signin .form-control:focus {
  z-index: 2;
}
.form-signin input[type="email"] {
  margin-bottom: -1px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}
.form-signin input[type="password"] {
  margin-bottom: 10px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
```
حالا صفحه view/index.pug  رو باز کنین و به زیر تغییر بدید . 
```
extends layout

block content
    div.text-center
        form(class="form-signin" method="POST" action="/users/login")
            #error
                if error
                    p.text-danger Error!!!

            - var h1Classes = ['h3', 'mb-3', 'font-weight-normal']
            h1(class=h1Classes) Please sign in

            //-input email
            label( for="inputEmail" class="sr-only") Email address
            input(type="email" name="username" id="inputEmail" class="form-control" placeholder="Email address" required autofocus)

            //-input password
            label(for="inputPassword" class="sr-only") Password
            input(type="password" name="password" id="inputPassword" class="form-control" placeholder="Password" required)

            //-remember Checkbox
            - var divClasses=['checkbox', 'mb-3'];
            div(class=divClasses)
                label
                    input(type="checkbox" value="remember-me")
                    span Remember me

            //-signIn button
            - var buttonClass=['btn', 'btn-lg', 'btn-primary', 'btn-block'];
            button(class=buttonClass type="submit") Sign in

            - var pClasses=['mt-5', 'mb-3', 'text-muted'];
            p(class=pClasses) © 2017-2018
```
حالا یک فایل ایجاد کنید داخل view به اسم users.pug با محتوای زیر
```
extends layout

block content
    div.text-center
        div(class="form-signin")
            div.text-center
                p wellCome Dear #{username}!
```
حالا بریم روتر ها و درخواست ها رو درست کنیم
برید داخل app.js تا میدلور اضافه کنیم تا درخواست ها رو بتونیم پارس کنیم . زیر var app ....  کد زیر رو وارد کنین :
```
//parse requests
app.use(bodyParser.urlencoded({ extended: true }));
```
و بالای همین فایل بالای cookieParser کد زیر رو جایگزین کنید :
```
var bodyParser = require('body-parser');
```
خوب حالا بریم داخل routes/index.jsو کد زیر رو جایگزین کنین :
```
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { error: false });
});
```
اینجا متغیر error رو false گذاشتیم .
 حالا شما میتونین سرور رو اجرا کنین . و روی پورت 8080 (یا اگر تغییر ندادین ، روی 3000) ببینید . برای این کار دستور زیر رو بزنید :
```
npm run start
```
خوب میبینید که صفحه لاگین بدون خطا دقیقا مشابه نمونه که گذاشتم ایجاد شد . 
حالا بریم سراغ ساختن روتر users/login و authorize کردن کاربر با داده های استاتیک . 
برید داخل routes/users.js  و کد زیر رو به جای محتوای فایل بزارید . 
```
var express = require('express');
var router = express.Router();
var login = require('../controller/authenticate/login');

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

/* Login user */
router.post('/login', function (req, res, next) {

    const username = req.body.username;
    let loginResult = login(username, req.body.password);

    if (loginResult) {
        res.render('users', {username: username});
    }
    else {
        res.render('index', {error: true});
    }
});

module.exports = router;
```
اینجا داریم داخل بخش login میگیم اگر خروجی login برابر با true  بود ، بریم به صفحه کاربر. در غیر این صورت بریم به index  و error رو بزاریم true . خوب همه چیز عالیه جز یک چیز . این که ما متود login رو نساختیم .
پس داخل روت پروژه برید و پوشه controller/authenticate  رو بسازید و داخل پوشه authenticate  فایل login.js  رو با محتوای زیر ایجاد کنین :
```
var login =function(user,password){

    console.log(user,password)
    if(user==="admin@admin.com" && password==="admin"){
        return true;
    }
    else{
        return false;
    }
}

module.exports=login;
```
تمومه
 حالا اگر نام کاربری رو admin@admin.com وارد کنید با رمز عبور admin ، وارد صفحه users میشید و در غیر این صورت یک خطا بالای صفحه لاگین میاد . 
میخواستم یک سری نکته ریز رو توی پروژه بگم . کار حرفه ای نیست . 
ارادت
