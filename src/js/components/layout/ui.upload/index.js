/**
 *  ------------------------------
 *  ui.upload 上传
 *  ------------------------------
 */
'use strict';

var  Component = require('../../../ui-base/component');
var  _ = require('../../../ui-base/_');
var  UploadList = require('./components/upload.list');
var  Upload = require('./components/upload.hover');
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
    template: tpl.replace(/([>}])\s*([<{])/g, '$1$2'),
    config: function(data) {
        _.extend(data, {
            action: '',
            encType: 'multipart/form-data',
            multiple: false,
            drag: false,
            accept: '*',
            listType: 'list',
            data: {},
            numLimit: 10,
            numPerline: 3,
            maxSize: 1000000
        });
        
        this.supr(data);
    },
    
    init: function(data) {
        this.initData(data);
        this.supr(data);
    },

    initData: function(data) {
        var upload = this.$refs['m-upload'];
        if (data.listType === 'list') {
            new UploadList({
                data: data
            }).$inject(upload);
        } else if (data.listType === 'hover') {
            new Upload({
                data: data
            }).$inject(upload);
        }
    }
});

module.exports = UIUpload;
