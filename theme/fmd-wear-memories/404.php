<?php
/**
 * Not found.
 *
 * @package fmd
 */

get_header();
?>
<section class="sec page">
	<div class="wrap page__wrap">
		<p class="mono">Error 404</p>
		<h1 class="h2"><?php esc_html_e( 'This page is not on the print list', 'fmd' ); ?></h1>
		<p class="lede"><?php esc_html_e( 'The link may be old. Everything lives on the home page.', 'fmd' ); ?></p>
		<a class="btn btn--accent" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Go to the home page', 'fmd' ); ?></a>
	</div>
</section>
<?php
get_footer();
