/**
 *  ------------------------------
 *  image preview
 *  ------------------------------
 */

'use strict';

var Component = require('../../../../../ui-base/component');
var _ = require('../../../../../ui-base/_');
var Modal = require('../../../../notice/modal');
var  tpl = require('./index.html');

var ImagePreview = Component.extend({
    name: 'image.preview',
    template: tpl.replace(/([>}])\s*([<{])/g, '$1$2'),
    config: function (data) {
        _.extend(data, {
            imgList: [],
            curIndex: 0,
            uploaded: true
        });

        _.extend(data, {
            opList: [
                {
                    name: 'zoomIn',
                    icon: 'zoomin',
                    fnName: 'zoomIn'
                },
                {
                    name: 'zoomOut',
                    icon: 'zoomout',
                    fnName: 'zoomOut'
                },
                {
                    name: 'rezoom',
                    icon: 'rezoom',
                    fnName: 'rezoom'
                },
                {
                    name: 'rotate',
                    icon: 'rotate_right',
                    fnName: 'rotate'
                },
                {
                    name: data.uploaded ? 'import' : 'delete',
                    icon: data.uploaded ? 'import' : 'delete',
                    fnName: data.uploaded ? 'onDownload' : 'onDel'
                }
            ]
        });

        this.supr(data);
    },
    init: function (data) {
        this.supr(data);
    },
    onClose: function() {
        this.destroy();    
    },
    onPrev: function() {
        var data = this.data,
            curIndex = data.curIndex,
            length = data.imgList.length,
            toIndex = length - 1;

        if (curIndex > 0) {
            toIndex = --data.curIndex;
        }
        
        this.setCurrentTo(toIndex);
    },
    onNext: function() {
        var data = this.data,
            curIndex = data.curIndex,
            length = data.imgList.length,
            toIndex = 0;

        if (curIndex < length - 1) {
            toIndex = ++data.curIndex;
        }
        
        this.setCurrentTo(toIndex);
    },
    setCurrentTo: function(toIndex) {
        var data = this.data,
            refs = this.$refs,
            imgList = data.imgList,
            curIndex = data.curIndex;
        
        refs['full-' + curIndex].style.opacity = 0;
        refs['full-' + toIndex].style.opacity = 1;
        
        this.data.curIndex = toIndex;
    },
    zoomIn: function() {
        
    },
    zoomOut: function() {

    },
    rezoom: function() {

    },
    rotate: function(index) {
        var data = this.data,
            img = this.$refs['full-img-' + index];

        img.rotate = img.rotate ? img.rotate + 90 : 90;
        img.style.transform = 'rotate(' + img.rotate + 'deg)';
    },
    onDel: function(index) {
        var self = this,
            data = this.data,
            imgList = data.imgList,
            img = imgList[index];

        var modal = new Modal({
            data: {
                content: '确认删除' + img.name + '?'
            }
        }).$on('ok', function() {
            imgList = data.imgList.splice(index, 1);

            if (!imgList[index]) {
                data.curIndex = 0;
            }
            self.$emit('delete', {
                name: img.name,
                index: index
            });
            self.$update();
        });
    },
    onDownload: function(index) {
        var self = this,
            data = this.data,
            imgList = data.imgList,
            img = imgList[index];

        var modal = new Modal({
            data: {
                content: '确认删除' + img.name + '?'
            }
        }).$on('ok', function() {
            imgList = data.imgList.splice(index, 1);

            if (!imgList[index]) {
                data.curIndex = 0;
            }
            self.$emit('delete', {
                name: img.name,
                index: index
            });
            self.$update();
        });
    }
});

module.exports = ImagePreview;
