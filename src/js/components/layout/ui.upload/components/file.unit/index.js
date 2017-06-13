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
            delConfirm: false
        });

        this.initData(data);
        
        this.supr(data);
    },
    
    init: function(data) {},
    
    initData: function(data) {
        var file = data.file;
        data.name = this.getFileName(file);
        data.type = this.getFileType(file);
        data.src = window.URL.createObjectURL(file);
        
        this.uploadFile(file);
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
    
    uploadFile: function(file) {
        var self = this,
            data = this.data,
            freader = new FileReader();
        
        freader.onload = function(evt) {
            var options = {
                upload: {
                    onload: function(e) {
                        data.status = 'uploaded';
                        data.progress = '100%';
                        self.$update();
                    },
                    onprogress: function(e) {
                        data.status = 'uploading';
                        data.progress = parseInt((e.loaded / e.total) * 100) + '%';
                        self.$update();
                    }
                },
                onload: function(e) { },
                onerror: function(e) {
                    data.status = 'failed';
                    self.$update();
                }
            };
            upload('http://localhost:3000/upload', evt.target.result, options);
        };
        freader.readAsBinaryString(file);
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
    },
    
    onPreview: function() {
        this.$emit('preview');
    }
});

module.exports = FileUnit;
