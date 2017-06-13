/**
 *  ------------------------------
 *  ------------------------------
 */
'use strict';

var Dropdown = require('../../../../navigation/dropdown');
var _ = require('../../../../../ui-base/_');
var FileUnit = require('../file.unit');
var ImagePreview = require('../image.preview');
var tpl = require('./index.html');

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

var Upload = Dropdown.extend({
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
            fileListPadding: 22
        });
        
        this.supr(data);
    },
    
    init: function(data) {
        this.initData();
        this.supr(data);
    },

    initData: function() {
        var data = this.data,
            numPerline = data.numPerline,
            fileUnitWidth = data.fileUnitWidth,
            fileUnitMargin = data.fileUnitMargin;

        data.filesWrapper = this.$refs.fileswrapper;
        data.fileListWidth = fileUnitWidth * numPerline + fileUnitMargin * (numPerline - 1);
    },
    
    fileDialogOpen: function() {
        this.$refs.file.click();
    },
    
    fileSelect: function() {
        var self = this,
            data = this.data,
            inputNode = this.$refs.file,
            files = inputNode.files,
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
        
        inputNode.value = '';
        
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
                    name: img.data.name,
                    status: img.data.status
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
            url: data.action
        };
    },

    toggle: function (open, e) {
        e && e.stopPropagation();

        var data = this.data;
        var filesWrapper = this.$refs['fileswrapper'];
        
        this.setPosition(!open);

        this.supr(open);
    },

    setPosition: function(hidden) {
        var filesBanner = this.$refs['filesbanner'];
        var filesWrapper = this.$refs['fileswrapper'];
        if (hidden) {
            filesBanner.style.left = '-9999px';
            filesWrapper.style.left = '-9999px';
            return;
        }
        this.setVerticalPosition();
        this.setHorizontalPosition();
    },
    
    setVerticalPosition: function(style) {
        var filesEntry = this.$refs['filesentry'];
        var filesEntryCoors = filesEntry.getBoundingClientRect();
        var filesWrapper = this.$refs['fileswrapper'];
        var filesWrapperCoors = filesWrapper.getBoundingClientRect();
        var viewHeight = document.documentElement.clientHeight;
        var viewWidth = document.documentElement.clientWidth;
        
        // show at vertical bottom side
        var vertical = 'bottom';
        var isVerticalBottomSide = filesEntryCoors.bottom + filesWrapperCoors.height < viewHeight;
        // show at vertical top side
        var isVerticalTopSide = filesEntryCoors.top - filesWrapperCoors.height > 0;
        if (isVerticalTopSide) {
            vertical = 'top';
        }
        
        if (vertical === 'bottom') {
            filesWrapper.style.top = '53px';
            filesWrapper.style.bottom = 'auto';
            filesWrapper.style.boxShadow = 'auto';
            filesWrapper.style.boxShadow = '0 2px 3px 0 rgba(0,0,0,0.1)';
            this.data.isTopBanner = false;
        } else {
            this.data.isTopBanner = true;
            filesWrapper.style.top = 'auto';
            filesWrapper.style.bottom = '53px';
            filesWrapper.style.boxShadow = '0 -2px 3px 0 rgba(0,0,0,0.1)';
        }
    },
    
    setHorizontalPosition: function() {
        var filesEntry = this.$refs['filesentry'];
        var filesEntryCoors = filesEntry.getBoundingClientRect();
        var filesBanner = this.$refs['filesbanner'];
        var filesWrapper = this.$refs['fileswrapper'];
        var filesWrapperCoors = filesWrapper.getBoundingClientRect();
        var viewHeight = document.documentElement.clientHeight;
        var viewWidth = document.documentElement.clientWidth;
        
        // show at central
        var horizontal = 'left';
        var offsetWidth = filesWrapperCoors.width / 2 - filesEntryCoors.width / 2;
        var isHorizontalLeftEdge = filesEntryCoors.left - offsetWidth < 0;
        var isHorizontalRightEdge = filesEntryCoors.right + offsetWidth > viewWidth;
        if (isHorizontalRightEdge) {
            horizontal = 'right';
        }
        var isHorizontalCenter = !isHorizontalLeftEdge && !isHorizontalRightEdge;
        if (isHorizontalCenter) {
            horizontal = 'central';
        }
        
        if (horizontal === 'left') {
            filesWrapper.style.left = '0';
            filesWrapper.style.right = 'auto';
        } else if (horizontal === 'right') {
            filesWrapper.style.left = 'auto';
            filesWrapper.style.right = '0';
        } else if (horizontal === 'central') {
            filesWrapper.style.left = '-' + offsetWidth + 'px';
        }
        
        filesBanner.style.left = '20px';
    }
});

module.exports = Upload;
