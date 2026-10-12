<?php
/**
 * First screen: the proof sheet.
 *
 * @package fmd
 */

$fmd_sports = array( 'Soccer', 'Lacrosse', 'Volleyball', 'Basketball', 'Baseball', 'Softball', 'Flag football', 'Water polo' );
?>
<section class="hero" aria-labelledby="hero-title">
	<div class="wrap">
		<div class="proof hero__proof">
			<?php fmd_crop_marks(); ?>
			<div class="hero__meta mono">
				<span>Proof 001</span>
				<span class="hero__meta-mid">Tournament apparel</span>
				<span><?php echo esc_html( fmd_mod( 'city' ) ); ?></span>
			</div>

			<h1 class="hero__title" id="hero-title" aria-label="Wear memories">
				<span class="hero__row hero__row--a" aria-hidden="true">
					<span class="hero__word" data-fit>WEAR</span>
					<span class="hero__tag">
						<?php fmd_reg_mark( 'reg hero__reg' ); ?>
						<span><?php echo esc_html( fmd_mod( 'hero_tag' ) ); ?></span>
					</span>
				</span>
				<span class="hero__row hero__row--b" aria-hidden="true">
					<span class="hero__word" data-fit-ref>MEMORIES</span>
				</span>
				<span class="hero__pull" aria-hidden="true"></span>
			</h1>
		</div>

		<div class="hero__foot">
			<p class="hero__sub"><?php echo esc_html( fmd_mod( 'hero_sub' ) ); ?></p>
			<div class="hero__ctas">
				<a class="btn btn--accent" href="#book"><?php echo esc_html( fmd_mod( 'cta_primary' ) ); ?></a>
				<a class="btn btn--line" href="#studio"><?php echo esc_html( fmd_mod( 'cta_secondary' ) ); ?></a>
			</div>
		</div>
	</div>

	<div class="ticker" aria-label="Sports we print for">
		<div class="ticker__track">
			<?php for ( $fmd_i = 0; $fmd_i < 2; $fmd_i++ ) : ?>
				<ul class="ticker__list mono" <?php echo $fmd_i ? 'aria-hidden="true"' : ''; ?>>
					<?php foreach ( $fmd_sports as $fmd_sport ) : ?>
						<li><?php echo esc_html( $fmd_sport ); ?></li>
					<?php endforeach; ?>
				</ul>
			<?php endfor; ?>
		</div>
	</div>
</section>
