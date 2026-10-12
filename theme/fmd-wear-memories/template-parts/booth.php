<?php
/**
 * Our booth: the 10×10 tent.
 *
 * @package fmd
 */

$fmd_photo = fmd_mod( 'booth_image' );
?>
<section class="sec booth" id="booth" aria-labelledby="booth-title">
	<div class="wrap booth__grid">
		<header class="sec__head booth__head">
			<h2 class="h2" id="booth-title">Find the tent</h2>
			<p class="lede">Look for our 10×10 tent near the fields. Walk up, pick a design and watch it print.</p>
			<dl class="specs">
				<div><dt class="mono">Footprint</dt><dd>10 × 10 ft</dd></div>
				<div><dt class="mono">Setup</dt><dd>On site, tournament day</dd></div>
				<div><dt class="mono">Based in</dt><dd><?php echo esc_html( fmd_mod( 'city' ) ); ?></dd></div>
			</dl>
		</header>

		<figure class="booth__figure proof">
			<?php fmd_crop_marks(); ?>
			<div class="booth__media">
				<?php if ( $fmd_photo ) : ?>
					<img src="<?php echo esc_url( $fmd_photo ); ?>" alt="The Family Memories Design 10×10 tent set up at a tournament" loading="lazy" decoding="async">
				<?php else : ?>
					<svg class="booth__drawing" viewBox="0 0 600 400" role="img" aria-label="Line drawing of a 10 by 10 foot pop-up tent">
						<g fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="miter">
							<path d="M60 130 L300 50 L540 130 Z"/>
							<path d="M300 50 V130"/>
							<rect x="60" y="130" width="480" height="38"/>
							<path d="M72 168 V352 M528 168 V352"/>
							<rect x="150" y="268" width="300" height="84"/>
							<path d="M150 290 H450"/>
							<rect x="205" y="196" width="70" height="56"/>
							<rect x="325" y="196" width="70" height="56"/>
						</g>
						<text x="300" y="155" text-anchor="middle" class="booth__valance">WEAR MEMORIES</text>
						<g class="dim" stroke-width="1.25">
							<path d="M60 378 H540 M60 370 V386 M540 370 V386"/>
						</g>
						<text x="300" y="384" text-anchor="middle" class="booth__dimtext">10 FT</text>
					</svg>
				<?php endif; ?>
			</div>
			<figcaption class="booth__cap mono">
				<span>10 × 10 ft tent</span>
				<span><?php echo $fmd_photo ? 'Tournament day setup' : 'Photo coming soon'; ?></span>
			</figcaption>
		</figure>
	</div>
</section>
