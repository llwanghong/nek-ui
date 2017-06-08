/**
 *  ------------------------------
 *  image preview
 *  ------------------------------
 */

'use strict';

var Component = require('../../../../../ui-base/component');
var _ = require('../../../../../ui-base/_');
var  tpl = require('./index.html');

var ImagePreview = Component.extend({
    name: 'image.preview',
    template: tpl.replace(/([>}])\s*([<{])/g, '$1$2'),
    config: function (data) {
        _.extend(data, {
            imgList: [],
            curIndex: 0
        });

        _.extend(data, {
            opList: [
                {
                    name: 'zoomIn',
                    icon: 'zoomin'
                },
                {
                    name: 'zoomOut',
                    icon: 'zoomout'
                },
                {
                    name: 'rezoom',
                    icon: 'rezoom'
                },
                {
                    name: 'rotate',
                    icon: 'rotate_right'
                },
                {
                    name: 'delete',
                    icon: 'delete'
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
    }
});

module.exports = ImagePreview;
