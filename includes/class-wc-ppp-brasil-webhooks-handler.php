<?php

// Exit if not in WordPress.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Check if class already exists before create.
if ( ! class_exists( 'WC_PPP_Brasil_Webhooks_Handler' ) ) {

	/**
	 * Class WC_PPP_Brasil_Webhooks_Handler.
	 */
	class WC_PPP_Brasil_Webhooks_Handler {

		private $api_context;

		/**
		 * WC_PPP_Brasil_Webhooks_Handler constructor.
		 *
		 * @param $api_context
		 */
		public function __construct( $api_context ) {
			$this->api_context = $api_context;
		}

		/**
		 * Handle the event.
		 *
		 * @param $event
		 */
		public function handle( $event ) {
			global $wpdb;
			$method_name = 'handle_process_' . str_replace( '.', '_', strtolower( $event['event_type'] ) );
			if ( method_exists( $this, $method_name ) ) {
				$resource_id = isset( $event['resource']['sale_id'] ) ? $event['resource']['sale_id'] : $event['resource']['id'];
				$order_id    = $wpdb->get_var( $wpdb->prepare( "SELECT post_id FROM $wpdb->postmeta WHERE meta_key = 'wc_ppp_brasil_sale_id' AND meta_value = %s", $resource_id ) );
				if ( $order_id ) {
					$order = new WC_Order( $order_id );
					$this->{$method_name}( $order, $event );
				}
			}
		}

		/**
		 * When payment is marked as completed.
		 *
		 * @param $order WC_Order
		 */
		public function handle_process_payment_sale_completed( $order, $event ) {
			// Check if order exists.
			if ( ! $order ) {
				return;
			}
			// Check if the current status isn't processing or completed.
			if ( ! in_array( $order->get_status(), array(
				'processing',
				'completed',
				'refunded',
				'cancelled'
			), true )
			) {
				$order->add_order_note( __( 'PayPal Plus: Transação paga.', 'woo-paypal-plus-brasil' ) );
				$order->payment_complete();
			}
		}

		/**
		 * When payment is denied.
		 *
		 * @param $order WC_Order
		 */
		public function handle_process_payment_sale_denied( $order, $event ) {
			// Check if order exists.
			if ( ! $order ) {
				return;
			}
			// Check if the current status isn't failed.
			if ( ! in_array( $order->get_status(), array( 'failed', 'completed', 'processing' ), true ) ) {
				$order->update_status( 'failed', __( 'PayPal Plus: A transação foi rejeitada pela empresa de cartão ou por fraude.', 'ppp-brasil' ) );
			}
		}

		/**
		 * When payment is refunded.
		 *
		 * @param $order WC_Order
		 */
		public function handle_process_payment_sale_refunded( $order, $event ) {
			// Check if order exists.
			if ( ! $order ) {
				return;
			}
			// Check if is total refund
			if ( $order->get_total() == floatval( $event['resource']['amount']['total'] ) ) {
				return;
			}
			// Check if the current status isn't refunded.
			if ( ! in_array( $order->get_status(), array( 'refunded' ), true ) ) {
				$order->update_status( 'refunded', __( 'PayPal Plus: A transação foi reembolsada.', 'ppp-brasil' ) );
			}
		}

		/**
		 * When payment is reversed.
		 *
		 * @param $order WC_Order
		 */
		public function handle_process_payment_sale_reversed( $order, $event ) {
			// Check if order exists.
			if ( ! $order ) {
				return;
			}
			$order->update_status( 'refunded', __( 'PayPal Plus: A transação foi revertida.', 'ppp-brasil' ) );
		}

	}

}