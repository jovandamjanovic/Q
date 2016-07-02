"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var xmlToJson = function xmlToJson(xml) {
    // Create the return object
    var obj = {};
    if (xml.nodeType == 1) {
        // element
        // do attributes
        if (xml.attributes.length > 0) {
            for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                obj["_" + attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType == 3) {
        // text
        obj = xml.nodeValue.replace(/^\s+|\s+$/g, ""); //clear out whitespaces
        if (obj === "") {
            return; //ignore empty text elements
        }
    }
    // do children
    if (xml.hasChildNodes()) {
        if (xml.nodeName === "Graphics") {
            return xml.innerHTML;
        }
        for (var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (typeof obj[nodeName] == "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof obj[nodeName].push == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    var regexp = /{"#text":(".+?")}/g;
    obj = JSON.parse(JSON.stringify(obj).replace(regexp, "$1"));
    return obj;
};

var QComponent = function () {
    function QComponent(metaData) {
        _classCallCheck(this, QComponent);

        this.metaData = metaData;
        this.name = metaData.Name;
        this.width = Number.parseInt(metaData.Width);
        this.height = Number.parseInt(metaData.Height);
    }

    _createClass(QComponent, [{
        key: "render",
        value: function render() {
            if (this.metaData.Graphics !== undefined) {
                var template = document.createElementNS("http://www.w3.org/2000/svg", 'template');
                template.innerHTML = this.metaData.Graphics.replace(/^\s+|\s+$/g, "").replace(/>\s*/g, '>').replace(/<\s*/g, '<');
                return template.firstChild;
            }
            return document.createElement('div');
        }
    }]);

    return QComponent;
}();

var QComponentSet = function () {
    function QComponentSet(catalogueName, metaData) {
        _classCallCheck(this, QComponentSet);

        this.catalogueName = catalogueName;
        this.metaData = metaData;
    }

    _createClass(QComponentSet, [{
        key: "newInstance",
        value: function newInstance(type) {
            var filteredComponent = this.metaData.ComponentCatalogue.Component.filter(function (current) {
                if (current.Id === type) {
                    return current;
                }
            });
            if (filteredComponent.length > 0) {
                var componentMetaData = filteredComponent[0];
                return new QComponent(componentMetaData);
            }
        }
    }], [{
        key: "loadMetaData",
        value: function loadMetaData(metaDataPath) {
            return new Promise(function (resolve) {
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (xhttp.readyState == 4 && xhttp.status == 200) {
                        resolve(xmlToJson(xhttp.responseXML));
                    }
                };
                xhttp.open("GET", metaDataPath, true);
                xhttp.send();
            });
        }
    }]);

    return QComponentSet;
}();