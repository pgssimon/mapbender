(function($) {

    $.widget("mapbender.mbLegend", {
        options: {
            title: 'Legende',
            autoOpen: true,
            target: null,
            noLegend: "No legend available",

            elementType: "dialog",
            displayType: "list",
            checkGraphic: false,
            
            hideEmptyLayers: true,
            generateLegendGraphicUrl: false,
            showSourceTitle: true,
            showLayerTitle: true,
            showGrouppedTitle: true,

            maxDialogWidth: $(window).width() - 100,
            maxDialogHeight: $(window).height() - 100,

            maxImgWidth: 0,
            maxImgHeight: 0            
        },
        model: null,
        layerTitle: "",
        sourceTitle: "",
        grouppedTitle: "",
        hiddeEmpty: "",

        _create: function() {
            if(!Mapbender.checkTarget("mbLegend", this.options.target)){
                return;
            }
            var self = this;
            Mapbender.elementRegistry.onElementReady(this.options.target, $.proxy(self._setup, self));
        },

        _setup: function() {
            var self = this;
            var me = $(this.element);
            
            this.model = $("#" + self.options.target).data("mbMap").getModel();
            
            this.layerTitle = this.options.showLayerTitle ? "" : "notshow";
            this.sourceTitle = this.options.showLayerTitle ? "" : "notshow";
            this.grouppedTitle = this.options.showGrouppedTitle ? "" : "notshow";
            this.hiddeEmpty = this.options.hideEmptyLayers ? "notshow" : "";
            
            if(this.options.elementType === "dialog") {
                this.element.dialog({
                    width: 500,
                    autoOpen: false,
                    heightStyle: "content",
                    title: self.options.title
                });
            }
            if(this.options.autoOpen){
                this.open();
            }
            $(document).bind('mbmapsourceloadstart', $.proxy(self._onSourceLoadStart, self));
            $(document).bind('mbmapsourceloadend', $.proxy(self._onSourceLoadEnd, self));
            $(document).bind('mbmapsourceloaderror', $.proxy(self._onSourceLoadError, self));
            $(document).bind('mbmapsourceadded', $.proxy(self._onSourceAdded, self));
            $(document).bind('mbmapsourcechanged', $.proxy(self._onSourceChanged, self));
            $(document).bind('mbmapsourceremoved', $.proxy(self._onSourceRemoved, self));
            $(document).bind('mbmapsourcemoved', $.proxy(self._onSourceMoved, self));
        },
    
        _onSourceAdded: function(event, added){
            var self = this;
            var hasChildren = false;
            for(layer in added.children){
                hasChildren = true;
                alert("legende layer added");
            }
            if(!hasChildren){
                var sources = this._getSource(added.source, added.source.configuration.children[0], 1);
                if(this.options.checkGraphic){
                    this._createCheckedLegendHtml([sources], 0, 0, "", "", $.proxy(self._addSource, self), added);
                } else {
                    this._addSource(this._createLayerHtml(sources, ""), added);
                }
            }
        },
        
        _addSource: function(html, added){
            var hasChildren = false;
            for(layer in added.children){
                hasChildren = true;
                alert("legende layer added");
            }
            if(!hasChildren){
                if(added.after && added.after.source){
                    $(this.element).find('[data-sourceid="'+added.after.source.id+'"]:last').after($(html));
                } else if(added.before && added.before.source){
                    $(this.element).find('[data-sourceid="'+added.before.source.id+'"]:first').before($(html));
                } else {
                    $(this.element).find('ul').append($(html));
                }
            }
        },
        
        _onSourceMoved: function(event, moved){
            if(moved.layerId){
                if(moved.before){
                    $(this.element).find('[data-id="'+moved.before.layerId+'"]:first').before($(this.element).find('[data-id="'+moved.layerId+'"]'));
                } else if(moved.after){
                    $(this.element).find('[data-id="'+moved.after.layerId+'"]:last').after($(this.element).find('[data-id="'+moved.layerId+'"]'));
                }
            } else {
                if(moved.before){
                    $(this.element).find('[data-id="'+moved.before.layerId+'"]:first').before($(this.element).find('[data-sourceid="'+moved.source.id+'"]'));
                } else if(moved.after){
                    $(this.element).find('[data-id="'+moved.after.layerId+'"]:last').after($(this.element).find('[data-sourceid="'+moved.source.id+'"]'));
                }
            }
        },
        
        _onSourceChanged: function(event, changed){
            //            window.console && console.log("mbLayertree._onSourceChanged:", changed);
            for(key in changed.children){
                var changedEl = changed.children[key];
                if(changedEl.treeElm.state.visibility){
                    $(this.element).find('li[data-id="'+key+'"]').removeClass("notvisible");
                } else {
                    $(this.element).find('li[data-id="'+key+'"]').addClass("notvisible");
//                    if($(this.element).find('li[data-id="'+key+'"] input[name="selected"]:first').is(':checked')){
//                        $(this.element).find('li[data-id="'+key+'"] span.state:first').addClass("invisible").attr({
//                            title: changedEl.state.outOfScale ? "outOfScale" : "parent invisible"
//                        });
//                    } else {
//                        $(this.element).find('li[data-id="'+key+'"] span.state:first').removeClass("invisible").attr({
//                            title: ""
//                        });
//                    }
                }
            }
        },
        
        _onSourceRemoved: function(event, removed){
            var hasLayers = false;
            for(layerid in removed.children){
                hasLayers = true;
                $(this.element).find('li[data-id="'+layerid+'"]').remove();
            }
            if(!hasLayers){
                $(this.element).find('[data-sourceid="'+removed.source.id+'"]').remove();
//                $(this.element).find('ul[data-sourceid="'+removed.source.id+'"]').remove();
            }
        },
        
        _onSourceLoadStart: function(event, option){
            //            window.console && console.log("mbLayertree._onSourceLoadStart:", event);
//            var source = option.source;
//                var source_li = $(this.element).find('li[data-sourceid="'+source.id+'"]');
//                if(source_li.find('input[name="selected"]:first').is(':checked')
//                    && !source_li.find('span.state:first').hasClass('invisible')){
//                    source_li.find('span.spinner:first').addClass('loading');
//                    source_li.find('li').each(function(idx, el){
//                        var li_el = $(el);
//                        if(li_el.find('input[name="selected"]:first').is(':checked')
//                            && !li_el.find('span.state:first').hasClass('invisible')){
//                            li_el.find('span.spinner:first').addClass('loading');
//                        }
//                    });
//                }
        },
        
        _onSourceLoadEnd: function(event, option){
            //            window.console && console.log("mbLayertree._onSourceLoadEnd:", event);
//            var source = option.source;
//            if(this.options.displaytype === "tree"){
//                var source_li = $(this.element).find('li[data-sourceid="'+source.id+'"]');
//                if(source_li.find('span.spinner:first').hasClass('loading')){
//                    source_li.find('span.spinner').removeClass('loading ');
//                    
//                }
//            } else if(this.options.displaytype === "list"){
//                $(this.element).find('li[data-sourceid="'+source.id+'"] span.spinner').removeClass('loading');
//            }
        },
        _onSourceLoadError: function(event, option){
            //            window.console && console.log("mbLayertree._onSourceLoadError:", event);
            $(this.element).find('ul[data-sourceid="'+option.source.id+'"] li').addClass('notvisible');
        },

        _checkMaxImgWidth: function(val){
            if(this.options.maxImgWidth < val)
                this.options.maxImgWidth = val;
        },

        _checkMaxImgHeight: function(val){
            if(this.options.maxImgHeight < val)
                this.options.maxImgHeight = val;
        },
    
        _getSources: function() {
            var allLayers = [];
            var sources = this.model.getSources();
            for(var i = (sources.length - 1); i > -1; i--){
                allLayers.push(this._getSource(sources[i], sources[i].configuration.children[0], 1));
            }
            return allLayers;
        },

        _getSource: function(source, layer, level) {
            return {
                sourceId: source.id,
                id: layer.options.id,
                visible: layer.state.visibility ? '' : 'notvisible',
                title: layer.options.title, 
                level: level,
                children: this._getSublayers(source, layer, level + 1, [])
            };
        },

        _getSublayers: function(source, layer, level, children){
            var self = this;
            for(var i = (layer.children.length - 1); i > -1; i--){
                children = children.concat(self._getSublayer(source, layer.children[i], "wms", level, []));
            }
            return children;
        },

        _getSublayer: function(source, sublayer, type, level, children){
            var sublayerLeg = {
                sourceId: source.id,
                id: sublayer.options.id,
                visible: sublayer.state.visibility ? '' : ' notvisible',
                title: sublayer.options.title,
                level: level,
                isNode: sublayer.children && sublayer.children.length > 0 ? true : false
            };
            if(sublayer.options.legend){
                sublayerLeg["legend"] = sublayer.options.legend;
                if(!sublayerLeg.legend.url && this.options.generateLegendGraphicUrl && sublayerLeg.legend.graphic){
                    sublayerLeg.legend.url = sublayerLeg.legend.graphic;
                }
                
            }
            if(!sublayerLeg.isNode)
                children.push(sublayerLeg);
            if(sublayer.children){
                for(var i = (sublayer.children.length -1); i > -1; i--){
                    children = children.concat(this._getSublayer(source, sublayer.children[i], type, level, []));//children
                }
            }
            return children;
        },
        
        _createSourceTitleLine: function(layer){
            return '<li class="ebene'+layer.level+' '+this.sourceTitle+' title" data-sourceid="'+layer.sourceId+'" data-id="'+layer.id+'">'+layer.title+'</li>';
        },
        
        _createNodeTitleLine: function(layer){
            return '<li class="ebene'+layer.level+' '+layer.visible+' '+this.grouppedTitle+' title" data-id="'+layer.id+'">'+layer.title+'</li>';
        },
        
        _createTitleLine: function(layer, hide){
            return '<li class="ebene'+layer.level+' '+layer.visible+' '+(hide?this.hiddeEmpty:'')+' title" data-id="'+layer.id+'">'+layer.title+'</li>';
        },
        
        _createImageLine: function(layer){
            return '<li class="ebene'+layer.level+' '+layer.visible+' image" data-id="'+layer.id+'"><img src="' + layer.legend.url + '"></img></li>';
        },
        
        _createTextLine: function(layer, hide){
            return '<li class="ebene'+layer.level+' '+layer.visible+' '+(hide?this.hiddeEmpty:'')+' text" data-id="'+layer.id+'">' + this.options.noLegend + '</li>';
        },
        
        _createLegendHtml: function(sources){
            var html = "";
            for(var i = 0; i < sources.length; i++){
                html += this._createLayerHtml(sources[i], "");
            }
            return html;
        },
        
        _createLayerHtml: function(layer, html){
            if(layer.children){
                html += this._createSourceTitleLine(layer);
                html += '<ul class="ebene' + layer.level + '" data-sourceid="'+layer.sourceId+'" data-id="'+layer.id+'">';
                for(var i = 0; i < layer.children.length; i++){
                    html += this._createLayerHtml(layer.children[i], "");
                }
                html += '</ul>';
            } else {
                if(layer.isNode){
                    html += this._createNodeTitleLine(layer);
                }else{
                    if(layer.legend && layer.legend.url){
                        html += this._createTitleLine(layer, false);
                        html += this._createImageLine(layer, false);
                    } else {
                        html += this._createTitleLine(layer, true);
                        html += this._createTextLine(layer, true);
                    }
                }
            }
            return html;
        },

        _createCheckedLegendHtml: function(layers, layidx, sublayidx, html, reshtml, callback, added) {
            var self = this;
            if(layers.length > layidx){
                var layer = layers[layidx];
                if(layers[layidx].children.length > sublayidx){
                    if(layers[layidx].children[sublayidx].legend){
                        $(self.element).find("#imgtest").html('<img id="testload" style="display: none;" src="' + layers[layidx].children[sublayidx].legend.url + '"></img>');
                        $(self.element).find("#imgtest #testload").load(function() {
                            //                            var width = this.width, height = this.height; +' '
                            self._checkMaxImgWidth(self.width);
                            self._checkMaxImgHeight(self.height);
                            //                        window.console && console.log( sublayer.legend.url);
                            if(layers[layidx].children[sublayidx].isNode){
                                html += self._createNodeTitleLine(layers[layidx].children[sublayidx]);
                            } else {
                                html += self._createTitleLine(layers[layidx].children[sublayidx], false);
                                html += self._createImageLine(layers[layidx].children[sublayidx]);
                            }
                            self._createCheckedLegendHtml(layers, layidx, ++sublayidx, html, reshtml, callback, added);
                        }).error(function() {
                            if(layers[layidx].children[sublayidx].isNode){
                                html += self._createNodeTitleLine(layers[layidx].children[sublayidx]);
                            } else {
                                html += self._createTitleLine(layers[layidx].children[sublayidx], true);
                                html += self._createImageLine(layers[layidx].children[sublayidx], true);
                            }
                            self._createCheckedLegendHtml(layers, layidx, ++sublayidx, html, reshtml, callback, added);
                        });
                    } else {
                        if(layers[layidx].children[sublayidx].isNode){
                            html += self._createNodeTitleLine(layers[layidx].children[sublayidx]);
                        } else {
                            html += self._createTitleLine(layers[layidx].children[sublayidx], true);
                            html += self._createImageLine(layers[layidx].children[sublayidx], true);
                        }
                        self._createCheckedLegendHtml(layers, layidx, ++sublayidx, html, reshtml, callback, added);
                    }
                } else {
                    var html_ = '';
                    html_ += _createSourceTitleLine(layer);
                    html_ += '<ul class="ebene' + layer.level + '" data-sourceid="'+layer.sourceId+'" data-id="'+layer.id+'">';
                    html_+=  html;
                    html_+=  '</ul>';
                    reshtml += html_;
                    self._createCheckedLegendHtml(layers, ++layidx, 0, "", reshtml, callback, added);
                }
            } else {
                if(added)
                    callback(reshtml, added);
                else
                    callback(reshtml);
            }
        },
        
        _createLegend: function(html){
            var self = this;
            $(self.element).find("#imgtest").html("");
            $(this.element).find('#legends:eq(0)').html('<ul>' + html + '</ul>');
            if(this.options.elementType === "dialog") {
                this.element.dialog("option", "maxHeight", self.options.maxDialogHeight + "px");
                this.element.dialog("option", "maxWidth", self.options.maxDialogWidth);
                this.element.dialog("option", "minWidth", self.options.maxImgWidth != 0 ? self.maxImgWidth + 100 : 300);
                this.element.dialog("option", "width", self.options.maxImgWidth != 0 ? self.maxImgWidth + 200 : 300);
                this.element.dialog('open');
                $(this.element).css({
                    "max-height": (this.options.maxDialogHeight - 50) +"px"
                });
            }
            if(this.options.displayType === 'accordion'){
                $(this.element).find('ul.ebene1').each(function(){
                    $(this).accordion({
                        header: "li.title",
                        autoHeight: false, 
                        collapsible: true, 
                        active: false
                    });
                });
                $(this.element).find('.layerlegends').each(function(){
                    $(this).accordion({
                        autoHeight: false, 
                        collapsible: true, 
                        active: false
                    });
                });
            }
        },

        open: function() {
            var self = this;
            var sources = this._getSources();
            if(this.options.checkGraphic){
                this._createCheckedLegendHtml(sources, 0, 0, "", "", $.proxy(self._createLegend, self));
            } else {
                this._createLegend(this._createLegendHtml(sources));
            }
        },
    
        close: function() {
            this.element.dialog('close');
        }

    });

})(jQuery);
