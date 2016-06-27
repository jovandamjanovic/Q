let xmlToJson = function (xml) {
    // Create the return object
    var obj = {};
    if (xml.nodeType == 1) { // element
        // do attributes
        if (xml.attributes.length > 0) {
            for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                obj["_" + attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType == 3) { // text
        obj = xml.nodeValue.replace(/^\s+|\s+$/g, ""); //clear out whitespaces
        if (obj === "") {
            return; //ignore empty text elements
        }
    }
    // do children
    // console.log(xml.nodeType, xml.nodeName, xml.nodeValue, xml.childNodes.length);
    if (xml.hasChildNodes()) {
        for (var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (typeof (obj[nodeName]) == "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof (obj[nodeName].push) == "undefined") {
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

class QComponent {
    constructor(name, width, height) {
        this.name = name;
        this.width = width;
        this.height = height;
    }

    render() {
        return this.name;
    }
}

class QComponentSet {
    constructor(catalogueName, metaData) {
        this.catalogueName = catalogueName;
        this.metaData = metaData;
    }

    static loadMetaData(metaDataPath) {
        return new Promise((resolve) => {
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

    newInstance(type) {
        var filteredComponent = this.metaData.ComponentCatalogue.Component.filter(function (current) {
            if (current.Id === type) {
                return current;
            }
        });
        if (filteredComponent.length > 0) {
            var componentMetaData = filteredComponent[0];
            return new QComponent(componentMetaData.Name, Number.parseInt(componentMetaData.Width), Number.parseInt(componentMetaData.Height));
        }
    }
}