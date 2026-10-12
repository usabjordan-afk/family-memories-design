<?php
/**
 * Site header.
 *
 * @package fmd
 */

$fmd_base = is_front_page() ? '' : home_url( '/' );
$fmd_nav  = array(
	'studio'    => __( 'Studio', 'fmd' ),
	'designs'   => __( 'Designs', 'fmd' ),
	'prices'    => __( 'Prices', 'fmd' ),
	'directors' => __( 'Directors', 'fmd' ),
	'booth'     => __( 'Booth', 'fmd' ),
);
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip" href="#main"><?php esc_html_e( 'Skip to content', 'fmd' ); ?></a>

<header class="bar" id="top">
	<div class="bar__in wrap">
		<a class="logo" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?> — home">
			<?php fmd_logo( 'logo' ); ?>
		</a>
		<nav class="nav" aria-label="<?php esc_attr_e( 'Main', 'fmd' ); ?>">
			<?php foreach ( $fmd_nav as $fmd_id => $fmd_label ) : ?>
				<a href="<?php echo esc_url( $fmd_base . '#' . $fmd_id ); ?>"><?php echo esc_html( $fmd_label ); ?></a>
			<?php endforeach; ?>
		</nav>
		<a class="btn btn--accent btn--sm bar__book" href="<?php echo esc_url( $fmd_base . '#book' ); ?>"><?php esc_html_e( 'Book', 'fmd' ); ?></a>
		<button class="menu-btn" type="button" aria-expanded="false" aria-controls="sheet">
			<span class="menu-btn__icon" aria-hidden="true"></span>
			<span class="sr"><?php esc_html_e( 'Menu', 'fmd' ); ?></span>
		</button>
	</div>
</header>

<div class="sheet" id="sheet" hidden>
	<nav class="sheet__nav" aria-label="<?php esc_attr_e( 'Mobile', 'fmd' ); ?>">
		<?php foreach ( $fmd_nav as $fmd_id => $fmd_label ) : ?>
			<a href="<?php echo esc_url( $fmd_base . '#' . $fmd_id ); ?>"><?php echo esc_html( $fmd_label ); ?></a>
		<?php endforeach; ?>
		<a href="<?php echo esc_url( $fmd_base . '#book' ); ?>"><?php esc_html_e( 'Book', 'fmd' ); ?></a>
	</nav>
	<div class="sheet__contact mono">
		<a href="mailto:<?php echo esc_attr( fmd_mod( 'email' ) ); ?>"><?php echo esc_html( fmd_mod( 'email' ) ); ?></a>
		<a href="<?php echo esc_attr( fmd_tel( fmd_mod( 'phone' ) ) ); ?>"><?php echo esc_html( fmd_mod( 'phone' ) ); ?></a>
	</div>
</div>

<main id="main" class="site">
