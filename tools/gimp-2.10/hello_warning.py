#!/usr/bin/env python

from gimpfu import *

def hello_warning(image, drawable):
    # function code goes here...
    pdb.gimp_message(image.name)
    

register(
    "python-fu-hello-warning",
    "Hello world warning",
    "Prints 'Hello, world!' to the error console",
    "Shawn D", "Shawn D", "2024",
    "Hello warning",
    "", # type of image it works on (*, RGB, RGB*, RGBA, GRAY etc...)
    [
        (PF_IMAGE, "image", "takes current image", None),
        (PF_DRAWABLE, "drawable", "Input layer", None)
    ],
    [],
    hello_warning, menu="<Image>/File")  # second item is menu location

main()