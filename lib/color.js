const clc = require("cli-color");

module.exports = {
    backgroundGreen: function(text){
        return console.log(clc.bgBlue(clc.white(text)));
    },
    backgroundRed: function(text){
        return console.log(clc.bgRed(clc.white(text)));
    },
    backgroundYellow: function(text){
        return console.log(clc.bgYellow(clc.white(text)));
    }
}