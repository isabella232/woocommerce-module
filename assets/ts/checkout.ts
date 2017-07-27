declare const jQuery: any;
declare const PAYPAL: any;
declare const wc_ppp_brasil_data: any;

class WC_PPP_Brasil_Checkout {

    private instance: any;
    private forceSubmit: boolean;

    private $body: any;
    private $form: any;
    private $overlay: any;
    private $loading: any;
    private $inputData: any;
    private $inputResponse: any;
    private $inputError: any;
    private $inputSubmit: any;
    private $containerDummy: any;

    constructor() {
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
    listenInputChanges() {
        const keySelectors = [
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
        const changeSelectors = [
            '[name=billing_persontype]',
        ];

        jQuery(keySelectors.join(',')).on('keyup', () => this.updateCheckout());
        jQuery(changeSelectors.join(',')).on('change', () => this.updateCheckout());
    }

    /**
     * Run after form submit to submit the iframe and after submit the form again.
     * @param event
     */
    onSubmitForm = (event: any) => {
        const checked = jQuery('#payment_method_' + wc_ppp_brasil_data.id + ':checked');
        // Block the form in order pay, as it isn't default.
        if (wc_ppp_brasil_data['order_pay']) {
            this.$form.block({
                message: null,
                overlayCSS: {
                    background: '#fff',
                    opacity: 0.6
                }
            });
        }
        // Check if is not forced submit and prevent submit before submit PayPal iframe or isn't the payment selected.
        if (!this.forceSubmit && checked.length) {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.instance.doContinue();
        }
    };

    /**
     * Trigger the update checkout to reload the checkout.
     */
    updateCheckout = (event: any = null) => {
        if (event) {
            event.preventDefault();
        }
        this.triggerUpdateCheckout();
    };


    /**
     * Debounce the trigger checkout.
     *
     * @type {()=>any}
     */
    triggerUpdateCheckout = this.debounce(() => {
        console.log('updating checkout');
        this.$body.trigger('update_checkout');
    }, 500);

    /**
     * Create the iframe after update the checkout.
     */
    onUpdatedCheckout = () => {
        this.$inputData = jQuery('#wc-ppp-brasil-data');
        this.$inputResponse = jQuery('#wc-ppp-brasil-response');
        this.$inputError = jQuery('#wc-ppp-brasil-error');
        this.$inputSubmit = jQuery('#place_order');
        this.$overlay = jQuery('#wc-ppb-brasil-container-overlay');
        this.$loading = jQuery('#wc-ppp-brasil-container-loading');
        this.$containerDummy = jQuery('#wc-ppp-brasil-container-dummy');
        this.$overlay.on('click', '[data-action=update-checkout]', this.updateCheckout);
        this.showOverlay();
        try {
            const data = JSON.parse(this.$inputData.val());
            this.createIframe(data);
        } catch (error) {
        }
    };

    /**
     * Create the iframe with the data.
     * @param data
     */
    createIframe(data: any) {
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
        } else {
            this.$containerDummy.removeClass('hidden');
        }
        window['teste'] = this.instance;
    }

    /**
     * Hide the overlay in container.
     */
    hideOverlay() {
        this.$overlay.addClass('hidden');
    }

    showOverlay() {
        this.$overlay.removeClass('hidden');
    }

    hideLoading() {
        this.$loading.addClass('hidden');
    }

    showLoading() {
        this.$loading.removeClass('hidden');
    }

    /**
     * Listen for messages in the page.ˆ
     * @param event
     */
    messageListener = (event: any) => {
        try {
            const message = JSON.parse(event.data);
            // Check if is iframe error handling or is just an action.
            if (typeof message['cause'] !== 'undefined') {
                this.treatIframeError(message);
            } else {
                this.treatIframeAction(message);
            }
        } catch (err) {
        }
    };

    /**
     * Treat the iframe errors.
     * @param message
     */
    treatIframeError(message: any) {
        const cause = message['cause'].replace(/['"]+/g, "");
        switch (cause) {
            case 'CHECK_ENTRY':
                this.showMessage('<div class="woocommerce-error">' + wc_ppp_brasil_data['messages']['check_entry'] + '</div>');
                break;
            default:
                this.$inputError.val(message['cause']);
                this.forceSubmitForm();
                break;
        }
    }

    /**
     * Treat the iframe actions.
     * @param message
     */
    treatIframeAction(message: any) {
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
    }

    /**
     * Disable the submit button.
     */
    private disableSubmitButton() {
        this.$inputSubmit.prop('disabled', true);
    }

    /**
     * Enable the submit button.
     */
    private enableSubmitButton() {
        this.$inputSubmit.prop('disabled', false);
    }

    /**
     * Force the form submit.
     */
    private forceSubmitForm() {
        this.forceSubmit = true;
        this.$form.submit();
    }

    private showMessage(messages: string) {
        const $form = jQuery('form.checkout');

        // Remove notices from all sources
        jQuery('.woocommerce-error, .woocommerce-message').remove();

        // Add new errors
        if (messages) {
            $form.prepend('<div class="woocommerce-NoticeGroup woocommerce-NoticeGroup-updateOrderReview">' + messages + '</div>');

            // Lose focus for all fields
            $form.find('.input-text, select, input:checkbox').blur();

            // Scroll to top
            jQuery('html, body').animate({
                scrollTop: ( $form.offset().top - 100 )
            }, 1000);
        }

    }

    private debounce(func, wait, immediate = false) {
        let timeout;
        return function () {
            const context = this;
            const args = arguments;
            const later = function () {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

}

new WC_PPP_Brasil_Checkout();
