$(document).ready(() => {
  $('.slider').slider({
    indicators: false
  });

  $('img').click(() => {
    $('.slider').slider('next');
  })

});
