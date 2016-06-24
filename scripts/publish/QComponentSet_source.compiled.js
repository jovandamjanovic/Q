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
            obj["@attributes"] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType == 3 && xml.nodeValue !== "") {
        // text
        obj = xml.nodeValue;
    }
    // do children
    if (xml.hasChildNodes()) {
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
    return obj;
};

var QComponent = function () {
    function QComponent(name, width, height) {
        _classCallCheck(this, QComponent);

        this.name = name;
        this.width = width;
        this.height = height;
    }

    _createClass(QComponent, [{
        key: "render",
        value: function render() {
            return this.name;
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
                if (current.Id["#text"] === type) {
                    return current;
                }
            });
            if (filteredComponent.length > 0) {
                var componentMetaData = filteredComponent[0];
                return new QComponent(componentMetaData.Name["#text"], Number.parseInt(componentMetaData.Width["#text"]), Number.parseInt(componentMetaData.Height["#text"]));
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