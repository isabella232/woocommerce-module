<?php

// Exit if not in WordPress.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Check if class already exists before create.
if ( ! class_exists( 'WC_PPP_Brasil_Metabox' ) ) {

	/**
	 * Class WC_PPP_Brasil_Metabox.
	 */
	class WC_PPP_Brasil_Metabox {

		/**
		 * WC_PPP_Brasil_Metabox constructor.
		 */
		public function __construct() {
			if ( is_admin() ) {
				add_action( 'load-post.php', array( $this, 'init_metabox' ) );
				add_action( 'load-post-new.php', array( $this, 'init_metabox' ) );
			}
		}

		/**
		 * Meta box initialization.
		 */
		public function init_metabox() {
			add_action( 'add_meta_boxes', array( $this, 'add_metabox' ) );
		}

		/**
		 * Adds the meta box.
		 */
		public function add_metabox() {
			global $post;
			add_meta_box(
				'wc-ppp-brasil',
				__( 'PayPal Plus', 'ppp-brasil' ),
				array( $this, 'render_metabox' ),
				'shop_order',
				'side',
				'default'
			);

		}

		/**
		 * Renders the meta box.
		 */
		public function render_metabox( $post ) {
			include dirname( __FILE__ ) . '/views/html-order-metabox.php';
		}

	}

}

new WC_PPP_Brasil_Metabox();