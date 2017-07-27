<?php /** @var WC_PPP_Brasil_Gateway $this */ ?>
<?php if ( 'yes' == $this->wrong_credentials ): ?>
    <div id="message-invalid-credentials" class="error inline">
        <p><strong>Suas credenciais estão inválidas. Verifique os dados informados e salve as configurações
                novamente.</strong></p>
    </div>
<?php endif; ?>
<img class="ppp-brasil-banner"
     src="<?php echo $this->plugin_url( 'assets/images/banner.png' ); ?>"
     title="PayPal Plus Brasil"
     alt="PayPal Plus Brasil">
<?php echo wp_kses_post( wpautop( $this->get_method_description() ) ); ?>

<table class="form-table">
	<?php echo $this->generate_settings_html( $this->get_form_fields(), false ); ?>
</table>