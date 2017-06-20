/**
 *  ------------------------------
 *  upload.list 上传
 *  ------------------------------
 */
'use strict';

var Component = require('../../../../../ui-base/component');
var _ = require('../../../../../ui-base/_');
var FileUnit = require('../file.unit');
var ImagePreview = require('../image.preview');
var Config = require('../../config');
var tpl = require('./index.html');

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
 */
var UploadList = Component.extend({
    name: 'upload.list',
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
            fileList: [],
            fileUnitWidth: 50,
            fileUnitMargin: 25
        });
        
        this.supr(data);
    },
    
    init: function(data) {
        this.initData();
        this.supr(data);
    },

    initData: function() {
        this.initFilesWrapper();
        this.initUploadedFileUnits();
    },
    
    initFilesWrapper: function() {
        var inputWrapper = this.data.inputWrapper = this.$refs.inputwrapper;
        var filesWrapper = this.data.filesWrapper = this.$refs.fileswrapper;
        filesWrapper.appendChild(inputWrapper);
        inputWrapper.style.display = 'inline-block';
    },
    
    initUploadedFileUnits: function() {
        var self = this,
            data = this.data;
        
        if (data.fileList.length > 0) {
            var fileList = data.fileList.splice(0);
            fileList.forEach(function(file) {
                var fileunit = self.createFileUnit({
                    file: file,
                    options: {}
                });

                data.fileList.push({
                    inst: fileunit
                });
            });

            this.updateFileList();
        }
    },
    
    fileDialogOpen: function() {
        this.$refs.file.click();
    },
    
    fileSelect: function() {
        var data = this.data,
            inputNode = this.$refs.file,
            files = inputNode.files,
            index = 0,
            len = files.length,
            file, fileunit, options;

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
        
        fileunit.$on('delete', function() {
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
        
        this.appendInputWrapper();
        
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
    
    appendInputWrapper: function() {
        var data = this.data,
            inputWrapper = data.inputWrapper,
            filesWrapper = data.filesWrapper,
            numPerline = data.numPerline,
            numLimit = data.numLimit,
            fileUnitMargin = data.fileUnitMargin,
            length = data.fileList.length;

        if (length < numLimit) {
            filesWrapper.appendChild(inputWrapper);
            
            if (length % numPerline) {
                inputWrapper.style.marginLeft = fileUnitMargin + 'px';
            } else {
                inputWrapper.style.marginLeft = '0';
            }
        }
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

module.exports = UploadList;
