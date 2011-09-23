Title: شیء گرایی در جاوا اسکریپت
Author: مرتضی میلانی
Date: 2011-08-07 02:58:38 GMT+0330 (IRDT)
Categories: fundamentals, javascript, prototype

<p>شاید برای خیلی ها عجیب باشد که در مورد شیء گرایی با جاوا اسکریپت متنی  بخوانند. واقعیت این است که جاوا اسکریپت ساختارهای شیء گرایی با  قابلیتهای بسیار بالایی دارد اما به دلیل تفاوت این شیء گرایی با شیء گرایی  های معمول در زبان های شبه C، این ساختارها برای برنامه نویسانی که از  ابتدا با Java، C و ... کار کرده اند کمی عجیب است.</p>
<p>همه از فواید شیء گرایی و ماهیت آن اطلاع داریم بنابراین از شرح شیء  گرایی می گذریم. در اینجا می خواهیم با نوع خاصی از شیء گرایی آشنا شویم که  به عنوان prototyping شناخته می شود.</p>
<!--more-->
<p>برنامه نویسی بر مبنای Prototype نوع خاصی از برنامه نویسی به سبک شیء  گرایی است که در آن از کلاس خبری نیست! تنها چیزی هایی که داریم اشیاء  هستند. به عبارت بهتر کلاس ها مشخصاً به عنوان ماهیتی مجزا از اشیاء تعریف  نمی شوند. خصوصیاتی نظیر ارث بری با دستکاری اشیاء موجود یا به عبارت دیگر  prototype ها به وجود می آیند ( Prototype از کلمه یونانی <em>prototypon </em>به معنی <em>ساختار اولیه</em> گرفته شده است ).</p>
<p>با این توضیح به شرح شیء گرایی در جاوا اسکریپت می پردازیم.</p>
<h2>برنامه نویسی شیء گرا در جاوا اسکریپت</h2>
<h3>اشیاء اصلی</h3>
<p>جاوا اسکریپت در هسته خود چند شیء از پیش تعریف شده دارد: <code>Array</code> ، <code>Object</code>، <code>Boolean</code>، <code>String</code>، <code>Math</code>، <code>Number</code>، <code>RegExp</code>، <code>Date</code> و <code>Function</code>. شرح این اشیاء را در<a title="اشياء از پیش تعریف شده در جاوا اسکریپت" href="http://en.wikipedia.org/wiki/Prototype" target="_blank"> این صفحه</a> ببینید.</p>
<p>همه این اشیاء از شیء Object ساخته شده اند.</p>
<h3>تعریف اشیاء</h3>
<p>در زبان های شبه C، اشیاء از روی کلاس ها ایجاد می شوند. همانطور که گفته شد در جاوا اسکریپت statement ای به عنوان Class وجود  ندارد. اما راه هایی برای تعریف اشیاء جدید پیش روست.</p>
<h4>استفاده از Object</h4>
<p>گفتیم تمام اشیاء از Object ساخته شده اند. ما هم می توانیم برای ایجاد اشیاء جدید از آن استفاده کنیم:</p>
<pre><code>
var Rectangle = new Object();
Rectangle.x = 3;
Rectangle.y = 4;
Rectangle.area = function(){ 
    return this.x * this.y;
}

// Now you can use it:
Rectangle.area(); //returns 3 * 4
</code></pre>
<h4>Object Initializer</h4>
<p>می توانیم از Object Initializer ها برای تولید اشیاء استفاده کنیم:</p>
<pre><code>
var Rectangle = {
    x : 3,
    y : 4,
    area : function(){
        return this.x * this.y;
    }
};

// Just like above, use it:
Rectangle.area(); //returns 3 * 4
</code></pre>
<p>در دو روش بالا، اشیاء ساده ای ایجاد کردیم. مشکل اینجاست که برای تعریف  هر شیء باید از ابتدا آن را بنویسیم. مثلا برای داشتن دو شیء از Rectangle  باید دو بار با دو نام مختلف شیء را باز نویسی کنیم. برای حل این مشکل از  Constructor Function ها استفاده می کنیم.</p>
<h4>Constructor Function</h4>
<p>در  زبان جاوا اسکریپت، مشابه ترین مفهوم به کلاس ها، Constructor Function ها  هستند. این توابع در ظاهر تفاوتی با توابع دیگر ندارند اما می توان از  آنها برای تولید اشیاء استفاده کرد.</p>
<pre><code>function Rectangle(){
    this.x = 3;
    this.y = 4;
    this.area = function(){
        return this.x * this.y;
    }
};

