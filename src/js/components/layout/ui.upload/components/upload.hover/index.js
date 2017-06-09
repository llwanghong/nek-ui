/**
 *  ------------------------------
 *  ------------------------------
 */
'use strict';

var  Component = require('../../../../../ui-base/component');
var  _ = require('../../../../../ui-base/_');
var  FileUnit = require('../file.unit');
var  ImagePreview = require('../image.preview');
var  tpl = require('./index.html');

/**
 * @class Upload
 * @extend Component
 * @param {object}         [options.data]                  = 绑定属性
 * @param {string}         [options.data.action]           => 必选，上传地址
 * @param {string}         [options.data.name]             => 可选，上传的文件字段名
 * @param {boolean}        [options.data.multiple]         => 可选，是否支持多选
 * @param {boolean}        [options.data.drag]             => 可选，是否支持拖拽上传
 * @param {string}         [options.data.accept]           => 可选，接受上传的文件类型
 */
var Upload = Component.extend({
    name: 'upload',
    template: tpl.replace(/([>}])\s*([<{])/g, '$1$2'),
    config: function(data) {
        _.extend(data, {
            action: '',
            name: 'file',
            contentType: 'multipart/form-data',
            multiple: false,
            drag: false,
            accept: '*',
            data: {},
            numLimit: 10,
            numPerline: 3
        });
        
        _.extend(data, {
            fileList: [],
            fileUnitWidth: 50,
            fileUnitMargin: 25,
        });
        
        this.supr(data);
    },
    
    init: function(data) {
        this.initData();
        this.supr(data);
    },

    initData: function() {
        var filesWrapper = this.data.filesWrapper = this.$refs.fileswrapper;
    },
    
    fileDialogOpen: function() {
        this.$refs.file.click();
    },
    
    fileSelect: function() {
        var self = this,
            data = this.data,
            files = this.$refs.file.files,
            index = 0,
            len = files.length,
            file, fileunit, options;
        
        options = this.setOptions(data);
        
        for (; index < len; index++) {
            if (data.fileList.length < data.numLimit) {
                file = files[index];
                fileunit = this.createFileUnit({
                    file: file,
                    options: options
                });
                data.fileList.push({
                    inst: fileunit
                });
            }
        }
        
        this.updateFileList();
    },
    
    createFileUnit: function(data) {
        var self = this,
            imagePreview = this.$refs.imagepreview,
            fileunit = new FileUnit({ data: data });
        
        fileunit.$on('preview', function() {
            var current = this;
            
            function filterImgFile(file) {
                return file.inst.data.type === 'IMAGE';
            }
            
            function mapHelper(img) {
                if (current === img.inst) {
                    img.inst.current = true;
                }
                return img.inst;
            }
            
            var imgList = self.data.fileList.filter(filterImgFile).map(mapHelper);
            
            var preview = createImagePreview(imgList);
            
            preview.$inject(imagePreview);
        });
        
        function createImagePreview(imgFileList) {
            function findHelper(img, index) {
                return img.current;
            }
            var curIndex = imgFileList.findIndex(findHelper);
            
            function mapHelper(img, index) {
                delete img.current;
                return {
                    src: img.data.src,
                    name: img.data.name
                };
            }
            var imgList = imgFileList.map(mapHelper);
            
            var imagePreview = new ImagePreview({
                data: {
                    imgList: imgList,
                    curIndex: curIndex
                }
            });

            imagePreview.$on('delete', function(imgInfo) {
                var index = imgInfo.index,
                    imgInst = imgFileList[index];

                if (imgInst) {
                    imgInst.destroy();
                }
            });
            
            imagePreview.$on('$destroy', function() {
                imgFileList = null;
            });
            
            return imagePreview;
        }
        
        fileunit.$on('delete', function () {
            this.destroy();
            self.updateFileList();
        });
        
        fileunit.$on('$destroy', function() {
            this.destroyed = true;
            self.updateFileList();
        });
        
        return fileunit;
    },

    updateFileList: function() {
        var self = this,
            data = this.data,
            filesWrapper = data.filesWrapper,
            fileList;
       
        fileList = data.fileList = data.fileList.filter(function(item) {
            return !item.inst.destroyed;
        });
        
        filesWrapper.innerHTML = '';
        fileList.forEach(function(item, index) {
            var wrapper = item.wrapper = self.createFileUnitWrapper(filesWrapper, index);
            item.inst.$inject(wrapper);
        });
        
        this.$update();
    },
    
    createFileUnitWrapper: function(parent, index) {
        var wrapper = document.createElement('li');
        
        parent.appendChild(wrapper);
        
        this.setFileUnitWrapperStyle(wrapper, index);
        
        return wrapper;
    },
    
    setFileUnitWrapperStyle: function(wrapper, index) {
        var data = this.data,
            numPerline = data.numPerline,
            fileUnitWidth = data.fileUnitWidth,
            fileUnitMargin = data.fileUnitMargin;
        
        wrapper.className = 'u-fileitem';
        wrapper.style.display = 'inline-block';
        wrapper.style.width = fileUnitWidth + 'px';
        
        if (index && index % numPerline) {
            wrapper.style.marginLeft = fileUnitMargin + 'px';
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

module.exports = Upload;
