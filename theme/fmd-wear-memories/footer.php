<?php
/**
 * Site footer.
 *
 * @package fmd
 */

$fmd_base = is_front_page() ? '' : home_url( '/' );
?>
</main>

<footer class="foot">
	<div class="wrap foot__grid">
		<div class="foot__brand">
			<a class="logo logo--foot" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php fmd_logo( 'logo' ); ?></a>
			<p class="foot__slogan">Wear memories.</p>
		</div>
		<dl class="foot__contact">
			<div><dt class="mono">Email</dt><dd><a href="mailto:<?php echo esc_attr( fmd_mod( 'email' ) ); ?>"><?php echo esc_html( fmd_mod( 'email' ) ); ?></a></dd></div>
			<div><dt class="mono">Phone</dt><dd><a href="<?php echo esc_attr( fmd_tel( fmd_mod( 'phone' ) ) ); ?>"><?php echo esc_html( fmd_mod( 'phone' ) ); ?></a></dd></div>
			<div><dt class="mono">Based in</dt><dd><?php echo esc_html( fmd_mod( 'city' ) ); ?></dd></div>
		</dl>
		<nav class="foot__nav" aria-label="<?php esc_attr_e( 'Footer', 'fmd' ); ?>">
			<a href="<?php echo esc_url( $fmd_base . '#studio' ); ?>">3D studio</a>
			<a href="<?php echo esc_url( $fmd_base . '#designs' ); ?>">Designs</a>
			<a href="<?php echo esc_url( $fmd_base . '#prices' ); ?>">Prices</a>
			<a href="<?php echo esc_url( $fmd_base . '#directors' ); ?>">For directors</a>
			<a href="<?php echo esc_url( $fmd_base . '#book' ); ?>">Book us</a>
		</nav>
	</div>
	<div class="wrap foot__legal mono">
		<span>&copy; <?php echo esc_html( gmdate( 'Y' ) ); ?> Family Memories Design</span>
		<a href="#top"><?php esc_html_e( 'Back to top', 'fmd' ); ?></a>
	</div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