var Rect = new Rectangle();

Rect.area();  // Returns 3 * 4;
</code></pre>
<p>حال می توانیم به هر تعداد بخواهیم مستطیل ایجاد کنیم!</p>
<h3>ارث بری</h3>
<p>در جاوا اسکریپت هر شیء می تواند خصوصیاتی را از شیء دیگر ( prototype  خود) به ارث ببرد. در هنگام صدا زدن یک خصوصیت از شیء مثلا یک متد، جاوا  اسکریپت به دنبال آن متد در خود شیء می گردد. اگر متد در شیء یافت نشد، در  prototype شیء شروع به جستجو می نماید و همینطور زنجیره ای از prototype ها  جستجو می شوند تا در نهایت یا متد پیدا شود و یا معلوم شود که متد وجود  ندارد. پرتوتایپ هر شیء از Constructor Function آن شیء به وجود می آید.</p>
<p><em>به طور پیش فرض تمام اشیاء از Object به وجود می آیند بنابراین زنجیره Prototype ها به این شیء خاص ختم می شود.</em></p>
<p>مثال زیر ارث بری را بخوبی نشان می دهد. توجه داشته باشید که در  Javascript به طور خودکار Constructor شیء مادر صدا زده نمی شود بلکه  اینکار باید توسط برنامه نویس انجام شود.</p>
<pre><code>
function Rectangle(x,y){
    this.x = x;
    this.y = y;
}
// Define a function in prototype.
// Child objects will inherit it.
Rectangle.prototype.area = function(){
    return this.x * this.y;
}

function Square(x){
    Rectangle.call(this,x,x);// Call parent constructor with context switch.
}

Square.prototype = new Rectangle(); // Chain Square prototype to Rectangle

Square.prototype.constructor = Square; // Define constructor for this prototype

Square.prototype.perimeter = function(){
    return this.x * 4;
}

var mySquare = new Square(3);
mySquare.area(); // Returns 9

(mySquare instanceof Square); // returns true
(mySquare instanceof Rectangle); // returns true
</code></pre>
<h3>Polymorphism</h3>
<p>Polymorphism در جاوا اسکریپت به سادگی با تعریف Constructor Function  های متفاوتی که متدهای هم نامی را پیاده سازی می کنند به وجود می آید.</p>
<pre><code>
var Square = function(x){
    this.x = x;
};
Square.prototype.perimeter = function(){
    return this.x * 4;
}

var Circle = function(x){
    this.x = x;
}
Circle.prototype.perimeter = function(){
    return this.x * 2 * Math.pi;
}
</code></pre>
<h3>Encapsulation</h3>
<p>در مثال ما Square از دانستن نحوه پیاده سازی محاسبه مساحت بی اطلاع است  با این حال می تواند از آن استفاده کند. و نیازی هم به تعریف مجدد آن  ندارد مگر اینکه بخواهد آن را تغییر دهد. این مفهوم Encapsulation است که  در جاوا اسکریپت پیاده سازی شده است.</p>
<h3>Private members</h3>
<p>در جاوا اسکریپت هر متد می تواند خصوصیات مخصوص به خود داشته باشد:</p>
<pre><code>
function Obj(){

    var foo = 'My Private variable';

    var bar = function(){
        return 'My Private Function';
    }
}
</code></pre>
<h2>برای مطالعه بیشتر</h2>
<p>مطالب بالا تنها روش های خاصی از بکارگیری مدل شیء گرای جاوا اسکریپت را  به نمایش می گذارد. روش های دیگری برای ارث بری، تعریف Object ها و ...  وجود دارد. برای آشنایی بیشتر می توانید به منابع زیر مراجعه کنید.</p>
<ul>
<li><a href="http://www.addyosmani.com/resources/essentialjsdesignpatterns/book/" target="_blank">http://www.addyosmani.com/resources/essentialjsdesignpatterns/book/</a></li>
<li><a href="https://developer.mozilla.org/en/Introduction_to_Object-Oriented_JavaScript" target="_blank">https://developer.mozilla.org/en/Introduction_to_Object-Oriented_JavaScript</a></li>
<li><a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/create" target="_blank">https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/create</a></li>
<li><a href="https://developer.mozilla.org/en/JavaScript/Guide" target="_blank">https://developer.mozilla.org/en/JavaScript/Guide/Working_with_Objects#Objects_and_Properties</a></li>
<li><a href="http://howtonode.org/object-graphs" target="_blank">http://howtonode.org/object-graphs</a></li>
</ul>
