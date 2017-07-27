var WC_PPP_Brasil_Checkout = (function () {
    function WC_PPP_Brasil_Checkout() {
        var _this = this;
        /**
         * Run after form submit to submit the iframe and after submit the form again.
         * @param event
         */
        this.onSubmitForm = function (event) {
            var checked = jQuery('#payment_method_' + wc_ppp_brasil_data.id + ':checked');
            // Block the form in order pay, as it isn't default.
            if (wc_ppp_brasil_data['order_pay']) {
                _this.$form.block({
                    message: null,
                    overlayCSS: {
                        background: '#fff',
                        opacity: 0.6
                    }
                });
            }
            // Check if is not forced submit and prevent submit before submit PayPal iframe or isn't the payment selected.
            if (!_this.forceSubmit && checked.length) {
                event.preventDefault();
                event.stopImmediatePropagation();
                _this.instance.doContinue();
            }
        };
        /**
         * Trigger the update checkout to reload the checkout.
         */
        this.updateCheckout = function (event) {
            if (event === void 0) { event = null; }
            if (event) {
                event.preventDefault();
            }
            _this.triggerUpdateCheckout();
        };
        /**
         * Debounce the trigger checkout.
         *
         * @type {()=>any}
         */
        this.triggerUpdateCheckout = this.debounce(function () {
            console.log('updating checkout');
            _this.$body.trigger('update_checkout');
        }, 500);
        /**
         * Create the iframe after update the checkout.
         */
        this.onUpdatedCheckout = function () {
            _this.$inputData = jQuery('#wc-ppp-brasil-data');
            _this.$inputResponse = jQuery('#wc-ppp-brasil-response');
            _this.$inputError = jQuery('#wc-ppp-brasil-error');
            _this.$inputSubmit = jQuery('#place_order');
            _this.$overlay = jQuery('#wc-ppb-brasil-container-overlay');
            _this.$loading = jQuery('#wc-ppp-brasil-container-loading');
            _this.$containerDummy = jQuery('#wc-ppp-brasil-container-dummy');
            _this.$overlay.on('click', '[data-action=update-checkout]', _this.updateCheckout);
            _this.showOverlay();
            try {
                var data = JSON.parse(_this.$inputData.val());
                _this.createIframe(data);
            }
            catch (error) {
            }
        };
        /**
         * Listen for messages in the page.ˆ
         * @param event
         */
        this.messageListener = function (event) {
            try {
                var message = JSON.parse(event.data);
                // Check if is iframe error handling or is just an action.
                if (typeof message['cause'] !== 'undefined') {
                    _this.treatIframeError(message);
                }
                else {
                    _this.treatIframeAction(message);
                }
            }
            catch (err) {
            }
        };
        this.$body = jQuery(document.body);
        this.$form = wc_ppp_brasil_data['order_pay'] ? jQuery('form#order_review') : jQuery('form.checkout.woocommerce-checkout');
        // Listen for input/select changes.
        this.listenInputChanges();
        // Listen for updated checkout.
        this.$body.on('updated_checkout', this.onUpdatedCheckout);
        // Listen for the form submit.
        this.$form.on('submit', this.onSubmitForm);
        // Listen for window messages
        window.addEventListener('message', this.messageListener, false);
    }
    /**
     * Add event listener for input/select changes and trigger the update checkout.
     */
    WC_PPP_Brasil_Checkout.prototype.listenInputChanges = function () {
        var _this = this;
        var keySelectors = [
            '[name=billing_first_name]',
            '[name=billing_last_name]',
            '[name=billing_cpf]',
            '[name=billing_cnpj]',
            '[name=billing_phone]',
            '[name=billing_address_1]',
            '[name=billing_number]',
            '[name=billing_address_2]',
            '[name=billing_neighborhood]',
            '[name=billing_city]',
            '[name=billing_state]',
            '[name=billing_country]',
            '[name=billing_email]',
        ];
        var changeSelectors = [
            '[name=billing_persontype]',
        ];
        jQuery(keySelectors.join(',')).on('keyup', function () { return _this.updateCheckout(); });
        jQuery(changeSelectors.join(',')).on('change', function () { return _this.updateCheckout(); });
    };
    /**
     * Create the iframe with the data.
     * @param data
     */
    WC_PPP_Brasil_Checkout.prototype.createIframe = function (data) {
        // If it's not a dummy data, remove the overlay.
        if (!data.dummy) {
            this.hideOverlay();
            // Show loading.
            this.showLoading();
            // Instance the PPP.
            this.instance = PAYPAL.apps.PPP({
                'approvalUrl': data.approval_url,
                'placeholder': 'wc-ppp-brasil-container',
                'mode': wc_ppp_brasil_data['mode'],
                'payerFirstName': data.first_name,
                'payerLastName': data.last_name,
                'payerPhone': data.phone,
                'payerTaxId': data.person_type === '1' ? data.cpf : data.cnpj,
                'payerTaxIdType': data.person_type === '1' ? 'BR_CPF' : 'BR_CNPJ',
                'language': 'pt_BR',
                'country': 'BR',
                'payerEmail': data.email,
                'rememberedCards': data.remembered_cards,
            });
        }
        else {
            this.$containerDummy.removeClass('hidden');
        }
        window['teste'] = this.instance;
    };
    /**
     * Hide the overlay in container.
     */
    WC_PPP_Brasil_Checkout.prototype.hideOverlay = function () {
        this.$overlay.addClass('hidden');
    };
    WC_PPP_Brasil_Checkout.prototype.showOverlay = function () {
        this.$overlay.removeClass('hidden');
    };
    WC_PPP_Brasil_Checkout.prototype.hideLoading = function () {
        this.$loading.addClass('hidden');
    };
    WC_PPP_Brasil_Checkout.prototype.showLoading = function () {
        this.$loading.removeClass('hidden');
    };
    /**
     * Treat the iframe errors.
     * @param message
     */
    WC_PPP_Brasil_Checkout.prototype.treatIframeError = function (message) {
        var cause = message['cause'].replace(/['"]+/g, "");
        switch (cause) {
            case 'CHECK_ENTRY':
                this.showMessage('<div class="woocommerce-error">' + wc_ppp_brasil_data['messages']['check_entry'] + '</div>');
                break;
            default:
                this.$inputError.val(message['cause']);
                this.forceSubmitForm();
                break;
        }
    };
    /**
     * Treat the iframe actions.
     * @param message
     */
    WC_PPP_Brasil_Checkout.prototype.treatIframeAction = function (message) {
        switch (message['action']) {
            // When call to enable the continue button.
            case 'enableContinueButton':
                this.enableSubmitButton();
                break;
            // When call to disable continue button.
            case 'disableContinueButton':
                this.disableSubmitButton();
                break;
            // When the iframe was submited and we have the payment info.
            case 'checkout':
                // Add the data in the inputs
                this.$inputResponse.val(JSON.stringify(message));
                // Submit the form
                this.forceSubmit = false;
                this.forceSubmitForm();
                break;
            // In case we get some error.
            case 'onError':
                this.$inputResponse.val('');
                break;
            case 'loaded':
                this.hideLoading();
                break;
        }
    };
    /**
     * Disable the submit button.
     */
    WC_PPP_Brasil_Checkout.prototype.disableSubmitButton = function () {
        this.$inputSubmit.prop('disabled', true);
    };
    /**
     * Enable the submit button.
     */
    WC_PPP_Brasil_Checkout.prototype.enableSubmitButton = function () {
        this.$inputSubmit.prop('disabled', false);
    };
    /**
     * Force the form submit.
     */
    WC_PPP_Brasil_Checkout.prototype.forceSubmitForm = function () {
        this.forceSubmit = true;
        this.$form.submit();
    };
    WC_PPP_Brasil_Checkout.prototype.showMessage = function (messages) {
        var $form = jQuery('form.checkout');
        // Remove notices from all sources
        jQuery('.woocommerce-error, .woocommerce-message').remove();
        // Add new errors
        if (messages) {
            $form.prepend('<div class="woocommerce-NoticeGroup woocommerce-NoticeGroup-updateOrderReview">' + messages + '</div>');
            // Lose focus for all fields
            $form.find('.input-text, select, input:checkbox').blur();
            // Scroll to top
            jQuery('html, body').animate({
                scrollTop: ($form.offset().top - 100)
            }, 1000);
        }
    };
    WC_PPP_Brasil_Checkout.prototype.debounce = function (func, wait, immediate) {
        if (immediate === void 0) { immediate = false; }
        var timeout;
        return function () {
            var context = this;
            var args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate)
                    func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow)
                func.apply(context, args);
        };
    };
    ;
    return WC_PPP_Brasil_Checkout;
})();
new WC_PPP_Brasil_Checkout();
