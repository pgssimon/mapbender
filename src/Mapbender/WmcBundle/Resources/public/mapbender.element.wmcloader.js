(function($){
    $.widget("mapbender.mbWmcLoader", {
        options: {},
        elementUrl: null,
        popup: null,
        _create: function(){
            if(!Mapbender.checkTarget("mbWmcLoader", this.options.target)){
                return;
            }
            var self = this;
            Mapbender.elementRegistry.onElementReady(this.options.target, $.proxy(self._setup, self));
        },
        /**
         * Initializes the wmc handler
         */
        _setup: function(){
            this.elementUrl = Mapbender.configuration.application.urls.element + '/' + this.element.attr('id') + '/';
            if(typeof this.options.load !== 'undefined'
                    && typeof this.options.load.wmc !== 'undefined'){
                var wmc_id = this.options.load.wmc;
                var map = $('#' + this.options.target).data('mapbenderMbMap');
                var wmcHandlier = new Mapbender.WmcHandler(map);
                wmcHandlier.loadFromId(this.elementUrl + 'load', wmc_id);
            }
            this._trigger('ready');
            this._ready();
        },
        /**
         * Default action for mapbender element
         */
        defaultAction: function(callback){
            this.open(callback);
        },
        /**
         * closes a dialog
         */
        close: function(){
            if(this.popup){
                this.element.hide().appendTo($('body'));
                if(this.popup.$element){
                    this.popup.destroy();
                }
                this.popup = null;
            }
            this.callback ? this.callback.call() : this.callback = null;
        },
        /**
         * opens a dialog
         */
        open: function(callback){
            this.callback = callback ? callback : null;
            var self = this;
            if(!this.popup || !this.popup.$element){
                this.popup = new Mapbender.Popup2({
                    title: self.element.attr('title'),
                    modal: false,
                    closeButton: true,
                    content: [$.ajax({
                            url: self.elementUrl + 'list',
                            complete: function(data){
                                $('.loadWmc', self.popup.$element).on("click", $.proxy(self._loadFromId, self));
                                $('.loadXmlWmc', self.popup.$element).on("click", $.proxy(self._loadForm, self));
                            }})],
                    destroyOnClose: true,
                    width: 400,
                    buttons: {
                        'cancel': {
                            label: 'Cancel',
                            cssClass: 'button buttonCancel critical right',
                            callback: function(){
                                self.close();
                            }
                        },
                        'ok': {
                            label: 'Load',
                            cssClass: 'button buttonYes right',
                            callback: function(){
                                $("#wmc-load", self.popup.$element).submit();
                                return false;
                            }
                        },
                        'back': {
                            label: 'Back',
                            cssClass: 'button left buttonBack',
                            callback: function(){
                                $(".popupSubContent").remove();
                                $(".popupSubTitle").text("");
                                $(".popup").find(".buttonYes, .buttonBack").hide();
                                $(".popupContent").show();
                            }
                        }
                    }
                });
                $(".popup").find(".buttonYes, .buttonBack").hide();
            }else{
                this.popup.open($.ajax({url: self.elementUrl + 'list'}));
            }
        },
        /**
         * Loads a wmc list
         */
        _loadList: function(){
            var self = this;
            $.ajax({
                url: self.elementUrl + "list",
                type: "POST",
                success: function(data){
                    $("#popupContent").html(data);
                    var popup = $("#popup");
                    $(".loadWmc").on("click", $.proxy(self._loadFromId, self));
                    $(".loadXmlWmc").on("click", $.proxy(self._loadForm, self));
                }
            });
        },
        /**
         * Loads a form to load a wmc
         */
        _loadForm: function(e){
            if(this.popup && this.popup.$element){
                var self = this;
                var url = $(e.target).attr("href");
                if(url){
                    $.ajax({
                        url: url,
                        type: "GET",
                        complete: function(data){
                            if(data != undefined){
                                var pop = $(".popup", self.popup.$element);
                                var popupContent = $(".popupContent", self.popup.$element);
                                var contentWrapper = pop.find(".contentWrapper");

                                if(contentWrapper.get(0) == undefined){
                                    popupContent.wrap('<div class="contentWrapper"></div>');
                                    contentWrapper = pop.find(".contentWrapper");
                                }
                                popupContent.hide();
                                var subContent = contentWrapper.find(".popupSubContent");

                                if(subContent.get(0) == undefined){
                                    contentWrapper.append('<div class="popupSubContent"></div>');
                                    subContent = contentWrapper.find('.popupSubContent');
                                }
                                subContent.html(data.responseText);

                                var subTitle = subContent.find("form").attr('title');
                                $(".popupSubTitle").text(" - " + subTitle);
                                $(".popup").find(".buttonYes, .buttonBack").show();
                                self._ajaxForm();
                            }
                        }
                    });
                }
            }
            return false;
        },
        /**
         * ajaxform for load a wmc
         */
        _ajaxForm: function(){
            if(this.popup && this.popup.$element){
                var self = this;
                $('form#wmc-load', this.popup.$element).ajaxForm({
                    url: self.elementUrl + 'loadxml',
                    type: 'POST',
                    beforeSerialize: function(e){
                        var map = $('#' + self.options.target).data('mapbenderMbMap')
                        var state = map.getMapState();
                        $('input#wmc_state_json',self.popup.$element).val(JSON.stringify(state));
                    },
                    contentType: 'json',
                    context: self,
                    success: function(response){
                        response = $.parseJSON(response.replace(/<[^><]*>/gi, ''));
                        if(response.success){
                            $(".popupSubContent", self.popup.$element).remove();
                            $(".popupSubTitle", self.popup.$element).text("");
                            $(".buttonYes, .buttonBack", self.popup.$element).hide();
                            $(".popupContent", self.popup.$element).show();
                            for(wmc_id in response.success){
                                var map = $('#' + this.options.target).data('mapbenderMbMap');
                                var wmcHandlier = new Mapbender.WmcHandler(map, {
                                    keepExtent: self.options.keepExtent,
                                    keepSources: self.options.keepSources});
                                wmcHandlier.addToMap(wmc_id, response.success[wmc_id]);
                            }
                        }else if(response.error){
                            $(".popupSubContent", self.popup.$element).html(response.error);
                            $(".popupSubTitle", self.popup.$element).text("ERROR");
                        }
                    },
                    error: function(response){
                        Mapbender.error(response);
                    }
                });
            }
        },
        /**
         * Loads a wmc from id
         */
        _loadFromId: function(e){
            var wmc_id = $(e.target).parents('tr:first').attr('data-id');
            this.loadFromId(wmc_id);

//            this.close(); 
        },
        loadFromId: function(wmc_id){
            var map = $('#' + this.options.target).data('mapbenderMbMap');
            var wmcHandlier = new Mapbender.WmcHandler(map, {
                keepExtent: this.options.keepExtent,
                keepSources: this.options.keepSources});
            wmcHandlier.loadFromId(this.elementUrl + 'load', wmc_id);
        },
        /**
         *
         */
        ready: function(callback){
            if(this.readyState === true){
                callback();
            }else{
                this.readyCallbacks.push(callback);
            }
        },
        /**
         *
         */
        _ready: function(){
            for(callback in this.readyCallbacks){
                callback();
                delete(this.readyCallbacks[callback]);
            }
            this.readyState = true;
        },
        _destroy: $.noop
    });

})(jQuery);