<?php
/**
 * Booking form: emails the request to the booking address and keeps a copy
 * under wp-admin → Bookings, so nothing is lost if mail delivery fails.
 *
 * @package fmd
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function fmd_register_booking_type() {
	register_post_type(
		'fmd_booking',
		array(
			'labels'          => array(
				'name'          => __( 'Bookings', 'fmd' ),
				'singular_name' => __( 'Booking', 'fmd' ),
				'edit_item'     => __( 'Booking request', 'fmd' ),
			),
			'public'          => false,
			'show_ui'         => true,
			'menu_icon'       => 'dashicons-calendar-alt',
			'menu_position'   => 20,
			'supports'        => array( 'title', 'editor' ),
			'capability_type' => 'post',
			'capabilities'    => array( 'create_posts' => 'do_not_allow' ),
			'map_meta_cap'    => true,
		)
	);
}
add_action( 'init', 'fmd_register_booking_type' );

/**
 * Roles offered in the form.
 */
function fmd_booking_roles() {
	return array(
		'director' => __( 'Tournament director', 'fmd' ),
		'team'     => __( 'Team or club', 'fmd' ),
		'parent'   => __( 'Parent', 'fmd' ),
	);
}

/**
 * Send the response (JSON for the in-page form, redirect without JavaScript).
 */
function fmd_booking_respond( $ok, $message, $field = '' ) {
	$is_ajax = isset( $_POST['ajax'] ) && '1' === $_POST['ajax']; // phpcs:ignore WordPress.Security.NonceVerification
	if ( $is_ajax ) {
		$payload = array( 'message' => $message, 'field' => $field );
		if ( $ok ) {
			wp_send_json_success( $payload );
		}
		wp_send_json_error( $payload, 400 );
	}
	$url = add_query_arg( 'booking', $ok ? 'sent' : 'error', home_url( '/' ) ) . '#book';
	wp_safe_redirect( $url );
	exit;
}

