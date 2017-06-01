;(function($, window, document, undefined) {

    "use strict";

    var pluginName = "imagePreview";
    var defaults = {
        defaultImage: null,
        template: '<div class="image-preview">' +
        '  <div class="image-preview__preview"></div>' +
        '  <div class="image-preview__buttons">' +
        '    <span class="image-preview__trigger-button"><i class="fa fa-plus"></i></span>' +
        '    <span class="image-preview__remove-button"><i class="fa fa-times"></i></span>' +
        '  </div>' +
        '</div>',
        previewSelector: '.image-preview__preview',
        removeButtonSelector: '.image-preview__remove-button',
        triggerButtonSelector: '.image-preview__trigger-button',
    };

    function ImagePreview(element, options) {
        this.element = element;
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    $.extend(ImagePreview.prototype, {
        defaultImage: null,
        currentImage: null,
        $element: null,
        $preview: null,
        $removeButton: null,
        init: function() {
            // jQuery wrap the target element
            this.$element = $(this.element);

            // Ensure that we're attaching this plugin to a file input and that all the required features are supported.
            if (!this.isFileInput() || !this.hasRequiredFeatures()) {
                return false;
            }

            // Hide the target element
            this.hideFileInput();

            // Set the default image URL from the data-default attribute or the defaultImage setting.
            var dataDefaultImage = this.$element.data('default');
            this.defaultImage = dataDefaultImage ? dataDefaultImage : this.settings.defaultImage;

            // Get the current image from the target element if there is one and set the currentImage property.
            var currentImage = this.$element.data('current');
            if (currentImage) {
                this.currentImage = currentImage;
            }

            this.buildUI();
            this.addEventListeners();
            this.updateUI();
        },
        /**
         * Tell whether this element is a file input.
         *
         * @returns {boolean}
         */
        isFileInput: function() {
            return this.$element.prop('tagName').toLowerCase() === 'input' && this.$element.prop('type') === 'file';
        },
        /**
         * Tell whether this browser has access to the required features.
         *
         * @returns {boolean}
         */
        hasRequiredFeatures: function() {
            return typeof FileReader !== 'undefined';
        },
        /**
         * If the hideFileInput setting is true, hide the file input.
         */
        hideFileInput: function() {
            this.$element.css({
                'position': 'fixed',
                'top': '-1000px',
                'left': '-1000px'
            });
        },
        /**
         * Build the UI by creating the jQuery elements and adding them to the DOM.
         */
        buildUI: function() {
            var $container = $(this.settings.template);

            this.$preview = $container.find(this.settings.previewSelector);
            this.$removeButton = $container.find(this.settings.removeButtonSelector);
            this.$triggerButton = $container.find(this.settings.triggerButtonSelector);

            this.$element.before($container);
        },
        /**
         * Add the event listeners that manage the functionality.
         */
        addEventListeners: function() {
            var _this = this;

            // Add a window resize event listener to handle resize events
            $(window).resize(function() {
                _this.resize();
            });
            _this.resize();

            // Add file input change event to set the currentImage and update the UI.
            _this.$element.change(function(e) {
                e.preventDefault();

                if (_this.element.files && _this.element.files[0]) {
                    // Make sure the file is an image. If it isn't, empty the file input and bail out.
                    var file = _this.element.files[0];
                    var fileType= file['type'];
                    var validMimeTypes = ['image/gif', 'image/jpg', 'image/jpeg', 'image/png'];
                    if (validMimeTypes.indexOf(fileType) < 0) {
                        _this.$element.val('');
                        return false;
                    }

                    var reader = new FileReader();
                    reader.onload = function(_e) {
                        _this.currentImage = _e.target.result;
                        _this.updateUI();
                    };

                    reader.readAsDataURL(_this.element.files[0]);
                }

                return false;
            });

            // Add a trigger button click event that triggers a file input click
            _this.$triggerButton.click(function(e) {
                e.stopPropagation();
                e.preventDefault();

                _this.$element.trigger('click');
            });

            // Add a preview click event that triggers a file input click
            _this.$preview.click(function(e) {
                e.stopPropagation();
                e.preventDefault();

                _this.$element.trigger('click');
            });

            // Add a remove button event that removes the value from the file input, empties the current image and
            // updates the UI to show the default/empty image
            _this.$removeButton.click(function(e) {
                e.stopPropagation();
                e.preventDefault();

                _this.$element.val('');
                _this.currentImage = null;
                _this.updateUI();
            });
        },
        /**
         * Take care of keeping the UI up to date. When there's an image selected (i.e. currentImage has a value) then
         * we need to make sure the preview shows it and the remove button is visible. When there isn't an image we need
         * to either display the defaultImage if there is one, remove it if there isn't one and hide the remove button.
         */
        updateUI: function() {
            if (this.currentImage) {
                this.updatePreview(this.currentImage);
                this.$removeButton.show();
            } else {
                this.updatePreview(null);
                this.$removeButton.hide();
            }
        },
        /**
         * Update the preview with the provided image source.
         *
         * @param src
         */
        updatePreview: function(src) {
            if (this.$preview) {
                this.$preview.css({
                    'background-image': src ? 'url(\'' + src + '\')' : (this.defaultImage ? 'url(\'' + this.defaultImage + '\')' : 'none'),
                    'background-size': 'cover',
                    'background-repeat': 'no-repeat',
                    'background-position': 'center center'
                });
            }
        },
        /**
         * Handle window resize events. Keep the preview a square and the elements in the right places.
         */
        resize: function() {
            // Keep the height the same as the width.
            var w = this.$preview.width();
            this.$preview.height(w);
        }
    });

    //
    $.fn[pluginName] = function(options) {
        return this.each(function() {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new ImagePreview(this, options));
            }
        });
    };

})(jQuery, window, document);


module.exports = function($el, options) {
    $el.imagePreview(options);
};
