<?php
/**
 * Family Memories Design — Wear Memories theme.
 *
 * @package fmd
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'FMD_VERSION', '2.0.5' );
define( 'FMD_DIR', get_template_directory() );
define( 'FMD_URI', get_template_directory_uri() );

require FMD_DIR . '/inc/helpers.php';
require FMD_DIR . '/inc/customizer.php';
require FMD_DIR . '/inc/designs.php';
require FMD_DIR . '/inc/booking.php';

/**
 * Theme supports.
 */
function fmd_setup() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'style', 'script' ) );
	add_theme_support(
		'custom-logo',
		array(
			'height'      => 200,
			'width'       => 600,
			'flex-height' => true,
			'flex-width'  => true,
		)
	);
	register_nav_menus( array( 'primary' => __( 'Primary', 'fmd' ) ) );
}
add_action( 'after_setup_theme', 'fmd_setup' );

/**
 * Asset version = file modification time, so browsers never keep a stale copy.
 */
function fmd_asset_ver( $rel ) {
	$path = FMD_DIR . '/' . $rel;
	return file_exists( $path ) ? (string) filemtime( $path ) : FMD_VERSION;
}

/**
 * Styles and scripts.
 */
function fmd_assets() {
	wp_enqueue_style( 'fmd-fonts', fmd_fonts_url(), array(), null );
	wp_enqueue_style( 'fmd-main', FMD_URI . '/assets/css/main.css', array( 'fmd-fonts' ), fmd_asset_ver( 'assets/css/main.css' ) );

	wp_enqueue_script( 'fmd-site', FMD_URI . '/assets/js/site.js', array(), fmd_asset_ver( 'assets/js/site.js' ), array( 'in_footer' => true, 'strategy' => 'defer' ) );
	wp_add_inline_script( 'fmd-site', 'window.FMD=' . wp_json_encode( fmd_js_config() ) . ';', 'before' );

	if ( is_front_page() ) {
		// The one-page front end uses no block styles; keep the payload small.
		wp_dequeue_style( 'wp-block-library' );
		wp_dequeue_style( 'wp-block-library-theme' );
		wp_dequeue_style( 'global-styles' );
		wp_dequeue_style( 'classic-theme-styles' );
	}
}
add_action( 'wp_enqueue_scripts', 'fmd_assets', 20 );

/**
 * Preconnect to the font host.
 */
function fmd_resource_hints( $urls, $relation ) {
	if ( 'preconnect' === $relation ) {
		$urls[] = array( 'href' => 'https://fonts.gstatic.com', 'crossorigin' );
		$urls[] = 'https://fonts.googleapis.com';
	}
	return $urls;
}
add_filter( 'wp_resource_hints', 'fmd_resource_hints', 10, 2 );

/**
 * Configuration handed to the front-end scripts.
 */
function fmd_js_config() {
	return array(
		'studio'   => FMD_URI . '/assets/js/studio.js?v=' . fmd_asset_ver( 'assets/js/studio.js' ),
		'endpoint' => admin_url( 'admin-post.php' ),
		'email'    => fmd_mod( 'email' ),
		'models'   => array(
			'hoodie' => array( 'url' => esc_url_raw( fmd_mod( 'model_hoodie' ) ), 'yaw' => (int) fmd_mod( 'model_hoodie_yaw' ) ),
			'crew'   => array( 'url' => esc_url_raw( fmd_mod( 'model_crew' ) ), 'yaw' => (int) fmd_mod( 'model_crew_yaw' ) ),
			'tee'    => array( 'url' => esc_url_raw( fmd_mod( 'model_tee' ) ), 'yaw' => (int) fmd_mod( 'model_tee_yaw' ) ),
		),
		'designs'  => array_map(
			function ( $d ) {
				return array( 'id' => $d['num'], 'name' => $d['title'], 'src' => $d['src'], 'tint' => ! $d['custom'] );
			},
			fmd_get_designs()
		),
	);
}

/**
 * Allow .glb uploads in the media library (for the 3D studio models).
 */
function fmd_upload_mimes( $mimes ) {
	if ( current_user_can( 'manage_options' ) ) {
		$mimes['glb'] = 'model/gltf-binary';
	}
	return $mimes;
}
add_filter( 'upload_mimes', 'fmd_upload_mimes' );

function fmd_glb_filetype( $data, $file, $filename, $mimes ) {
	if ( current_user_can( 'manage_options' ) && preg_match( '/\.glb$/i', $filename ) ) {
		$data['ext']             = 'glb';
		$data['type']            = 'model/gltf-binary';
		$data['proper_filename'] = $filename;
	}
	return $data;
}
add_filter( 'wp_check_filetype_and_ext', 'fmd_glb_filetype', 10, 4 );

/**
 * Trim front-end bloat.
 */
remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );
remove_action( 'wp_head', 'wp_generator' );
remove_action( 'wp_head', 'wlwmanifest_link' );
remove_action( 'wp_head', 'rsd_link' );

/**
 * Meta description + theme colour for iOS.
 */
function fmd_head_meta() {
	$desc = get_bloginfo( 'description' );
	if ( ! $desc ) {
		$desc = fmd_mod( 'hero_sub' );
	}
	echo '<meta name="description" content="' . esc_attr( $desc ) . '">' . "\n";
	echo '<meta name="theme-color" content="#ffffff">' . "\n";
	echo '<meta name="format-detection" content="telephone=no">' . "\n";
	echo '<meta property="og:title" content="' . esc_attr( get_bloginfo( 'name' ) ) . ' — Wear Memories">' . "\n";
	echo '<meta property="og:description" content="' . esc_attr( $desc ) . '">' . "\n";
	echo '<meta property="og:type" content="website">' . "\n";
}
add_action( 'wp_head', 'fmd_head_meta', 1 );

/**
 * Send site mail as the business address so booking requests don't land in spam.
 */
function fmd_mail_from() {
	return 'info@familymemoriesdesign.com';
}
add_filter( 'wp_mail_from', 'fmd_mail_from' );

function fmd_mail_from_name() {
	return 'Family Memories Design';
}
add_filter( 'wp_mail_from_name', 'fmd_mail_from_name' );
