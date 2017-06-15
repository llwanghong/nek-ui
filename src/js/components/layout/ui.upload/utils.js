var _ = require('../../../ui-base/_');

var defaults = {
    type: 'POST',
    async: true
};

function upload(url, data, options) {
    var fd = new FormData();
    
    if (data instanceof File) {
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

    var onerror = options.onerror || function(e) {};
    
    var onload = options.onload || function(e) {};
    
    var onprogress = options.onprogress || function(e) {};
    
    xhr.addEventListener('load', onload);
    xhr.addEventListener('error', onerror);
    xhr.addEventListener('progress', onprogress);
    
    if (options.upload) {
        var onuploadLoad = options.upload.onload || function(e) {};

        var onuploadProgress = options.upload.onprogress || function(e) {};

        xhr.upload.addEventListener('load', onuploadLoad);
        xhr.upload.addEventListener('progress', onuploadProgress);
    }
    
    xhr.send(options.data);
}

module.exports = upload;