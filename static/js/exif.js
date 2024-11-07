/**
 * EXIF.js - JavaScript EXIF Reader
 * Reads EXIF (Exchangeable Image File Format) metadata from images
 * Original file: /npm/exif-js@2.3.0/exif.js
 * source: https://cdn.jsdelivr.net/npm/exif-js
 */

(function() {
    'use strict';
    
    // Debug flag
    const DEBUG = false;

    // EXIF namespace initialization
    const EXIF = function(obj) {
        if (obj instanceof EXIF) return obj;
        if (!(this instanceof EXIF)) return new EXIF(obj);
        this.EXIFwrapped = obj;
    };

    // Module exports setup
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = EXIF;
        }
        exports.EXIF = EXIF;
    } else {
        this.EXIF = EXIF;
    }

    // Tag Definitions
    EXIF.Tags = {
        // Version tags
        0x9000: "ExifVersion",             // EXIF version
        0xA000: "FlashpixVersion",         // Flashpix format version

        // Colorspace tags
        0xA001: "ColorSpace",              // Color space information
        0xA002: "PixelXDimension",         // Valid image width
        0xA003: "PixelYDimension",         // Valid image height

        // Image configuration
        0x9101: "ComponentsConfiguration", // Meaning of each component
        0x9102: "CompressedBitsPerPixel", // Image compression mode

        // User information
        0x927C: "MakerNote",              // Manufacturer notes
        0x9286: "UserComment",            // User comments

        // Related file information
        0xA004: "RelatedSoundFile",       // Related audio file

        // Date and time
        0x9003: "DateTimeOriginal",       // Date & time of original image
        0x9004: "DateTimeDigitized",      // Date & time of digital data generation
        0x9290: "SubsecTime",             // DateTime subseconds
        0x9291: "SubsecTimeOriginal",     // DateTimeOriginal subseconds
        0x9292: "SubsecTimeDigitized",    // DateTimeDigitized subseconds

        // Picture-taking conditions
        0x829A: "ExposureTime",           // Exposure time
        0x829D: "FNumber",                // F number
        0x8822: "ExposureProgram",        // Exposure program
        0x8824: "SpectralSensitivity",    // Spectral sensitivity
        0x8827: "ISOSpeedRatings",        // ISO speed rating
        0x8828: "OECF",                   // Optoelectric conversion factor
        0x9201: "ShutterSpeedValue",      // Shutter speed
        0x9202: "ApertureValue",          // Aperture
        0x9203: "BrightnessValue",        // Brightness
        0x9204: "ExposureBias",           // Exposure bias
        0x9205: "MaxApertureValue",       // Maximum lens aperture
        0x9206: "SubjectDistance",        // Subject distance
        0x9207: "MeteringMode",           // Metering mode
        0x9208: "LightSource",            // Light source
        0x9209: "Flash",                  // Flash
        0x920A: "FocalLength",            // Lens focal length
        // ... More tags ...
    };

    // TiffTags
    EXIF.TiffTags = {
        0x0100: "ImageWidth",
        0x0101: "ImageHeight",
        0x8769: "ExifIFDPointer",
        0x8825: "GPSInfoIFDPointer",
        0xA005: "InteroperabilityIFDPointer",
        0x0102: "BitsPerSample",
        0x0103: "Compression",
        // ... More TIFF tags ...
    };

    // GPS Tags
    EXIF.GPSTags = {
        0x0000: "GPSVersionID",
        0x0001: "GPSLatitudeRef",
        0x0002: "GPSLatitude",
        0x0003: "GPSLongitudeRef",
        0x0004: "GPSLongitude",
        // ... More GPS tags ...
    };

    // String value mappings
    EXIF.StringValues = {
        ExposureProgram: {
            0: "Not defined",
            1: "Manual",
            2: "Normal program",
            3: "Aperture priority",
            4: "Shutter priority",
            5: "Creative program",
            6: "Action program",
            7: "Portrait mode",
            8: "Landscape mode"
        },
        MeteringMode: {
            0: "Unknown",
            1: "Average",
            2: "CenterWeightedAverage",
            3: "Spot",
            4: "MultiSpot",
            5: "Pattern",
            6: "Partial",
            255: "Other"
        },
        // ... More string values ...
    };

    // Core EXIF Reading Functions
    function findEXIFinJPEG(file) {
        const dataView = new DataView(file);
        
        if (DEBUG) console.log("Got file of length " + file.byteLength);
        if (dataView.getUint8(0) != 0xFF || dataView.getUint8(1) != 0xD8) {
            if (DEBUG) console.log("Not a valid JPEG");
            return false;
        }

        const length = file.byteLength;
        let offset = 2;
        
        while (offset < length) {
            if (dataView.getUint8(offset) != 0xFF) {
                if (DEBUG) console.log("Not a valid marker at offset " + offset);
                return false;
            }

            const marker = dataView.getUint8(offset + 1);
            
            // We're only interested in 0xFFE1 marker (EXIF)
            if (marker === 0xE1) {
                if (DEBUG) console.log("Found 0xFFE1 marker");
                return readEXIFData(dataView, offset + 4, dataView.getUint16(offset + 2) - 2);
            }
            
            offset += 2 + dataView.getUint16(offset + 2);
        }
    }

    // Main public methods
    EXIF.getData = function(img, callback) {
        if ((self.Image && img instanceof self.Image)
            || (self.HTMLImageElement && img instanceof self.HTMLImageElement)
            && !img.complete)
            return false;
        
        if (hasExifData(img)) {
            if (callback) {
                callback.call(img);
            }
            return true;
        }
        
        loadExifData(img, callback);
        return true;
    };

    EXIF.getTag = function(img, tag) {
        if (hasExifData(img)) {
            return img.exifdata[tag];
        }
        return undefined;
    };

    EXIF.getAllTags = function(img) {
        if (!hasExifData(img)) return {};
        const data = img.exifdata;
        const tags = {};
        for (let tag in data) {
            if (data.hasOwnProperty(tag)) {
                tags[tag] = data[tag];
            }
        }
        return tags;
    };

    EXIF.pretty = function(img) {
        if (!hasExifData(img)) return "";
        let output = "";
        const data = img.exifdata;
        
        for (let tag in data) {
            if (data.hasOwnProperty(tag)) {
                if (typeof data[tag] === "object") {
                    if (data[tag] instanceof Number) {
                        output += `${tag} : ${data[tag]} [${data[tag].numerator}/${data[tag].denominator}]\r\n`;
                    } else {
                        output += `${tag} : [${data[tag].length} values]\r\n`;
                    }
                } else {
                    output += `${tag} : ${data[tag]}\r\n`;
                }
            }
        }
        return output;
    };

    // AMD support
    if (typeof define === 'function' && define.amd) {
        define("exif-js", [], function() {
            return EXIF;
        });
    }
    
}).call(this);
