var _ = require('../../../ui-base/_');

var defaults = {
    type: 'POST',
    async: true
};

function upload(url, data, options) {
    var fd = new FormData();
    
    if (fd instanceof File) {
        data = {
            file: data
        }
    }

    for (var key in data) {
        fd.append(key, data[key]);
    }
    
    options.url = url;
    options.data = fd;
    options = _.extend(defaults, options, true);
    
    return ajax(options);
}

function ajax(options) {
    var xhr = new XMLHttpRequest(),
        headers = options.headers || {};
    
    xhr.open(options.type, options.url, options.async);
    
    for (var key in headers) {
        xhr.setRequestHeader(key, headers[key]);
    }

    var callback = function() { alert(111); };
    xhr.addEventListener('load', callback);
    xhr.addEventListener('error', callback);
    
    if (options.progress) {
        xhr.addEventListener('progress', callback);
    }
    
    if (options.upload) {
        if (options.upload.load) {
            xhr.upload.addEventListener('load', options.upload.load);
        }
        if (options.upload.progress) {
            xhr.upload.addEventListener('progress', options.upload.progress);
        }
    }
    
    xhr.send(options.data);
}

module.exports = upload;