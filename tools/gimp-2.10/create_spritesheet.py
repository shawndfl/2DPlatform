#!/usr/bin/env python

from gimpfu import *
import math
import sys
import os

SpriteSheetErrorFile = 'C:/Tmp/python-fu-output.txt'
sys.stderr = open(SpriteSheetErrorFile,'a')
sys.stdout=sys.stderr # So that they both go to the same file

SpriteSheetErrorFileSeparator = '/'
SpriteSheetErrorDefaultPath = 'C:/tmp/'

def jsonHeader(json, width, height):
    json += '{\n'
    json += '\t\"imageSize\": [' + str(width) +', ' + str(height) +'],\n'
    json += '\t\"tiles\": [\n'
    return json

def jsonAddImage(json, name, i, j, width, height, isLast):
    json += '\t\t{\n'
    json += '\t\t\t\"id\": \"' + name +'\",\n'
    json += '\t\t\t\"loc\": [' + str(i) + ', ' + str(j) +', ' + str(width) + ', ' + str(height) +']\n'
    json += '\t\t}'
    if (isLast):
         json += '\n'
    else:
        json += ',\n'
    return json


def jsonClose(json):
    json += '\t]\n}'
    return json

def create_spritesheet(image, columns, filename, outputFolder):
    
    # Grab all the layers from the original image, each one of which will become an animation frame
    layers = image.layers
    numLayers = len(layers)

    sourceWidth = image.width
    sourceHeight = image.height

    # Place to write the json file
    f = outputFolder + SpriteSheetErrorFileSeparator + filename 
    json = '' 
    # Determine new image size, based on the number of rows and columns
    newImgWidth = sourceWidth * columns
    newImgHeight = int(sourceHeight * (math.ceil(float(numLayers) /float(columns))))

    # Create a new image with a single layer
    newImage = gimp.Image(newImgWidth, newImgHeight, RGB)
    newLayer = gimp.Layer(newImage, "Sprites", newImgWidth, newImgHeight, RGBA_IMAGE, 100, NORMAL_MODE)
    newImage.add_layer(newLayer, 1)

    json = jsonHeader(json, newImage.width, newImage.height)

    # Grab all the layers and place them into the new image
    for i in range(numLayers):
        # Copy the layer's contents and paste it into a "floating" layer in the new image
        pdb.gimp_edit_copy(layers[i])
        floating = pdb.gimp_edit_paste(newLayer, TRUE)
        offsetX, offsetY = floating.offsets
        layerX, layerY = layers[i].offsets
        pixelX = (i % columns) * image.width
        pixelY = (i / columns * image.height)
        x = pixelX - offsetX + layerX
        y = pixelY - offsetY + layerY
        w = layers[i].width
        h = layers[i].height
         
        name = layers[i].name
        json = jsonAddImage(json, name, x + offsetX, y + offsetY, w, h, i == numLayers -1)
        pdb.gimp_layer_translate(floating, x, y)
        pdb.gimp_floating_sel_anchor(floating)

   
    json = jsonClose(json)
    #os.remove(f)

    # Save the json
    outputfile = file(f, 'w')
    outputfile.write(json)
    outputfile.close()

    pdb.gimp_selection_all(image)
    gimp.Display(newImage)
    gimp.displays_flush()


# Register the plugin with Gimp so it appears in the filters menu
register(
    "python_fu_create_spritesheet",
    "Create a new spritesheet image from other layers.",
    "Create a new spritesheet image from other layers.",
    "Shawn Dady",
    "Shawn Dady",
    "2024",
    "Create Spritesheet",
    "*",
    [
        (PF_IMAGE, "image", "Input image:", None),
        (PF_INT, "columns", "Column Counts:", 10),
        (PF_STRING, "filename", "Export json file name:", "sprites.json"),
        (PF_DIRNAME, "outputFolder", "Export to folder:", SpriteSheetErrorDefaultPath),
    ],
    [],
    create_spritesheet, menu="<Image>/Filters/")

main()