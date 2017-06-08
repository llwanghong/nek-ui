/**
 *  ------------------------------
 *  image preview
 *  ------------------------------
 */

'use strict';

var Component = require('../../../../../ui-base/component');
var _ = require('../../../../../ui-base/_');
var  tpl = require('./index.html');

var ImagePreview = Component.extend({
    name: 'image.preview',
    template: tpl.replace(/([>}])\s*([<{])/g, '$1$2'),
    config: function (data) {
        _.extend(data, {
            imgList: []
        });
        
        this.supr(data);
    },
    init: function (data) {
        this.supr(data);
    },
    onClose: function() {
        this.destroy();    
    },
    onPrev: function() {
        
    },
    onNext: function() {
        
    }
});

module.exports = ImagePreview;
