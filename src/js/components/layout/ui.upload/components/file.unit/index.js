/**
 *  ------------------------------
 *  file unit
 *  ------------------------------
 */

'use strict';

var Component = require('../../../../../ui-base/component');
var _ = require('../../../../../ui-base/_');
var tpl = require('./index.html');
var upload = require('../../utils');
var Modal = require('../../../../notice/modal');

var FileUnit = Component.extend({
    name: 'file.unit',
    template: tpl.replace(/([>}])\s*([<{])/g, '$1$2'),
    config: function(data) {
        _.extend(data, {
            file: {},
            options: {}
        });
        
        _.extend(data, {
            info: '上传失败',
            status: '',
            delConfirm: true
        });

        this.initData(data);
        
        this.supr(data);
    },
    
    init: function(data) {},
    
    initData: function(data) {
        var file = data.file;
        data.name = this.getFileName(file);
        data.type = this.getFileType(file);
        
        if (data.type === 'IMAGE') {
            this.initImage(data);
        }
    },
    
    getFileName: function(file) {
        return file.name;
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
        } else if (/text\/html/.test(type)) {
            return 'HTML';
        } else if (/application\/pdf/.test(type)) {
            return 'PDF';
        } else if (/application\/javascript/.test(type)) {
            return 'JS';
        }

        if (type === '') {
            if (/zip|rar|gz/i.test(name)) {
                return 'ZIP';
            }
        }
        
        return 'UNKNOWN';
    },
    
    initImage: function(data) {
        this.initImageSrc(data);  
    },

    initImageSrc: function(data) {
        data.src = window.URL.createObjectURL(data.file);
    },
    
    uploadFile: function(data) {
        var freader = new FileReader();
        freader.onload = function(evt) {
            // data.src = evt.target.result;
            // xhr.send(evt.target.result);
        };
        freader.readAsBinaryString(data.file);
    },
    
    onDelete: function () {
        var self = this,
            data = this.data;
        
        if (data.delConfirm) {
            var modal = new Modal({
                data: {
                    content: '确认删除' + data.name + '?'
                }
            }).$on('ok', function() {
                self.$emit('delete');
            });
        } else {
            self.$emit('delete');
        }
    }
});

module.exports = FileUnit;
