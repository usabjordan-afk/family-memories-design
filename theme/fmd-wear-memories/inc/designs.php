<?php
/**
 * Design library: wp-admin → Designs. Each design = title + featured image.
 * Until you add your own, eight built-in tournament designs are shown.
 *
 * @package fmd
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function fmd_register_design_type() {
	register_post_type(
		'fmd_design',
		array(
			'labels'        => array(
				'name'          => __( 'Designs', 'fmd' ),
				'singular_name' => __( 'Design', 'fmd' ),
				'add_new_item'  => __( 'Add design', 'fmd' ),
				'edit_item'     => __( 'Edit design', 'fmd' ),
			),
			'public'        => false,
			'show_ui'       => true,
			'menu_icon'     => 'dashicons-art',
			'menu_position' => 21,
			'supports'      => array( 'title', 'thumbnail', 'page-attributes' ),
			'description'   => __( 'Use a transparent PNG for the featured image. Order controls the number (Design 01, 02…).', 'fmd' ),
		)
	);
}
add_action( 'init', 'fmd_register_design_type' );

/**
 * List of designs for the catalogue and the 3D studio.
 *
 * @return array[] { num, title, src, custom }
 */
function fmd_get_designs() {
	$out   = array();
	$posts = get_posts(
		array(
			'post_type'      => 'fmd_design',
			'post_status'    => 'publish',
			'posts_per_page' => 24,
			'orderby'        => array( 'menu_order' => 'ASC', 'date' => 'ASC' ),
			'meta_key'       => '_thumbnail_id', // phpcs:ignore WordPress.DB.SlowDBQuery
		)
	);
	$i = 1;
	foreach ( $posts as $p ) {
		$src = get_the_post_thumbnail_url( $p, 'large' );
		if ( ! $src ) {
			continue;
		}
		$out[] = array(
			'num'    => sprintf( '%02d', $i++ ),
			'title'  => get_the_title( $p ),
			'src'    => $src,
			'custom' => true,
		);
	}
	if ( $out ) {
		return $out;
	}
	$builtin = array( 'Field Day', 'Wear Memories', 'Championship 26', 'All Star', 'Play Hard', 'Sideline Crew', 'Finals Weekend', 'MVP' );
	foreach ( $builtin as $k => $title ) {
		$num   = sprintf( '%02d', $k + 1 );
		$out[] = array(
			'num'    => $num,
			'title'  => $title,
			'src'    => FMD_URI . '/assets/img/designs/design-' . $num . '.svg',
			'custom' => false,
		);
	}
	return $out;
}
