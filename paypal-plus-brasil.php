<?php

/**
 * Plugin Name: PayPal Plus Brasil
 * Description: Adicione facilmente opções de pagamento do PayPal Plus ao seu site do WordPress/WooCommerce.
 * Version: 1.0.0
 * Author: PayPal
 * Requires at least: 4.4
 * Tested up to: 4.8
 * Text Domain: ppp-brasil
 * Domain Path: /languages/
 */

// Exit if not in WordPress.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Check if class already exists before create.
if ( ! class_exists( 'WC_PPP_Brasil' ) ) {

	/**
	 * Class WC_PPP_Brasil.
	 */
	class WC_PPP_Brasil {

		/**
		 * Current plugin instance.
		 * @var WC_PPP_Brasil
		 */
		private static $instance;

		/**
		 * WC_PPP_Brasil constructor.
		 */
		private function __construct() {
			// Load plugin text domain.
			add_action( 'init', array( $this, 'load_plugin_textdomain' ) );
			// Include the necessary files.
			$this->includes();
			// Check if Extra Checkout Fields for Brazil is installed
			if ( is_admin() ) {
				add_action( 'admin_notices', array( $this, 'ecfb_missing_notice' ) );
				add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), array(
					$this,
					'plugin_action_links'
				) );
			}
			// Add hook to include new gateways.
			add_action( 'plugins_loaded', array( $this, 'include_gateway' ) );
			// Add the payment methods.
			add_filter( 'woocommerce_payment_gateways', array( $this, 'add_payment_method' ) );
		}

		/**
		 * Get the plugin instance.
		 * @return WC_PPP_Brasil
		 */
		public static function get_instance() {
			// Check if instance is not created, so create a new one.
			if ( ! self::$instance ) {
				self::$instance = new self;

			}

			return self::$instance;
		}

		/**
		 * Includes for the plugin.
		 */
		public function includes() {

		}

		/**
		 * Include the files for gateway.
		 */
		public function include_gateway() {
			// Check if WooCommerce is installed
			if ( class_exists( 'WC_Payment_Gateway' ) ) {
				include dirname( __FILE__ ) . '/includes/class-wc-ppp-brasil-gateway.php';
				include dirname( __FILE__ ) . '/includes/class-wc-ppp-brasil-metabox.php';
			} else {
				add_action( 'admin_notices', array( $this, 'woocommerce_missing_notice' ) );
			}
		}

		/**
		 * Filter and add the payment method to WooCommerce.
		 *
		 * @param $methods array Already loaded gateways.
		 *
		 * @return array New loaded gateways.
		 */
		public function add_payment_method( $methods ) {
			$methods[] = 'WC_PPP_Brasil_Gateway';

			return $methods;
		}

		/**
		 * Load the plugin text domain for translation.
		 */
		public function load_plugin_textdomain() {
			load_plugin_textdomain( 'ppp-brasil', false, dirname( plugin_basename( __FILE__ ) ) . '/languages/' );
		}

		/**
		 * WooCommerce Extra Checkout Fields for Brazil notice.
		 */
		public function ecfb_missing_notice() {
			if ( ! class_exists( 'Extra_Checkout_Fields_For_Brazil' ) ) {
				include dirname( __FILE__ ) . '/includes/views/html-notice-missing-ecfb.php';
			}
		}

		/**
		 * WooCommerce missing notice.
		 */
		public function woocommerce_missing_notice() {
			include dirname( __FILE__ ) . '/includes/views/html-notice-missing-woocommerce.php';
		}

		/**
		 * Action links.
		 *
		 * @param array $links Action links.
		 *
		 * @return array
		 */
		public function plugin_action_links( $links ) {
			$plugin_links   = array();
			$plugin_links[] = '<a href="' . esc_url( admin_url( 'admin.php?page=wc-settings&tab=checkout&section=wc-ppp-brasil-gateway' ) ) . '">' . __( 'Configurações', 'ppp-brasil' ) . '</a>';

			return array_merge( $plugin_links, $links );
		}

	}

	// Init the plugin.
	WC_PPP_Brasil::get_instance();

}