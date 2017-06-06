/**
 *  ------------------------------
 *  file unit
 *  ------------------------------
 */

'use strict';

var  Component = require('../../../../../ui-base/component');
var  _ = require('../../../../../ui-base/_');
var  tpl = require('./index.html');
var  upload = require('../../utils');

var FileUnit = Component.extend({
    name: 'file.unit',
    template: tpl.replace(/([>}])\s*([<{])/g, '$1$2'),
    config: function(data) {
        _.extend(data, {
            file: {},
            options: {},
            info: '上传失败',
            status: 'failed'
        });

        this.initData(data.file);
        this.supr(data);
    },
    
    init: function(data) {
    },
    
    initData: function(file) {
        var data = this.data;

        data.name = file.name;
        data.type = this.getFileType(data.file);
    },
    
    getFileType: function(file) {
        var type = file.type || '';
            name = file.name || '';
        
        if (/image\/.*/.test(type)) {
            return 'IMAGE';
        } else if (/document|sheet/.test(type)) {
            return 'DOC';
        } else if (/text\/plain/.test(type)) {
            return 'TEXT';
        }
        
        if (type === '') {
            if (/zip|rar|gz/i.test(name)) {
                return 'ZIP';
            }
        }
        
        return 'UNKNOWN';
    },
    onDelete: function () {
        this.destroy();
    }
});

module.exports = FileUnit;
