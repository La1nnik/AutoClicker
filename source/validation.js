const $ = require('jquery');

function validateNumInput(id) {
    $("#" + id).on("input", function () {


        var value = $(this).val();

        // Remove all non-numeric characters
        if (! /^\d*$/.test(value)) {
            var cleanValue = value.replace(/\D/g, '');
            $(this).val(cleanValue);
            value = cleanValue;
        }

        if (value > 100000000) {

            $(this).val(value.slice(0, -1));
            return;
        }

        if (value[0] == 0) {
            $(this).val(0);
        }

    });
}


validateNumInput("clickInterval");

validateNumInput("repeatCount");
