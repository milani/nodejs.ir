(function($){
  // Track positioning and visibility.
  function tracker(e) {
    // Save positioning data.
    var viewHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    if (e.viewHeight != viewHeight) {
      e.viewHeight = viewHeight;
      e.vPosition = $(e.table).offset().top - 4;
      e.hPosition = $(e.table).offset().left;
      e.vLength = e.table.clientHeight - 100;
    }

    // Track horizontal positioning relative to the viewport and set visibility.
    var hScroll = document.documentElement.scrollLeft || document.body.scrollLeft;
    var vOffset = (document.documentElement.scrollTop || document.body.scrollTop) - e.vPosition;
    var visState = (vOffset > 0 && vOffset < e.vLength) ? 'visible' : 'hidden';
    $(e).css({left: -hScroll + e.hPosition +'px', visibility: visState});

    // Check the previous anchor to see if we need to scroll to make room for the header.
    // Get the height of the header table and scroll up that amount.
    if (prevAnchor != location.hash) {
      if (location.hash != '') {
        var offset = $('td' + location.hash).offset();
        if (offset) {
          var top = offset.top;
          var scrollLocation = top - $(e).height();
          $('body, html').scrollTop(scrollLocation);
        }
      }
      prevAnchor = location.hash;
    }
  }
    $(document).ready(function(){
        var nav = $('#toc');
        var navClone = nav.clone(true).insertBefore('#toc');
        var navTop = nav.offset().top;
        navClone.attr('id','toc-clone');
        navClone.css({position:'fixed',top:'10px',visibility:'hidden'});
        
        $(document).scroll(function(e){
            var viewHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
            if (e.viewHeight != viewHeight) {
              e.viewHeight = viewHeight;
            }
            var vOffset = (document.documentElement.scrollTop || document.body.scrollTop);
            var visState = (vOffset < navTop) ? 'visible' : 'hidden';
            var cloneVisState = (vOffset > navTop) ? 'visible' : 'hidden';
            $(navClone).css({visibility: cloneVisState});
            $(nav).css({visibility: visState});
        });
    });
})(jQuery);
