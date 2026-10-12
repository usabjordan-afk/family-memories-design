<?php
/**
 * Appearance → Customize → Wear Memories.
 *
 * @package fmd
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function fmd_customize_register( $wp_customize ) {
	$d = fmd_defaults();

	$wp_customize->add_panel(
		'fmd',
		array(
			'title'       => __( 'Wear Memories', 'fmd' ),
			'description' => __( 'Text, prices, photos and 3D models for the one-page site.', 'fmd' ),
			'priority'    => 30,
		)
	);

	$sections = array(
		'fmd_hero'    => __( 'First screen', 'fmd' ),
		'fmd_prices'  => __( 'Prices (starting at)', 'fmd' ),
		'fmd_booth'   => __( 'Booth photo', 'fmd' ),
		'fmd_models'  => __( '3D studio models (.glb)', 'fmd' ),
		'fmd_contact' => __( 'Contact & booking email', 'fmd' ),
	);
	foreach ( $sections as $id => $title ) {
		$wp_customize->add_section( $id, array( 'title' => $title, 'panel' => 'fmd' ) );
	}

	$text = function ( $key, $label, $section, $type = 'text', $desc = '' ) use ( $wp_customize, $d ) {
		$wp_customize->add_setting(
			$key,
			array(
				'default'           => $d[ $key ],
				'sanitize_callback' => 'email' === $type ? 'sanitize_email' : 'sanitize_text_field',
			)
		);
		$wp_customize->add_control(
			$key,
			array(
				'label'       => $label,
				'section'     => $section,
				'type'        => $type,
				'description' => $desc,
			)
		);
	};

	// First screen.
	$text( 'hero_sub', __( 'Line under WEAR MEMORIES', 'fmd' ), 'fmd_hero' );
	$text( 'hero_tag', __( 'Black tag next to WEAR', 'fmd' ), 'fmd_hero' );
	$text( 'cta_primary', __( 'Main button', 'fmd' ), 'fmd_hero' );
	$text( 'cta_secondary', __( 'Second button', 'fmd' ), 'fmd_hero' );

	// Prices.
	$text( 'price_tee', __( 'T-shirt from', 'fmd' ), 'fmd_prices' );
	$text( 'price_crew', __( 'Crewneck from', 'fmd' ), 'fmd_prices' );
	$text( 'price_hoodie', __( 'Hoodie from', 'fmd' ), 'fmd_prices' );
	$text( 'price_addon', __( 'Name + number add-on', 'fmd' ), 'fmd_prices' );

	// Booth photo.
	$wp_customize->add_setting( 'booth_image', array( 'default' => '', 'sanitize_callback' => 'esc_url_raw' ) );
	$wp_customize->add_control(
		new WP_Customize_Image_Control(
			$wp_customize,
			'booth_image',
			array(
				'label'       => __( '10×10 tent photo', 'fmd' ),
				'description' => __( 'Landscape photo, at least 1600px wide.', 'fmd' ),
				'section'     => 'fmd_booth',
			)
		)
	);

	// 3D models.
	$models = array(
		'model_hoodie' => __( 'Hoodie .glb', 'fmd' ),
		'model_crew'   => __( 'Crewneck .glb', 'fmd' ),
		'model_tee'    => __( 'T-shirt .glb', 'fmd' ),
	);
	foreach ( $models as $key => $label ) {
		$wp_customize->add_setting( $key, array( 'default' => '', 'sanitize_callback' => 'esc_url_raw' ) );
		$wp_customize->add_control(
			new WP_Customize_Upload_Control(
				$wp_customize,
				$key,
				array(
					'label'       => $label,
					'description' => __( 'Upload a .glb file (no Draco compression). Leave empty to use the built-in model.', 'fmd' ),
					'section'     => 'fmd_models',
				)
			)
		);
		$wp_customize->add_setting( $key . '_yaw', array( 'default' => 0, 'sanitize_callback' => 'absint' ) );
		$wp_customize->add_control(
			$key . '_yaw',
			array(
				/* translators: %s: garment label */
				'label'   => sprintf( __( '%s — turn so the front faces the viewer', 'fmd' ), $label ),
				'section' => 'fmd_models',
				'type'    => 'select',
				'choices' => array(
					0   => '0°',
					90  => '90°',
					180 => '180°',
					270 => '270°',
				),
			)
		);
	}

	// Contact.
	$text( 'email', __( 'Booking requests go to', 'fmd' ), 'fmd_contact', 'email' );
	$text( 'phone', __( 'Phone', 'fmd' ), 'fmd_contact' );
	$text( 'city', __( 'City', 'fmd' ), 'fmd_contact' );
	$wp_customize->add_setting( 'autoreply', array( 'default' => 1, 'sanitize_callback' => 'absint' ) );
	$wp_customize->add_control(
		'autoreply',
		array(
			'label'   => __( 'Send a "we got your request" email to the customer', 'fmd' ),
			'section' => 'fmd_contact',
			'type'    => 'checkbox',
		)
	);
}
add_action( 'customize_register', 'fmd_customize_register' );
