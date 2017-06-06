/**
 *  ------------------------------
 *  ui.upload 上传
 *  ------------------------------
 */
'use strict';

var  Component = require('../../../ui-base/component');
var  _ = require('../../../ui-base/_');
var  FileUnit = require('./components/file.unit');
var  tpl = require('./index.html');

/**
 * @class UIUpload
 * @extend Component
 * @param {object}         [options.data]                  = 绑定属性
 * @param {string}         [options.data.action]           => 必选，上传地址
 * @param {string}         [options.data.name]             => 可选，上传的文件字段名
 * @param {boolean}        [options.data.multiple]         => 可选，是否支持多选
 * @param {boolean}        [options.data.drag]             => 可选，是否支持拖拽上传
 * @param {string}         [options.data.accept]           => 可选，接受上传的文件类型
 */
var UIUpload = Component.extend({
    name: 'ui.upload',
    template: tpl,
    config: function(data) {
        _.extend(data, {
            action: '',
            name: 'file',
            contentType: 'multipart/form-data',
            multiple: false,
            drag: false,
            accept: '*',
            data: {}
        });
        
        this.supr(data);
    },
    
    init: function(data) {
        this.supr(data);
    },
    
    fileDialogOpen: function() {
        this.$refs.file.click();
    },
    
    fileSelect: function() {
        var data = this.data,
            files = this.$refs.file.files,
            index = 0,
            len = files.length,
            file, options;
        
        options = this.setOptions(data);
        
        for (; index < len; index++) {
            file = files[index];
            new FileUnit({
                data: {
                    file: file,
                    options: options
                }
            }).$inject('#filelist');
        }
    },
    
    setOptions: function (data) {
        data = data || {};
        
        return {
            url: data.action,
            headers: {
                'content-type': 'application/json'
            }
        };
    }
});

module.exports = UIUpload;
