<?php
/**
 * B2B: tournament directors.
 *
 * @package fmd
 */

$fmd_points = array(
	'No fee to host us',
	'No minimum orders',
	'Printed on tournament day',
	'Your tournament name and date on the designs',
);
?>
<section class="sec sec--lilac directors" id="directors" aria-labelledby="directors-title">
	<div class="wrap directors__grid">
		<p class="directors__zero" aria-hidden="true">$0</p>
		<div class="directors__body">
			<h2 class="h2" id="directors-title">For tournament directors</h2>
			<p class="lede">We set up a print tent at your event at no cost to you. Families get custom apparel on the spot, and your tournament gets its own merch without ordering inventory.</p>
			<ul class="ticks">
				<?php foreach ( $fmd_points as $fmd_p ) : ?>
					<li><?php echo esc_html( $fmd_p ); ?></li>
				<?php endforeach; ?>
			</ul>
			<a class="btn btn--accent" href="#book" data-role-link="director">Book us for your tournament</a>
		</div>
	</div>
</section>
