/**
 *  ------------------------------
 *  ui.upload 上传
 *  ------------------------------
 */
'use strict';

var Component = require('../../../ui-base/component');
var _ = require('../../../ui-base/_');
var UploadList = require('./components/upload.list');
var UploadCard = require('./components/upload.card');
var Config = require('./config');
var tpl = require('./index.html');

/**
 * @class UIUpload
 * @extend Component
 * @param {object}         [options.data]                  = 绑定属性
 * @param {string}         [options.data.action]           => 必选，上传地址
 * @param {string}         [options.data.name]             => 可选，上传的文件字段名
 * @param {boolean}        [options.data.multiple]         => 可选，是否支持多选
 * @param {boolean}        [options.data.drag]             => 可选，是否支持拖拽上传
 * @param {string}         [options.data.accept]           => 可选，接受上传的文件类型
 * @param {string}         [options.data.listType]         => 可选，上传组件的展示形式
 * @param {number}         [options.data.numLimit]         => 可选，最大允许上传文件的个数
 * @param {number}         [options.data.numPerline]       => 可选，每行展示的文件个数
 * @param {number}         [options.data.maxSize]          => 可选，上传文件大小的最大允许值
 */
var UIUpload = Component.extend({
    name: 'ui.upload',
    template: tpl.replace(/([>}])\s*([<{])/g, '$1$2'),
    config: function(data) {
        _.extend(data, {
            action: '',
            name: 'file',
            multiple: false,
            drag: false,
            accept: '*',
            listType: 'list',
            fileList: [],
            data: {},
            numLimit: 10,
            numPerline: 5,
            maxSize: Config.sizeMap.GB,
            encType: 'multipart/form-data'
        });
        
        this.supr(data);
    },
    
    init: function(data) {
        this.preProcess(data);
        this.initUploadInst(data);
        this.supr(data);
    },
    
    preProcess: function(data) {
        if (typeof data.maxSize === 'number') {
            data.maxSize += '';
        }
    },

    initUploadInst: function(data) {
        var uploadNode = this.$refs['m-upload'],
            typeMap = {
                list: UploadList,
                card: UploadCard
            };
        
        new typeMap[data.listType]({
            data: data
        }).$inject(uploadNode);
    }
});

module.exports = UIUpload;
