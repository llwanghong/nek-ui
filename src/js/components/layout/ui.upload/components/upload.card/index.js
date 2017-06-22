/**
 *  ------------------------------
 *  upload.card 上传
 *  ------------------------------
 */
'use strict';

var _ = require('../../../../../ui-base/_');
var FileUnit = require('../file.unit');
var UploadBase = require('../upload.base');
var ImagePreview = require('../image.preview');
var Config = require('../../config');
var tpl = require('./index.html');

/**
 * @class UploadCard
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
 * @param {string}         [options.data.maxSize]          => 可选，上传文件大小的最大允许值
 */

var UploadCard = UploadBase.extend({
    name: 'upload.card',
    template: tpl.replace(/([>}])\s*([<{])/g, '$1$2'),
    config: function(data) {
        _.extend(data, {
            action: '',
            name: 'file',
            multiple: false,
            drag: false,
            accept: '*',
            listType: 'list',
            data: {},
            numLimit: 10,
            numPerline: 5,
            maxSize: Config.sizeMap.GB,
            encType: 'multipart/form-data'
        });

        _.extend(data, {
            status: 'uploaded',
            info: '',
            fileList: [],
            fileUnitWidth: 50,
            fileUnitMargin: 25,
            fileListPadding: 22
        });
        
        this.supr(data);
    },
    
    init: function(data) {
        this.initFilesZone();
        this.supr(data);
    },

    initFilesZone: function() {
        var data = this.data,
            numPerline = data.numPerline,
            fileUnitWidth = data.fileUnitWidth,
            fileUnitMargin = data.fileUnitMargin;

        data.filesWrapper = this.$refs.fileswrapper;
        data.fileListWidth = fileUnitWidth * numPerline + fileUnitMargin * (numPerline - 1);
    },

    onDragEnter: function(e) {
        e.stopPropagation();
        e.preventDefault();
    },
    
    onDragOver: function(e) {
        e.stopPropagation();
        e.preventDefault();
    },
    
    onDrop: function(e) {
        e.stopPropagation();
        e.preventDefault();
    
        var dt = e.event && e.event.dataTransfer;
        var files = dt.files;
        
        return files;
    },

    fileSelect: function() {
        var data = this.data,
            inputNode = this.$refs.file,
            files = inputNode.files,
            index = 0,
            len = files.length,
            file, fileunit, options;
        
        this.toggle(false);

        options = this.setOptions(data);
        
        data.preCheckInfo = '';

        for (; index < len; index++) {
            if (data.fileList.length < data.numLimit) {
                file = files[index];
                data.preCheckInfo = this.preCheck(file);
                if (data.preCheckInfo) {
                    continue;
                }
                fileunit = this.createFileUnit({
                    file: file,
                    options: options
                });
                data.fileList.push({
                    inst: fileunit
                });
                this.updateFilesZone();
            }
        }
        
        inputNode.value = '';
        
        this.updateFileList();
    },
    
    updateFilesZone: function() {
        var data = this.data,
            filesZone = this.$refs.fileszone,
            entryWrapper = this.$refs.entrywrapper,
            inputWrapper = this.$refs.inputwrapper;
        
        if (data.fileList.length < data.numLimit) {
            filesZone.style.width = '125px';
            entryWrapper.style['margin-right'] = '20px';
            inputWrapper.style.display = 'inline-block';
        } else if (data.fileList.length == data.numLimit) {
            filesZone.style.width = '50px';
            entryWrapper.style['margin-right'] = '0';
            inputWrapper.style.display = 'none';
        }
    },
    
    createFileUnit: function(data) {
        var self = this,
            imagePreview = this.$refs.imagepreview,
            fileunit = new FileUnit({ data: data });
        
        fileunit.$on('preview', previewCb);
        
        function previewCb() {
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
        }

        function createImagePreview(imgFileList) {
            function findHelper(img) {
                return img.current;
            }
            var curIndex = imgFileList.findIndex(findHelper);
            
            function mapHelper(img) {
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
        
        fileunit.$on('progress', progressCb);
        
        function progressCb(info) {
            var data = self.data,
                curInst = this,
                curIndex = -1,
                lastIndex = -1;

            self.data.fileList.forEach(function(item, index) {
                if (item.inst.data.status === 'uploading') {
                    lastIndex = index;
                }
                if (item.inst === curInst) {
                    curIndex = index;
                }
            });
            
            if (curIndex >= lastIndex && data.status != 'failed') {
                data.status = 'uploading';
                data.progress = info.progress;
                self.$update();
            }
        }

        fileunit.$on('success', successCb);
        
        function successCb() {
            var allUploaded = true;
            self.data.fileList.forEach(function(item) {
                allUploaded &= item.inst.data.status === 'uploaded';
            });
            if (allUploaded) {
                self.data.status = 'uploaded';
                self.$update();
            }
        }

        fileunit.$on('error', function() {
            self.data.status = 'failed';
            self.data.info = '上传失败';
            self.$update();
        });
        
        fileunit.$on('delete', function() {
            this.destroy();
            self.updateFileList();
        });
        
        fileunit.$on('$destroy', function() {
            self.toggle(false);
            this.destroyed = true;
            this.$off('preview', previewCb);
            this.$off('success', successCb);
            self.updateFileList();
            self.updateFilesZone();
            resetStatus();
        });

        function resetStatus() {
            successCb();
        }
        
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
    
    uploadFiles: function() {
        var data = this.data,
            fileList = data.fileList;
        
        data.status = 'uploaded';
        data.info = '';
        
        fileList.forEach(function(item) {
            var inst = item.inst,
                data = inst.data;
            
            if (data.status === 'failed') {
                inst.uploadFile(data.file);
            }
        });
    },

    toggle: function(open, e) {
        e && e.stopPropagation();
        
        var data = this.data;
        if (typeof open === 'undefined') {
            open = !data.open;
        }
        data.open = open;

        this.setPosition(!open);

        var index = UploadCard.opens.indexOf(this);
        if (open && index < 0) {
            UploadCard.opens.push(this);
        } else if (!open && index >= 0) {
            UploadCard.opens.splice(index, 1);
        }
    },

    setPosition: function(hidden) {
        var filesBanner = this.$refs.filesbanner;
        var filesWrapper = this.$refs.fileswrapper;
        if (hidden) {
            filesBanner.style.left = '-9999px';
            filesWrapper.style.left = '-9999px';
            return;
        }
        this.setVerticalPosition();
        this.setHorizontalPosition();
    },
    
    setVerticalPosition: function() {
        var filesEntry = this.$refs.filesentry;
        var filesEntryCoors = filesEntry.getBoundingClientRect();
        var filesWrapper = this.$refs.fileswrapper;
        var filesWrapperCoors = filesWrapper.getBoundingClientRect();
        var viewHeight = document.documentElement.clientHeight;

        // show at vertical bottom side
        var vertical = 'bottom';
        // show at vertical top side
        var isVerticalTopSide = filesEntryCoors.top - filesWrapperCoors.height > 0;
        var isVerticalBottomSide = filesEntryCoors.bottom + filesWrapperCoors.height < viewHeight;
        if (isVerticalTopSide && !isVerticalBottomSide) {
            vertical = 'top';
        }
        
        if (vertical === 'bottom') {
            this.data.isTopBanner = false;
            filesWrapper.style.top = '53px';
            filesWrapper.style.bottom = 'auto';
            filesWrapper.style.boxShadow = 'auto';
            filesWrapper.style.boxShadow = '0 2px 3px 0 rgba(0,0,0,0.1)';
        } else {
            this.data.isTopBanner = true;
            filesWrapper.style.top = 'auto';
            filesWrapper.style.bottom = '53px';
            filesWrapper.style.boxShadow = '0 -2px 3px 0 rgba(0,0,0,0.1)';
        }
    },
    
    setHorizontalPosition: function() {
        var filesEntry = this.$refs.filesentry;
        var filesEntryCoors = filesEntry.getBoundingClientRect();
        var filesBanner = this.$refs.filesbanner;
        var filesWrapper = this.$refs.fileswrapper;
        var filesWrapperCoors = filesWrapper.getBoundingClientRect();
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

var opens = UploadCard.opens = [];
document.addEventListener('click', function(e) {
    for (var len = opens.length, i = len - 1; i >= 0; i--) {
        var close = true;

        var upload = opens[i];
        var uploadElement = upload.$refs.element;
        var iterator = e.target;

        while (iterator) {
            if(uploadElement == iterator) {
                close = false;
                break;
            }
            iterator = iterator.parentElement;
        }

        if (close) {
            upload.toggle(false, e);
            upload.$update();
        }
    }
}, false);

module.exports = UploadCard;
