<?php
/**
 * Small helpers shared by templates.
 *
 * @package fmd
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Default values for every Customizer setting.
 * Prices are placeholders — change them in Appearance → Customize → Wear Memories → Prices.
 */
function fmd_defaults() {
	return array(
		'hero_sub'         => 'Custom tournament apparel, printed while you wait.',
		'cta_primary'      => 'Book your tournament',
		'cta_secondary'    => 'Design yours in 3D',
		'hero_tag'         => '$0 to tournament directors. No minimums. Printed on tournament day.',
		'email'            => 'info@familymemoriesdesign.com',
		'phone'            => '720-305-1643',
		'city'             => 'Sacramento, CA',
		'price_tee'        => '$25',
		'price_crew'       => '$40',
		'price_hoodie'     => '$45',
		'price_addon'      => '+$8',
		'booth_image'      => FMD_URI . '/assets/img/booth-tent.webp',
		'model_hoodie'     => FMD_URI . '/assets/models/hoodie.glb',
		'model_crew'       => FMD_URI . '/assets/models/crewneck.glb',
		'model_tee'        => FMD_URI . '/assets/models/tshirt.glb',
		'model_hoodie_yaw' => 0,
		'model_crew_yaw'   => 0,
		'model_tee_yaw'    => 0,
		'autoreply'        => 1,
	);
}

/**
 * Read a theme setting with its default.
 */
function fmd_mod( $key ) {
	$d = fmd_defaults();
	return get_theme_mod( $key, isset( $d[ $key ] ) ? $d[ $key ] : '' );
}

/**
 * Google Fonts: Archivo (variable width + weight) and IBM Plex Mono.
 */
function fmd_fonts_url() {
	return 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,300..900&family=IBM+Plex+Mono:wght@400;500&display=swap';
}

/**
 * The original logo file only — never redrawn.
 * Priority: Site Identity logo → assets/img/logo2x.png in the theme → text wordmark.
 */
function fmd_logo( $class = 'logo' ) {
	$name = get_bloginfo( 'name' ) ? get_bloginfo( 'name' ) : 'Family Memories Design';
	$src  = '';
	$id   = (int) get_theme_mod( 'custom_logo' );
	if ( $id ) {
		$img = wp_get_attachment_image_src( $id, 'full' );
		if ( $img ) {
			$src = $img[0];
		}
	}
	if ( ! $src && file_exists( FMD_DIR . '/assets/img/logo2x.png' ) ) {
		$src = FMD_URI . '/assets/img/logo2x.png';
	}
	if ( $src ) {
		printf(
			'<img class="%1$s__img" src="%2$s" alt="%3$s" decoding="async">',
			esc_attr( $class ),
			esc_url( $src ),
			esc_attr( $name )
		);
		return;
	}
	printf( '<span class="%1$s__word">%2$s</span>', esc_attr( $class ), esc_html( $name ) );
}

/**
 * tel: href from a display phone number.
 */
function fmd_tel( $phone ) {
	$digits = preg_replace( '/[^0-9+]/', '', $phone );
	if ( strlen( $digits ) === 10 ) {
		$digits = '+1' . $digits;
	}
	return 'tel:' . $digits;
}

/**
 * Four crop marks for a "proof" frame. Purely decorative.
 */
function fmd_crop_marks() {
	echo '<span class="crop crop--tl" aria-hidden="true"></span><span class="crop crop--tr" aria-hidden="true"></span><span class="crop crop--bl" aria-hidden="true"></span><span class="crop crop--br" aria-hidden="true"></span>';
}

/**
 * Registration target (print-shop mark), drawn in the accent colour.
 */
function fmd_reg_mark( $class = 'reg' ) {
	echo '<svg class="' . esc_attr( $class ) . '" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><circle cx="20" cy="20" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="20" cy="20" r="4.5" fill="currentColor"/><path d="M20 0v40M0 20h40" stroke="currentColor" stroke-width="1.5"/></svg>';
}
