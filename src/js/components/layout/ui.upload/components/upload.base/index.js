/**
 *  ------------------------------
 *  upload.base 上传基础类
 *  ------------------------------
 */
'use strict';

var Component = require('../../../../../ui-base/component');
var _ = require('../../../../../ui-base/_');
// var FileUnit = require('../file.unit');
// var ImagePreview = require('../image.preview');
var Config = require('../../config');

/**
 * @class UploadList
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
 * @param {boolean}        [options.data.deletable]        => 可选，是否支持文件删除
 */
var UploadBase = Component.extend({
    name: 'upload.list',
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
            deletable: true,
            encType: 'multipart/form-data'
        });
        
        _.extend(data, {
            fileUnitList: [],
            fileDeletedList: [],
            fileUnitWidth: 50,
            fileUnitMargin: 25
        });
        
        this.supr(data);
    },
    
    init: function(data) {
        this.initUploadedFileUnits();
        this.supr(data);
    },

    initUploadedFileUnits: function() {
        var self = this,
            data = this.data;
        
        if (data.fileList.length > 0) {
            var fileList = data.fileList.splice(0);
            fileList.forEach(function(file) {
                file.deleted = false;
                var fileunit = self.createFileUnit({
                    file: file,
                    options: {},
                    deletable: data.deletable
                });

                data.fileUnitList.push({
                    inst: fileunit
                });
            });

            this.updateFileList();
        }
    },
    
    updateFileList: function() {
        var self = this,
            data = this.data,
            filesWrapper = data.filesWrapper,
            fileList = data.fileList,
            fileDeletedList = data.fileDeletedList,
            fileUnitList;

        fileUnitList = data.fileUnitList = data.fileUnitList.filter(function(item) {
            var inst = item.inst,
                deleted = inst.deleted,
                file = inst.file,
                destroyed = inst.destroyed;

            // item.inst = {};
            
            if (deleted) {
                fileDeletedList.push(file);
                return false;
            }
            return !destroyed;
        });

        filesWrapper.innerHTML = '';
        fileUnitList.forEach(function(item, index) {
            var wrapper = item.wrapper = self.createFileUnitWrapper(filesWrapper, index);
            item.inst.$inject(wrapper);
        });

        fileList.splice(0);
        fileUnitList.forEach(function(item) {
            var data = item.inst.data;

            fileList.push({
                name: data.file && data.file.name,
                url: data.file && data.file.url
            });
        });
        
        fileDeletedList.forEach(function(file) {
            fileList.push({
                name: file && file.name,
                url: file && file.url,
                deleted: file && file.deleted
            });
        });
    },
    
    fileDialogOpen: function() {
        this.$refs.file && this.$refs.file.click();
    },
    
    setOptions: function(data) {
        data = data || {};
        
        return {
            url: data.action
        };
    },

    preCheck: function(file) {
        var preCheckInfo = '';
        if (!this.isAcceptedFileSize(file)) {
            preCheckInfo = '文件过大';
        }
        if (!this.isAcceptedFileType(file)) {
            preCheckInfo = '格式错误';
        }
        return preCheckInfo;
    },
    
    isAcceptedFileType: function(file) {
        var data = this.data,
            accept = data.accept,
            type = this.getFileType(file).toLowerCase(),
            isValid = false;

        accept.split(',').forEach(function(cond) {
            if ('*' === cond) {
                isValid = true;
            } else if (/image\/.*/.test(cond)) {
                isValid = isValid || type === 'image';
            } else if (/audio\/.*/.test(cond)) {
                isValid = isValid || type === 'audio';
            } else if (/video\/.*/.test(cond)) {
                isValid = isValid || type === 'video';
            } else {
                isValid = isValid || type === Config.typeMap[cond];
            }
        });

        return isValid;
    },

    getFileType: function(file) {
        var type = file.type || '',
            name = file.name || '';

        if (/image\/.*/.test(type)
            || /jpg|gif|jpeg|png/i.test(name)
        ) {
            return 'IMAGE';
        } else if (/zip|rar|gz/i.test(name)) {
            return 'ZIP';
        } else if (/document|sheet|powerpoint|msword/.test(type)
                || /doc|xlsx|ppt/i.test(name)
        ) {
            return 'DOC';
        } else if (/video\/.*/.test(type)
                || /mp4|mkv|rmvb/i.test(name)
        ) {
            return 'VIDEO';
        } else if (/audio\/.*/.test(type)
                || /mp3/i.test(name)
        ) {
            return 'AUDIO';
        } else if (/text\/plain/.test(type)) {
            return 'TEXT';
        } else if (/text\/html/.test(type)) {
            return 'HTML';
        } else if (/application\/pdf/.test(type)) {
            return 'PDF';
        } else if (/application\/javascript/.test(type)) {
            return 'JS';
        }

        return 'UNKNOWN';
    },

    isAcceptedFileSize: function(file) {
        var data = this.data,
            maxSize = data.maxSize,
            fileSize = file.size;
        
        var patterns = maxSize.match(/(\d+)(\D+)?/i);
        var size = patterns[1];
        var unit = patterns[2];

        if (unit) {
            size *= Config.sizeMap[unit.toUpperCase()];
        }

        return size >= fileSize;
    }
});

module.exports = UploadBase;