function fmd_handle_booking() {
	// phpcs:disable WordPress.Security.NonceVerification -- public form; protected by honeypot, timing and rate limit (nonces break behind page caches).
	$post = wp_unslash( $_POST );

	// Spam traps: hidden field must stay empty; form must be open for 3+ seconds.
	if ( ! empty( $post['website'] ) ) {
		fmd_booking_respond( true, __( 'Request sent. We will get back to you shortly.', 'fmd' ) );
	}
	$ts = isset( $post['fmd_ts'] ) ? (int) $post['fmd_ts'] : 0;
	if ( $ts && ( time() * 1000 - $ts ) < 3000 ) {
		fmd_booking_respond( false, __( 'That was fast. Wait a moment and send the form again.', 'fmd' ) );
	}

	// Rate limit: 6 requests per hour per IP.
	$ip_key = 'fmd_rl_' . md5( isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : 'x' );
	$count  = (int) get_transient( $ip_key );
	if ( $count >= 6 ) {
		fmd_booking_respond( false, __( 'Too many requests from this connection. Email us directly instead.', 'fmd' ) );
	}

	$roles = fmd_booking_roles();
	$f     = array(
		'role'    => isset( $post['fmd_role'], $roles[ $post['fmd_role'] ] ) ? $roles[ $post['fmd_role'] ] : '',
		'name'    => sanitize_text_field( isset( $post['fmd_name'] ) ? $post['fmd_name'] : '' ),
		'email'   => sanitize_email( isset( $post['fmd_email'] ) ? $post['fmd_email'] : '' ),
		'phone'   => sanitize_text_field( isset( $post['fmd_phone'] ) ? $post['fmd_phone'] : '' ),
		'event'   => sanitize_text_field( isset( $post['fmd_event'] ) ? $post['fmd_event'] : '' ),
		'date'    => sanitize_text_field( isset( $post['fmd_date'] ) ? $post['fmd_date'] : '' ),
		'venue'   => sanitize_text_field( isset( $post['fmd_venue'] ) ? $post['fmd_venue'] : '' ),
		'players' => sanitize_text_field( isset( $post['fmd_players'] ) ? $post['fmd_players'] : '' ),
		'design'  => sanitize_textarea_field( isset( $post['fmd_design'] ) ? $post['fmd_design'] : '' ),
		'message' => sanitize_textarea_field( isset( $post['fmd_message'] ) ? $post['fmd_message'] : '' ),
	);
	// phpcs:enable

	if ( '' === $f['name'] ) {
		fmd_booking_respond( false, __( 'Add your name so we know who to reply to.', 'fmd' ), 'fmd_name' );
	}
	if ( ! is_email( $f['email'] ) ) {
		fmd_booking_respond( false, __( 'Enter an email address like name@example.com.', 'fmd' ), 'fmd_email' );
	}

	// Optional logo / artwork file.
	$attachments = array();
	$file_note   = '';
	if ( ! empty( $_FILES['fmd_logo']['name'] ) && UPLOAD_ERR_OK === $_FILES['fmd_logo']['error'] ) { // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
		if ( $_FILES['fmd_logo']['size'] > 8 * MB_IN_BYTES ) { // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
			fmd_booking_respond( false, __( 'The logo file is over 8 MB. Send a smaller PNG, JPG or PDF.', 'fmd' ), 'fmd_logo' );
		}
		require_once ABSPATH . 'wp-admin/includes/file.php';
		$mimes = array(
			'png'          => 'image/png',
			'jpg|jpeg|jpe' => 'image/jpeg',
			'webp'         => 'image/webp',
			'gif'          => 'image/gif',
			'pdf'          => 'application/pdf',
		);
		$up    = wp_handle_upload( $_FILES['fmd_logo'], array( 'test_form' => false, 'mimes' => $mimes ) ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
		if ( isset( $up['error'] ) ) {
			fmd_booking_respond( false, __( 'The logo must be a PNG, JPG, WEBP, GIF or PDF file.', 'fmd' ), 'fmd_logo' );
		}
		$attachments[] = $up['file'];
		$file_note     = $up['url'];
	}

	set_transient( $ip_key, $count + 1, HOUR_IN_SECONDS );

	$lines = array(
		'Role'            => $f['role'],
		'Name'            => $f['name'],
		'Email'           => $f['email'],
		'Phone'           => $f['phone'],
		'Tournament'      => $f['event'],
		'Date(s)'         => $f['date'],
		'Venue / city'    => $f['venue'],
		'Players (est.)'  => $f['players'],
		'Studio design'   => $f['design'],
		'Logo file'       => $file_note,
		'Message'         => $f['message'],
	);
	$body = '';
	foreach ( $lines as $label => $value ) {
		if ( '' !== $value ) {
			$body .= $label . ': ' . $value . "\n";
		}
	}

	$title = sprintf(
		/* translators: 1: tournament or name, 2: date */
		__( 'Booking: %1$s %2$s', 'fmd' ),
		$f['event'] ? $f['event'] : $f['name'],
		$f['date'] ? '— ' . $f['date'] : ''
	);

	// Keep a copy in wp-admin.
	wp_insert_post(
		array(
			'post_type'    => 'fmd_booking',
			'post_status'  => 'private',
			'post_title'   => wp_strip_all_tags( trim( $title ) ),
			'post_content' => esc_html( $body ),
		)
	);

	$to      = fmd_mod( 'email' );
	$headers = array(
		'Content-Type: text/plain; charset=UTF-8',
		sprintf( 'Reply-To: %s <%s>', str_replace( array( '<', '>', '"' ), '', $f['name'] ), $f['email'] ),
	);
	$sent    = wp_mail( $to, trim( $title ), $body . "\n— Sent from " . home_url( '/' ), $headers, $attachments );

	if ( $sent && fmd_mod( 'autoreply' ) ) {
		$reply = sprintf(
			"Hi %s,\n\nThanks for reaching out to Family Memories Design. We got your request and will get back to you shortly.\n\nWhat you sent:\n%s\nQuestions? Reply to this email or call %s.\n\nWear memories.",
			$f['name'],
			$body,
			fmd_mod( 'phone' )
		);
		wp_mail( $f['email'], __( 'We got your request — Family Memories Design', 'fmd' ), $reply, array( 'Content-Type: text/plain; charset=UTF-8', 'Reply-To: ' . $to ) );
	}

	// The uploaded logo stays in the Media uploads folder so the link in Bookings keeps working.

	if ( ! $sent ) {
		// Saved in wp-admin already; tell the visitor the honest status.
		fmd_booking_respond( true, sprintf( __( 'Request saved. If you do not hear from us within a day, email %s.', 'fmd' ), $to ) );
	}
	fmd_booking_respond( true, __( 'Request sent. We will get back to you shortly.', 'fmd' ) );
}
add_action( 'admin_post_nopriv_fmd_book', 'fmd_handle_booking' );
add_action( 'admin_post_fmd_book', 'fmd_handle_booking' );
