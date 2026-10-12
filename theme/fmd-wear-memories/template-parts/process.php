<?php
/**
 * How it works at the tent — a real sequence, so it is numbered.
 *
 * @package fmd
 */

$fmd_steps = array(
	array( 'Pick', 'Choose a design at the tent, or bring your team logo. Add a name and number if you want them.' ),
	array( 'Press', 'We print it on the spot, on a blank in your size and color.' ),
	array( 'Wear', 'Your player walks away wearing it, usually before the next game starts.' ),
);
?>
<section class="sec process" id="how" aria-labelledby="how-title">
	<div class="wrap">
		<header class="sec__head">
			<h2 class="h2" id="how-title">At the tent</h2>
		</header>
		<ol class="steps">
			<?php foreach ( $fmd_steps as $fmd_i => $fmd_s ) : ?>
				<li class="step">
					<span class="step__num" aria-hidden="true"><?php echo esc_html( sprintf( '%02d', $fmd_i + 1 ) ); ?></span>
					<h3 class="step__title"><?php echo esc_html( $fmd_s[0] ); ?></h3>
					<p class="step__text"><?php echo esc_html( $fmd_s[1] ); ?></p>
				</li>
			<?php endforeach; ?>
		</ol>
	</div>
</section>
