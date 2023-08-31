
/**
 * This tool will conver ora files exported from gimp and unzip them to a temp directory 
 * then copy them to src/_game/assets/images. It will watch for file changes in asset/ and 
 * look for *.ora file changes.
 */

require('fs');

/*
fs.watch("./files/", function(event, targetfile){
        console.log(targetfile, 'is', event)
        fs.readFile("./files/"+targetfile, 'utf8', function (err,data) {
                if (err) {
                        return console.log(err);
                }
                if (data=="") return; //This should keep it from happening
                //Updates the client here
                fs.truncate("./files/"+targetfile, 0);
        });
});
*/

/*
const decompress = require("decompress");
decompress("example.zip", "dist")
  .then((files) => {
    console.log(files);
  })
  .catch((error) => {
    console.log(error);
  });

  */