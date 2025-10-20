const $ = require('jquery');

$("#clickInterval").on("input", function () {

    var value = $(this).val();

    if (value < 0) {
        $(this).val("0")
        $(this).css("border-color", "#dc2626")
    }
    else if (value > 100000000) {
        $(this).css("border-color", "#dc2626")
        $(this).val(value.slice(0, -1))
    }
    else {
        $(this).css("border-color", "")
    }
});