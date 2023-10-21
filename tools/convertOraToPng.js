
/**
 * This tool will conver ora files exported from gimp and unzip them to a temp directory 
 * then copy them to src/_game/assets/images. It will watch for file changes in asset/ and 
 * look for *.ora file changes.
 */

const fs = require('fs');


fs.watch("../assets/", function (event, targetfile) {
        console.log(targetfile, 'is', event)

});


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